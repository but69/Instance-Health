import { ScriptOnlyCheck, TableCheck } from '@servicenow/sdk/core'

// IH-001: every published report is a finding
export const ih001PublicReports = TableCheck({
    $id: Now.ID['ih-001-public-reports'],
    name: 'IH-001 Reports published to public',
    active: true,
    category: 'security',
    priority: '2',
    shortDescription: 'Finds reports that are published to public',
    description:
        'Published reports get a public URL and can be viewed without logging in. Ideal state: no report is published to public.',
    table: 'sys_report',
    conditions: 'is_published=true',
    resolutionDetails:
        'Unpublish the report, or share it with the required roles or groups instead of publishing it.',
})

// IH-018: tables without an active record ACL on the table or any parent table.
// Table rotation shards (name ends in 4 digits) and wildcard (*) ACLs are ignored.
export const ih018TablesWithoutAcls = ScriptOnlyCheck({
    $id: Now.ID['ih-018-tables-without-acls'],
    name: 'IH-018 Tables without ACLs',
    active: true,
    category: 'security',
    priority: '2',
    shortDescription: 'Finds tables that are not secured by any ACL, neither their own nor a parent table\'s',
    description:
        'A table without record ACLs is only protected by wildcard rules and the default deny setting. Checks all tables; ACLs on a parent table count as protection. Table rotation shards (for example syslog0001) are ignored because they are covered by their base table. Ideal state: every table is secured by ACLs.',
    script: `(function(engine) {
    var protectedTables = {};
    var acl = new GlideAggregate('sys_security_acl');
    acl.addQuery('type', 'record');
    acl.addActiveQuery();
    acl.groupBy('name');
    acl.addAggregate('COUNT');
    acl.query();
    while (acl.next()) {
        var aclName = acl.getValue('name') || '';
        var aclTable = aclName.split('.')[0];
        if (aclTable && aclTable != '*') protectedTables[aclTable] = true;
    }

    var nameById = {};
    var parentIdByName = {};
    var tableIdByName = {};
    var tables = new GlideRecord('sys_db_object');
    tables.query();
    while (tables.next()) {
        var tableName = tables.getValue('name');
        nameById[tables.getUniqueValue()] = tableName;
        parentIdByName[tableName] = tables.getValue('super_class');
        tableIdByName[tableName] = tables.getUniqueValue();
    }

    function inheritsAcl(tableName) {
        var parent = nameById[parentIdByName[tableName]];
        for (var depth = 0; parent && depth < 20; depth++) {
            if (protectedTables[parent]) return true;
            parent = nameById[parentIdByName[parent]];
        }
        return false;
    }

    for (var name in tableIdByName) {
        if (!name || protectedTables[name]) continue;
        if (/\\d{4}$/.test(name)) continue;
        if (inheritsAcl(name)) continue;
        var table = new GlideRecord('sys_db_object');
        if (!table.get(tableIdByName[name])) continue;
        engine.finding.setCurrentSource(table);
        engine.finding.setValue('finding_details', 'Table ' + name + ' has no active record ACL, and none of its parent tables has one');
        engine.finding.increment();
    }
})(engine);`,
    resolutionDetails:
        'Create record ACLs (at least read, write, create and delete) for the roles that need access, or confirm that the table is intentionally covered by wildcard ACLs only.',
})

