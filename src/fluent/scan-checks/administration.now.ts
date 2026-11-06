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

// IH-017: tables without an active record ACL on the table or any parent table.
// Table rotation shards (name ends in 4 digits) and wildcard (*) ACLs are ignored.
export const ih018TablesWithoutAcls = ScriptOnlyCheck({
    $id: Now.ID['ih-018-tables-without-acls'],
    name: 'IH-017 Tables without ACLs',
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
    // addActiveQuery() is not allowed on GlideAggregate in a scoped app (failed in scan SR00014613)
    acl.addQuery('active', true);
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

// IH-029: the virtual flag is defined on many CI classes (not on cmdb_ci); check every top-most
// class that defines it for virtual CIs that have an asset
export const ih030VirtualCisWithAssets = ScriptOnlyCheck({
    $id: Now.ID['ih-030-virtual-cis-with-assets'],
    name: 'IH-029 Virtual CIs with assets',
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

// IH-030: computers and network gear (all subclasses) without serial number, retired CIs excluded
export const ih031MissingSerialNumbers = TableCheck({
    $id: Now.ID['ih-031-missing-serial-numbers'],
    name: 'IH-030 Computers and network gear without serial number',
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

// IH-058: glide.security.ui.filter must not exist or must be false (user's draft)
export const ih060SecurityUiFilter = TableCheck({
    $id: Now.ID['ih-060-security-ui-filter'],
    name: 'IH-058 Property glide.security.ui.filter set to true',
    active: true,
    category: 'security',
    priority: '2',
    shortDescription: 'Checks that glide.security.ui.filter does not exist or is false',
    description:
        'glide.security.ui.filter should not exist or be set to false. Ideal state: the property does not exist or is false.',
    table: 'sys_properties',
    conditions: 'name=glide.security.ui.filter^value=true',
    resolutionDetails:
        'Delete the property glide.security.ui.filter or set it to false.',
})

// IH-064: active, non-web-service users without login for 90 days (or never, created 90+ days ago)
export const ih067UsersWithoutLogin = TableCheck({
    $id: Now.ID['ih-067-users-without-login'],
    name: 'IH-064 Active user accounts without login',
    active: true,
    category: 'security',
    priority: '2',
    shortDescription: 'Finds active user accounts that have not logged in for 90 days',
    description:
        'Unused active accounts keep their roles and data access and are a target for misuse. Reports active users (not web service only) whose last login is older than 90 days, or who never logged in and were created more than 90 days ago. Ideal state: unused accounts are deactivated.',
    table: 'sys_user',
    conditions: 'active=true^web_service_access_only=false',
    advanced: true,
    script: `(function(engine, current) {
    var DAYS = 90;
    var since = new GlideDateTime();
    since.addDaysUTC(-DAYS);
    var lastLogin = current.getValue('last_login_time');
    var details;
    if (lastLogin) {
        if (!new GlideDateTime(lastLogin).before(since)) return;
        details = 'Last login ' + lastLogin;
    } else {
        if (!new GlideDateTime(current.getValue('sys_created_on')).before(since)) return;
        details = 'Never logged in, created ' + current.getValue('sys_created_on');
    }
    engine.finding.setCurrentSource(current);
    engine.finding.setValue('finding_details', details + ' (no login for more than ' + DAYS + ' days)');
    engine.finding.increment();
})(engine, current);`,
    resolutionDetails:
        'Deactivate the account through the offboarding process (remove roles and group memberships), or mark technical accounts as web service only.',
})

// IH-067: the update set table must be audited (only sys_update_set, user decision)
export const ih070UpdateSetAudit = ScriptOnlyCheck({
    $id: Now.ID['ih-070-update-set-audit'],
    name: 'IH-067 Update set table not audited',
    active: true,
    category: 'security',
    priority: '2',
    shortDescription: 'Checks that changes to update sets are audited',
    description:
        'Without auditing on sys_update_set, nobody can trace who changed the state, name or content of an update set. Ideal state: auditing is enabled on the sys_update_set table.',
    script: `(function(engine) {
    var collection = new GlideRecord('sys_dictionary');
    collection.addQuery('name', 'sys_update_set');
    collection.addNullQuery('element');
    collection.query();
    if (!collection.next() || collection.audit == true) return;
    engine.finding.setCurrentSource(collection);
    engine.finding.setValue('finding_details', 'Auditing is disabled on table sys_update_set');
    engine.finding.increment();
})(engine);`,
    resolutionDetails:
        'Enable Audit on the dictionary collection entry of sys_update_set.',
})

// IH-070: share of unique location names (should be 100 %); one summary finding below 100 %
export const ih073UniqueLocationNames = ScriptOnlyCheck({
    $id: Now.ID['ih-073-unique-location-names'],
    name: 'IH-070 Share of unique location names',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Reports the share of unique location names when it is below 100%',
    description:
        'Locations are matched by name in imports, integrations and forms; duplicate names lead to wrong references. The finding shows the share of unique names and the duplicate names. Ideal state: 100% of location names are unique.',
    script: `(function(engine) {
    var total = new GlideAggregate('cmn_location');
    total.addAggregate('COUNT');
    total.query();
    var count = total.next() ? parseInt(total.getAggregate('COUNT'), 10) : 0;
    if (count == 0) return;

    var names = new GlideAggregate('cmn_location');
    names.groupBy('name');
    names.addAggregate('COUNT');
    names.query();
    var unique = 0;
    var duplicates = [];
    while (names.next()) {
        unique++;
        var n = parseInt(names.getAggregate('COUNT'), 10);
        if (n > 1) duplicates.push('"' + names.getValue('name') + '" x' + n);
    }
    if (unique >= count) return;

    var table = new GlideRecord('sys_db_object');
    if (!table.get('name', 'cmn_location')) return;
    engine.finding.setCurrentSource(table);
    engine.finding.setValue('finding_details', (unique * 100 / count).toFixed(1) + '% unique location names (' + unique + ' names for ' + count + ' locations). Duplicates: ' + duplicates.slice(0, 20).join(', ') + (duplicates.length > 20 ? ', ...' : ''));
    engine.finding.increment();
})(engine);`,
    resolutionDetails:
        'Merge duplicate locations (move references to the one that stays) or give them distinct names.',
})

// IH-071: hardware, application and VM instance CIs (incl. subclasses) without name
export const ih074CisWithoutName = TableCheck({
    $id: Now.ID['ih-074-cis-without-name'],
    name: 'IH-071 Hardware, application and VM instance CIs without name',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Finds hardware, application and VM instance CIs without a name',
    description:
        'CIs without a name cannot be found or selected by users and break identification and reports. Checks hardware, application and VM instance classes including their subclasses. Ideal state: every such CI has a name.',
    table: 'cmdb_ci',
    conditions: 'nameISEMPTY^sys_class_nameINSTANCEOFcmdb_ci_hardware^ORsys_class_nameINSTANCEOFcmdb_ci_appl^ORsys_class_nameINSTANCEOFcmdb_ci_vm_instance',
    resolutionDetails:
        'Set the name (from Discovery, the import source or manually) and check the identification rules of the class.',
})

// IH-046: catalog tasks without requested item or request
export const ih048OrphanedCatalogTasks = TableCheck({
    $id: Now.ID['ih-048-orphaned-catalog-tasks'],
    name: 'IH-046 Catalog tasks without requested item or request',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Finds catalog tasks that are not linked to a requested item and a request',
    description:
        'Catalog tasks outside the request hierarchy are missing in request reporting, approvals and fulfillment flows. Ideal state: every catalog task is linked to a requested item and a request.',
    table: 'sc_task',
    conditions: 'request_itemISEMPTY^ORrequestISEMPTY',
    resolutionDetails:
        'Link the task to its requested item (which sets the request), and create catalog tasks only through the catalog fulfillment process.',
})

// IH-047: active scheduled jobs whose run_as user does not exist (all jobs, user decision)
export const ih049JobsRunAsDeletedUser = TableCheck({
    $id: Now.ID['ih-049-jobs-run-as-deleted-user'],
    name: 'IH-047 Active scheduled jobs run as a deleted user',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Finds active scheduled jobs whose Run as user does not exist',
    description:
        'A scheduled job that runs as a user who no longer exists may fail or run with unexpected rights. The internal users "system" and "maint" are accepted. ServiceNow jobs are included. Ideal state: every active scheduled job runs as an existing user.',
    table: 'sysauto',
    conditions: 'active=true^run_asISNOTEMPTY',
    advanced: true,
    script: `(function(engine, current) {
    var runAs = current.getValue('run_as');
    if (new x_bits2_inst_hlth.IHScanUtil().resolveRunAs(runAs).state != 'missing') return;
    engine.finding.setCurrentSource(current);
    engine.finding.setValue('finding_details', current.getClassDisplayValue() + ' runs as "' + runAs + '", which is not an existing user');
    engine.finding.increment();
})(engine, current);`,
    resolutionDetails:
        'Set Run as to an existing (service) user, or deactivate the job if it is no longer needed.',
})

// IH-048: active scheduled jobs whose run_as user is inactive
export const ih050JobsRunAsInactiveUser = TableCheck({
    $id: Now.ID['ih-050-jobs-run-as-inactive-user'],
    name: 'IH-048 Active scheduled jobs run as an inactive user',
    active: true,
    category: 'security',
    priority: '2',
    shortDescription: 'Finds active scheduled jobs whose Run as user is inactive',
    description:
        'A job that runs as an inactive user keeps using the rights of a deactivated account, which bypasses offboarding. Ideal state: no active scheduled job runs as an inactive user.',
    table: 'sysauto',
    conditions: 'active=true^run_asISNOTEMPTY',
    advanced: true,
    script: `(function(engine, current) {
    var resolved = new x_bits2_inst_hlth.IHScanUtil().resolveRunAs(current.getValue('run_as'));
    if (resolved.state != 'inactive') return;
    engine.finding.setCurrentSource(current);
    engine.finding.setValue('finding_details', current.getClassDisplayValue() + ' runs as inactive user ' + resolved.user.getValue('user_name'));
    engine.finding.increment();
})(engine, current);`,
    resolutionDetails:
        'Set Run as to an active service user that has only the roles the job needs.',
})

// IH-049: active tasks opened by an inactive user. ScriptOnlyCheck since 2026-11-06 (new key 079, was the
// TableCheck ih-051): the scan engine skips the base table task ("exclusion list or too large to scan")
// and only scans its child tables, so records of class task itself were missed (SR00014613).
export const ih079TasksOpenedByInactiveUser = ScriptOnlyCheck({
    $id: Now.ID['ih-079-tasks-opened-by-inactive-user'],
    name: 'IH-049 Active tasks opened by an inactive user',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Finds active tasks whose Opened by user is inactive',
    description:
        'Notifications and follow-up questions for these tasks go to a user who has left. Ideal state: no active task is opened by an inactive user.',
    script: `(function(engine) {
    var task = new GlideRecord('task');
    task.addEncodedQuery('active=true^opened_by.active=false');
    task.query();
    while (task.next()) {
        engine.finding.setCurrentSource(task);
        engine.finding.setValue('finding_details', task.getClassDisplayValue() + ' ' + task.getValue('number') + ' opened by inactive user ' + task.opened_by.getDisplayValue());
        engine.finding.increment();
    }
})(engine);`,
    resolutionDetails:
        'Check whether the task is still needed and hand it over to an active caller or requester.',
})

// IH-050: glide.system.locale is empty (default) or <language>[.|_<COUNTRY>] with ISO codes
export const ih052SystemLocale = ScriptOnlyCheck({
    $id: Now.ID['ih-052-system-locale'],
    name: 'IH-050 System locale is valid',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Checks that glide.system.locale is empty or a valid locale',
    description:
        'An invalid system locale breaks date, time and number formats. The value must be empty (platform default) or a language code with an optional country code, for example de.CH. Scoped scripts cannot read the Java locale list, so the check uses ISO language format and the countries in core_country. Ideal state: glide.system.locale is empty or a valid locale.',
    script: `(function(engine) {
    var property = new GlideRecord('sys_properties');
    if (!property.get('name', 'glide.system.locale')) return;
    var value = property.getValue('value');
    if (!value) return;

    var reason = '';
    var match = /^([a-z]{2,3})(?:[._]([A-Za-z]{2}))?$/.exec(value);
    if (!match) {
        reason = 'not in the format language or language.COUNTRY (for example de.CH)';
    } else if (match[2]) {
        var country = new GlideRecord('core_country');
        if (!country.get('iso3166_2', match[2].toUpperCase())) reason = 'unknown country code ' + match[2];
    }
    if (!reason) return;
    engine.finding.setCurrentSource(property);
    engine.finding.setValue('finding_details', 'glide.system.locale is "' + value + '": ' + reason);
    engine.finding.increment();
})(engine);`,
    resolutionDetails:
        'Set glide.system.locale to a valid locale such as de.CH or en.US, or clear it to use the platform default.',
})

// IH-051: single currency mode on with a valid code, or off while several currencies are active
export const ih053SingleCurrencyMode = ScriptOnlyCheck({
    $id: Now.ID['ih-053-single-currency-mode'],
    name: 'IH-051 Single currency mode configured correctly',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Checks the single currency settings against the active currencies',
    description:
        'With single currency mode on, all currency values use glide.i18n.single_currency.code, which must be an active currency. With only one active currency, single currency mode should be on, otherwise users can enter amounts in currencies that are not maintained. Ideal state: the mode and the code match the active currencies.',
    script: `(function(engine) {
    function property(name) {
        var prop = new GlideRecord('sys_properties');
        return prop.get('name', name) ? prop : null;
    }
    var mode = property('glide.i18n.single_currency');
    var code = property('glide.i18n.single_currency.code');
    var singleCurrency = mode && mode.getValue('value') == 'true';
    var codeValue = code ? code.getValue('value') : '';

    var active = [];
    var currency = new GlideRecord('fx_currency');
    currency.addActiveQuery();
    currency.query();
    while (currency.next()) active.push(currency.getValue('code'));

    var details = '';
    var source = mode;
    if (singleCurrency && !codeValue) {
        details = 'Single currency mode is on, but glide.i18n.single_currency.code is empty';
        source = code || mode;
    } else if (singleCurrency && active.indexOf(codeValue) == -1) {
        details = 'Single currency mode is on, but the code ' + codeValue + ' is not an active currency';
        source = code || mode;
    } else if (!singleCurrency && active.length == 1) {
        details = 'Single currency mode is off, but only one currency is active (' + active[0] + ')';
    }
    if (!details || !source) return;
    engine.finding.setCurrentSource(source);
    engine.finding.setValue('finding_details', details + '. Active currencies: ' + (active.join(', ') || 'none'));
    engine.finding.increment();
})(engine);`,
    resolutionDetails:
        'Set glide.i18n.single_currency.code to an active currency, or switch single currency mode on when only one currency is used.',
})

// IH-052: mark_resolved on incident active, and resolved/closed incidents have Resolved and Resolved by
export const ih054MarkResolved = ScriptOnlyCheck({
    $id: Now.ID['ih-054-mark-resolved'],
    name: 'IH-052 Resolved fields set by mark_resolved',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Checks the mark_resolved rule and resolved incidents without Resolved or Resolved by',
    description:
        'The business rule mark_resolved fills Resolved and Resolved by when an incident is resolved. If it is missing or inactive, resolution reporting and SLAs are wrong. Reports the rule when it is missing or inactive, and every resolved or closed incident without these fields. Ideal state: the rule is active and every resolved incident has both fields.',
    script: `(function(engine) {
    var rule = new GlideRecord('sys_script');
    rule.addQuery('collection', 'incident');
    rule.addQuery('name', 'mark_resolved');
    rule.query();
    var hasRule = rule.next();
    if (hasRule && rule.active != true) {
        engine.finding.setCurrentSource(rule);
        engine.finding.setValue('finding_details', 'Business rule mark_resolved on incident is inactive');
        engine.finding.increment();
    } else if (!hasRule) {
        var table = new GlideRecord('sys_db_object');
        if (table.get('name', 'incident')) {
            engine.finding.setCurrentSource(table);
            engine.finding.setValue('finding_details', 'Business rule mark_resolved on incident does not exist');
            engine.finding.increment();
        }
    }

    var incident = new GlideRecord('incident');
    incident.addEncodedQuery('stateIN6,7^resolved_atISEMPTY^ORresolved_byISEMPTY');
    incident.query();
    while (incident.next()) {
        var missing = [];
        if (!incident.getValue('resolved_at')) missing.push('Resolved');
        if (!incident.getValue('resolved_by')) missing.push('Resolved by');
        engine.finding.setCurrentSource(incident);
        engine.finding.setValue('finding_details', incident.getDisplayValue('state') + ' incident without ' + missing.join(' and '));
        engine.finding.increment();
    }
})(engine);`,
    resolutionDetails:
        'Activate the business rule mark_resolved (revert customizations), then fill Resolved and Resolved by on the affected incidents.',
})

// IH-053: problems have no mark_closed rule in this release; "Update fields on Problem Closure" sets
// Closed and Closed by. Reports the rule when missing/inactive and closed problems without the fields.
export const ih055ProblemClosedFields = ScriptOnlyCheck({
    $id: Now.ID['ih-055-problem-closed-fields'],
    name: 'IH-053 Closed fields set on problems',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Checks the problem closure rule and closed problems without Closed or Closed by',
    description:
        'When a problem is closed, Closed and Closed by must be set (by the business rule "Update fields on Problem Closure"; older releases used mark_closed). Reports the rule when it is missing or inactive, and every closed problem without these fields. Ideal state: every closed problem has both fields.',
    script: `(function(engine) {
    var rule = new GlideRecord('sys_script');
    rule.addQuery('collection', 'problem');
    rule.addQuery('name', 'IN', 'Update fields on Problem Closure,mark_closed');
    rule.addActiveQuery();
    rule.query();
    if (!rule.hasNext()) {
        var inactive = new GlideRecord('sys_script');
        inactive.addQuery('collection', 'problem');
        inactive.addQuery('name', 'IN', 'Update fields on Problem Closure,mark_closed');
        inactive.query();
        if (inactive.next()) {
            engine.finding.setCurrentSource(inactive);
            engine.finding.setValue('finding_details', 'Business rule ' + inactive.getValue('name') + ' on problem is inactive');
            engine.finding.increment();
        }
    }

    var problem = new GlideRecord('problem');
    problem.addEncodedQuery('state=107^closed_atISEMPTY^ORclosed_byISEMPTY');
    problem.query();
    while (problem.next()) {
        var missing = [];
        if (!problem.getValue('closed_at')) missing.push('Closed');
        if (!problem.getValue('closed_by')) missing.push('Closed by');
        engine.finding.setCurrentSource(problem);
        engine.finding.setValue('finding_details', 'Closed problem without ' + missing.join(' and '));
        engine.finding.increment();
    }
})(engine);`,
    resolutionDetails:
        'Activate the closure business rule, then fill Closed and Closed by on the affected problems.',
})

// IH-054: active tasks that have a closed date. ScriptOnlyCheck since 2026-11-06 (new key 080, was the
// TableCheck ih-056) for the same reason as IH-049: the scan engine skips the base table task.
export const ih080ActiveTasksWithClosedDate = ScriptOnlyCheck({
    $id: Now.ID['ih-080-active-tasks-with-closed-date'],
    name: 'IH-054 Active tasks with a closed date',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Finds active tasks that have a closed date',
    description:
        'A closed date on an active task means the task was reopened without clearing the date, or the state model does not set active correctly. Durations and reports become wrong. Ideal state: active tasks have no closed date.',
    script: `(function(engine) {
    var task = new GlideRecord('task');
    task.addEncodedQuery('active=true^closed_atISNOTEMPTY');
    task.query();
    while (task.next()) {
        engine.finding.setCurrentSource(task);
        engine.finding.setValue('finding_details', task.getClassDisplayValue() + ' ' + task.getValue('number') + ' is active (state ' + task.getDisplayValue('state') + ') but closed on ' + task.getValue('closed_at'));
        engine.finding.increment();
    }
})(engine);`,
    resolutionDetails:
        'Check the task state: close the task properly, or clear the closed date when it was reopened, and fix the process that reopens tasks.',
})

// IH-056: share of active CIs neither discovered nor updated for 60 days, finding above 5 % (user decision)
export const ih058StaleConfigurationItems = ScriptOnlyCheck({
    $id: Now.ID['ih-058-stale-configuration-items'],
    name: 'IH-056 Share of active CIs not discovered or updated for 60 days',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Reports when more than 5% of active CIs were neither discovered nor updated for 60 days',
    description:
        'CIs that no source has touched for a long time are likely outdated. Active CIs are those not retired (install status and operational status). A CI is stale when it was not discovered (or never) and not updated for 60 days. One finding when more than 5% of active CIs are stale. Ideal state: at most 5% of active CIs are stale.',
    script: `(function(engine) {
    var DAYS = 60;
    var MAX_SHARE = 5;
    var since = new GlideDateTime();
    since.addDaysUTC(-DAYS);

    function count(stale) {
        var ci = new GlideAggregate('cmdb_ci');
        ci.addQuery('install_status', '!=', '7');
        ci.addQuery('operational_status', '!=', '6');
        if (stale) {
            ci.addQuery('sys_updated_on', '<', since.getValue());
            var discovered = ci.addNullQuery('last_discovered');
            discovered.addOrCondition('last_discovered', '<', since.getValue());
        }
        ci.addAggregate('COUNT');
        ci.query();
        return ci.next() ? parseInt(ci.getAggregate('COUNT'), 10) : 0;
    }
    var total = count(false);
    if (total == 0) return;
    var stale = count(true);
    var share = stale * 100 / total;
    if (share <= MAX_SHARE) return;

    var table = new GlideRecord('sys_db_object');
    if (!table.get('name', 'cmdb_ci')) return;
    engine.finding.setCurrentSource(table);
    engine.finding.setValue('finding_details', stale + ' of ' + total + ' active CIs (' + share.toFixed(1) + '%) were neither discovered nor updated for ' + DAYS + ' days (limit ' + MAX_SHARE + '%)');
    engine.finding.increment();
})(engine);`,
    resolutionDetails:
        'Filter active CIs by Most recent discovery and Updated older than 60 days, retire CIs that no longer exist and bring the others under Discovery or a regular import.',
})

// IH-057: custom scripted REST resources without authentication or ACL authorization (user decision)
export const ih059UnsecuredScriptedRest = TableCheck({
    $id: Now.ID['ih-059-unsecured-scripted-rest'],
    name: 'IH-057 Scripted REST resources without security',
    active: true,
    category: 'security',
    priority: '2',
    shortDescription: 'Finds custom scripted REST resources that do not require authentication or ACL authorization',
    description:
        'A resource without authentication is public; without ACL authorization any authenticated user can call it. Only custom resources are checked; ServiceNow endpoints are covered by the check "Review Public REST API Endpoints". Ideal state: every custom scripted REST resource requires authentication and ACL authorization.',
    table: 'sys_ws_operation',
    conditions: 'active=true^requires_authentication=false^ORrequires_acl_authorization=false',
    advanced: true,
    script: `(function(engine, current) {
    if (!new x_bits2_inst_hlth.IHScanUtil().isCustom(current)) return;
    var missing = [];
    if (current.requires_authentication != true) missing.push('authentication');
    if (current.requires_acl_authorization != true) missing.push('ACL authorization');
    engine.finding.setCurrentSource(current);
    engine.finding.setValue('finding_details', current.getValue('http_method') + ' ' + current.web_service_definition.getDisplayValue() + ' ' + (current.getValue('relative_path') || '') + ' does not require ' + missing.join(' and '));
    engine.finding.increment();
})(engine, current);`,
    resolutionDetails:
        'Enable Requires authentication and Requires ACL authorization on the resource and add an ACL for the REST endpoint, or document why the endpoint must be public.',
})

// IH-031: the Asset Management rules on cmdb_ci that create assets must be active
export const ih032CreateAssetRules = ScriptOnlyCheck({
    $id: Now.ID['ih-032-create-asset-rules'],
    name: 'IH-031 Create Asset business rules active',
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

// IH-032: discovery source set but not in the choice list; empty values are not a finding (user decision)
export const ih033InvalidDiscoverySource = ScriptOnlyCheck({
    $id: Now.ID['ih-033-invalid-discovery-source'],
    name: 'IH-032 CIs with an invalid discovery source',
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

// IH-033: impersonate button enabled on an instance flagged as production
export const ih034ImpersonationInProduction = ScriptOnlyCheck({
    $id: Now.ID['ih-034-impersonation-in-production'],
    name: 'IH-033 Impersonation in production',
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

// IH-035: active knowledge bases whose retire workflow is empty or points to a workflow that does
// not exist (seen on bithawkdemo1: 6 of 7 knowledge bases reference a deleted workflow)
export const ih036KnowledgeBaseRetireWorkflow = TableCheck({
    $id: Now.ID['ih-036-knowledge-base-retire-workflow'],
    name: 'IH-035 Knowledge bases without retire workflow',
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

// IH-039: memberships of inactive users in active groups
export const ih040InactiveGroupMembers = TableCheck({
    $id: Now.ID['ih-040-inactive-group-members'],
    name: 'IH-039 Inactive users in groups',
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

// IH-040: active groups whose manager is inactive
export const ih041InactiveGroupManager = TableCheck({
    $id: Now.ID['ih-041-inactive-group-manager'],
    name: 'IH-040 Groups with an inactive manager',
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

// IH-041: active groups without any member
export const ih042GroupsWithoutMembers = TableCheck({
    $id: Now.ID['ih-042-groups-without-members'],
    name: 'IH-041 Groups without members',
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

// IH-042: roles assigned directly to active users; snc_internal / snc_external are assigned by the platform
export const ih043DirectRoleAssignments = TableCheck({
    $id: Now.ID['ih-043-direct-role-assignments'],
    name: 'IH-042 Roles assigned directly to users',
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

// IH-043: active groups that grant roles but have no group type (any type is enough, user decision)
export const ih044RoleGroupsWithoutType = TableCheck({
    $id: Now.ID['ih-044-role-groups-without-type'],
    name: 'IH-043 Groups with roles without a group type',
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
