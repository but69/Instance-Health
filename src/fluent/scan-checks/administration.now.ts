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