// IH-030: the virtual flag is defined on many CI classes (not on cmdb_ci); check every top-most
// class that defines it for virtual CIs that have an asset
export const ih030VirtualCisWithAssets = ScriptOnlyCheck({
    $id: Now.ID['ih-030-virtual-cis-with-assets'],
    name: 'IH-030 Virtual CIs with assets',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Finds CIs flagged as virtual that have an asset',
    description:
        'Virtual CIs (virtual machines, virtual network devices) are not physical hardware and should not create or keep assets; such assets distort license, cost and inventory data. Checks every CI class that has the Virtual flag. Ideal state: no virtual CI has an asset.',
    script: `(function(engine) {
    var parentCache = {};
    function parentOf(table) {
        if (parentCache.hasOwnProperty(table)) return parentCache[table];
        var obj = new GlideRecord('sys_db_object');
        var parent = obj.get('name', table) && obj.getValue('super_class') ? obj.super_class.name + '' : '';
        parentCache[table] = parent;
        return parent;
    }

    // Classes that define the field "virtual" themselves
    var defines = {};
    var dict = new GlideRecord('sys_dictionary');
    dict.addQuery('element', 'virtual');
    dict.addQuery('name', 'STARTSWITH', 'cmdb_ci');
    dict.query();
    while (dict.next()) defines[dict.getValue('name')] = true;

    // Keep only the top-most ones; their queries include all child classes
    for (var table in defines) {
        var inherited = false;
        for (var p = parentOf(table), depth = 0; p && depth < 20; p = parentOf(p), depth++)
            if (defines[p]) { inherited = true; break; }
        if (inherited) continue;

        var ci = new GlideRecord(table);
        if (!ci.isValid()) continue;
        ci.addQuery('virtual', true);
        ci.addNotNullQuery('asset');
        ci.query();
        while (ci.next()) {
            engine.finding.setCurrentSource(ci);
            engine.finding.setValue('finding_details', ci.getClassDisplayValue() + ' ' + ci.getDisplayValue() + ' is virtual but has asset ' + ci.asset.getDisplayValue());
            engine.finding.increment();
        }
    }
})(engine);`,
    resolutionDetails:
        'Retire or delete the asset of the virtual CI and check the model and model category, so that virtual CIs do not create assets.',
})

// IH-031: computers and network gear (all subclasses) without serial number, retired CIs excluded
export const ih031MissingSerialNumbers = TableCheck({
    $id: Now.ID['ih-031-missing-serial-numbers'],
    name: 'IH-031 Computers and network gear without serial number',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Finds computers and network gear without a serial number',
    description:
        'The serial number is the main identification attribute for hardware: without it, Discovery and imports cannot match the CI reliably and duplicates are created. Checks all computer and network gear classes, discovered or not; retired CIs are ignored. Ideal state: every computer and network gear CI has a serial number.',
    table: 'cmdb_ci_hardware',
    conditions: 'sys_class_nameINSTANCEOFcmdb_ci_computer^ORsys_class_nameINSTANCEOFcmdb_ci_netgear^serial_numberISEMPTY^install_status!=7',
    resolutionDetails:
        'Populate the serial number through Discovery, an import or manually, and check the identification rules of the class.',
})

// IH-032: the Asset Management rules on cmdb_ci that create assets must be active
export const ih032CreateAssetRules = ScriptOnlyCheck({
    $id: Now.ID['ih-032-create-asset-rules'],
    name: 'IH-032 Create Asset business rules active',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Checks that the Asset Management rules that create assets for CIs are active',
    description:
        'The business rules "Create Asset on insert" and "Create asset on model change" on cmdb_ci create the asset for a new CI or a CI whose model changes. If they are inactive, CMDB and asset data drift apart. No finding if Asset Management is not installed. Ideal state: both rules are active.',
    script: `(function(engine) {
    var names = ['Create Asset on insert', 'Create asset on model change'];
    for (var i = 0; i < names.length; i++) {
        var rule = new GlideRecord('sys_script');
        rule.addQuery('collection', 'cmdb_ci');
        rule.addQuery('name', names[i]);
        rule.query();
        if (!rule.next() || rule.active == true) continue;
        engine.finding.setCurrentSource(rule);
        engine.finding.setValue('finding_details', 'Business rule "' + names[i] + '" on cmdb_ci is inactive');
        engine.finding.increment();
    }
})(engine);`,
    resolutionDetails:
        'Activate the business rule, then check CIs created while it was inactive for missing assets.',
})

