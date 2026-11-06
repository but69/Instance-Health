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