// IH-033: discovery source set but not in the choice list; empty values are not a finding (user decision)
export const ih033InvalidDiscoverySource = ScriptOnlyCheck({
    $id: Now.ID['ih-033-invalid-discovery-source'],
    name: 'IH-033 CIs with an invalid discovery source',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Finds CIs whose discovery source is not a value of the choice list',
    description:
        'The discovery source tells which source owns a CI; reports and reconciliation rely on the values of the choice list. CIs without a discovery source and retired CIs are not reported. Ideal state: every discovery source set on a CI is a value of the cmdb_ci discovery_source choice list.',
    script: `(function(engine) {
    var valid = {};
    var choice = new GlideRecord('sys_choice');
    choice.addQuery('name', 'cmdb_ci');
    choice.addQuery('element', 'discovery_source');
    choice.addQuery('inactive', false);
    choice.query();
    while (choice.next()) valid[choice.getValue('value')] = true;

    var values = new GlideAggregate('cmdb_ci');
    values.addNotNullQuery('discovery_source');
    values.addQuery('install_status', '!=', '7');
    values.groupBy('discovery_source');
    values.addAggregate('COUNT');
    values.query();
    while (values.next()) {
        var value = values.getValue('discovery_source');
        if (valid[value]) continue;
        var ci = new GlideRecord('cmdb_ci');
        ci.addQuery('discovery_source', value);
        ci.addQuery('install_status', '!=', '7');
        ci.query();
        while (ci.next()) {
            engine.finding.setCurrentSource(ci);
            engine.finding.setValue('finding_details', ci.getClassDisplayValue() + ' ' + ci.getDisplayValue() + ' has discovery source "' + value + '", which is not in the choice list');
            engine.finding.increment();
        }
    }
})(engine);`,
    resolutionDetails:
        'Set a valid discovery source on the CI and fix the import, integration or script that writes the invalid value; add a choice only if the source is a real, permanent data source.',
})

// IH-034: impersonate button enabled on an instance flagged as production
export const ih034ImpersonationInProduction = ScriptOnlyCheck({
    $id: Now.ID['ih-034-impersonation-in-production'],
    name: 'IH-034 Impersonation in production',
    active: true,
    category: 'security',
    priority: '2',
    shortDescription: 'Checks that impersonation is switched off on production instances',
    description:
        'Impersonation lets a user act with the rights and data access of another user. On a production instance (glide.installation.production = true) the impersonate button should be disabled (glide.ui.impersonate_button.enable = false). The finding lists the users with the impersonator role. Ideal state: no impersonation in production.',
    script: `(function(engine) {
    function property(name) {
        var prop = new GlideRecord('sys_properties');
        return prop.get('name', name) ? prop : null;
    }
    var production = property('glide.installation.production');
    if (!production || production.getValue('value') != 'true') return;
    var button = property('glide.ui.impersonate_button.enable');
    if (button && button.getValue('value') == 'false') return;

    var holders = [];
    var role = new GlideRecord('sys_user_has_role');
    role.addQuery('role.name', 'impersonator');
    role.addQuery('user.active', true);
    role.query();
    while (role.next()) {
        var name = role.user.getDisplayValue();
        if (holders.indexOf(name) == -1) holders.push(name);
    }

    engine.finding.setCurrentSource(button || production);
    engine.finding.setValue('finding_details', 'Production instance with the impersonate button enabled (glide.ui.impersonate_button.enable = ' +
        (button ? button.getValue('value') : 'not set') + '). Active users with the impersonator role: ' + (holders.length ? holders.slice(0, 10).join(', ') + (holders.length > 10 ? ', ...' : '') : 'none (admins can still impersonate)'));
    engine.finding.increment();
})(engine);`,
    resolutionDetails:
        'Set glide.ui.impersonate_button.enable to false on the production instance and remove the impersonator role where it is not needed.',
})

// IH-036: active knowledge bases whose retire workflow is empty or points to a workflow that does
// not exist (seen on bithawkdemo1: 6 of 7 knowledge bases reference a deleted workflow)
export const ih036KnowledgeBaseRetireWorkflow = TableCheck({
    $id: Now.ID['ih-036-knowledge-base-retire-workflow'],
    name: 'IH-036 Knowledge bases without retire workflow',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Finds active knowledge bases without a working retire workflow',
    description:
        'Without a retire workflow, outdated articles cannot be retired in a controlled way. Reported when the retire workflow is empty or references a workflow that no longer exists. Ideal state: every active knowledge base has an existing retire workflow.',
    table: 'kb_knowledge_base',
    conditions: 'active=true',
    advanced: true,
    script: `(function(engine, current) {
    var workflowId = current.getValue('retire_workflow');
    var details;
    if (!workflowId) {
        details = 'No retire workflow assigned';
    } else {
        var workflow = new GlideRecord('wf_workflow');
        if (workflow.get(workflowId)) return;
        details = 'Retire workflow ' + workflowId + ' does not exist (deleted workflow)';
    }
    engine.finding.setCurrentSource(current);
    engine.finding.setValue('finding_details', details);
    engine.finding.increment();
})(engine, current);`,
    resolutionDetails:
        'Assign a retire workflow to the knowledge base (an instant retire workflow or one with approval).',
})

// IH-040: memberships of inactive users in active groups
export const ih040InactiveGroupMembers = TableCheck({
    $id: Now.ID['ih-040-inactive-group-members'],
    name: 'IH-040 Inactive users in groups',
    active: true,
    category: 'security',
    priority: '2',
    shortDescription: 'Finds inactive users that are still members of active groups',
    description:
        'Inactive members keep their group memberships, distort assignment and approval lists and get their roles back when they are reactivated. Ideal state: active groups have no inactive members.',
    table: 'sys_user_grmember',
    conditions: 'user.active=false^group.active=true',
    resolutionDetails:
        'Remove the membership (offboarding should remove group memberships of deactivated users).',
})

// IH-041: active groups whose manager is inactive
export const ih041InactiveGroupManager = TableCheck({
    $id: Now.ID['ih-041-inactive-group-manager'],
    name: 'IH-041 Groups with an inactive manager',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Finds active groups whose manager is inactive',
    description:
        'Group managers approve and receive escalations; an inactive manager blocks these processes. Ideal state: every active group has an active manager.',
    table: 'sys_user_group',
    conditions: 'active=true^manager.active=false',
    resolutionDetails:
        'Assign an active manager to the group.',
})

// IH-042: active groups without any member
export const ih042GroupsWithoutMembers = TableCheck({
    $id: Now.ID['ih-042-groups-without-members'],
    name: 'IH-042 Groups without members',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Finds active groups without members',
    description:
        'Tasks assigned to a group without members are not worked on. Ideal state: every active group has at least one member.',
    table: 'sys_user_group',
    conditions: 'active=true',
    advanced: true,
    script: `(function(engine, current) {
    var member = new GlideRecord('sys_user_grmember');
    member.addQuery('group', current.getUniqueValue());
    member.setLimit(1);
    member.query();
    if (member.hasNext()) return;
    engine.finding.setCurrentSource(current);
    engine.finding.increment();
})(engine, current);`,
    resolutionDetails:
        'Add members to the group or deactivate it.',
})

// IH-043: roles assigned directly to active users; snc_internal / snc_external are assigned by the platform
export const ih043DirectRoleAssignments = TableCheck({
    $id: Now.ID['ih-043-direct-role-assignments'],
    name: 'IH-043 Roles assigned directly to users',
    active: true,
    category: 'security',
    priority: '2',
    shortDescription: 'Finds roles that are assigned directly to active users instead of through a group',
    description:
        'Roles assigned directly to users are hard to review and are not removed when the user changes teams. snc_internal and snc_external are ignored because the platform assigns them to every user. Ideal state: users get roles only through groups.',
    table: 'sys_user_has_role',
    // granted_by defaults to "not-applicable", so it cannot be used to detect direct assignments
    conditions: 'inherited=false^user.active=true^role.nameNOT INsnc_internal,snc_external',
    resolutionDetails:
        'Remove the direct role and add the user to a group that grants the role.',
})

// IH-044: active groups that grant roles but have no group type (any type is enough, user decision)
export const ih044RoleGroupsWithoutType = TableCheck({
    $id: Now.ID['ih-044-role-groups-without-type'],
    name: 'IH-044 Groups with roles without a group type',
    active: true,
    category: 'security',
    priority: '2',
    shortDescription: 'Finds active groups that grant roles but have no group type',
    description:
        'Groups that grant roles should carry a group type (for example "Authorization"), so role-granting groups can be told apart from assignment groups and reviewed. Ideal state: every active group with roles has a group type.',
    table: 'sys_user_group',
    conditions: 'active=true^typeISEMPTY',
    advanced: true,
    script: `(function(engine, current) {
    var roles = [];
    var groupRole = new GlideRecord('sys_group_has_role');
    groupRole.addQuery('group', current.getUniqueValue());
    groupRole.query();
    while (groupRole.next()) roles.push(groupRole.role.getDisplayValue());
    if (roles.length == 0) return;
    engine.finding.setCurrentSource(current);
    engine.finding.setValue('finding_details', 'Group grants ' + roles.length + ' role(s) but has no type: ' + roles.slice(0, 5).join(', ') + (roles.length > 5 ? ', ...' : ''));
    engine.finding.increment();
})(engine, current);`,
    resolutionDetails:
        'Set a group type (for example an "Authorization" type) on the group, or move the roles to a dedicated role-granting group.',
})
