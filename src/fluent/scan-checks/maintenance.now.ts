import { ColumnTypeCheck, ScriptOnlyCheck, TableCheck } from '@servicenow/sdk/core'

// IH-003: custom = customer scoped app, or global with a customer update; plugins and store apps never count
export const ih003TooManyClientScripts = ScriptOnlyCheck({
    $id: Now.ID['ih-003-too-many-client-scripts'],
    name: 'IH-003 Tables with more than 10 custom client scripts',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Finds tables with more than 10 active custom client scripts',
    description:
        'Many client scripts on one table slow down forms and are hard to maintain. Counts active client scripts from customer scoped apps, and global client scripts that have a customer update. Scripts from ServiceNow plugins and store apps, inactive scripts and catalog client scripts do not count. Ideal state: at most 10 custom client scripts per table.',
    script: `(function(engine) {
    var MAX_SCRIPTS = 10;

    var globalCustomerUpdates = {};
    var upd = new GlideAggregate('sys_update_xml');
    upd.addQuery('name', 'STARTSWITH', 'sys_script_client_');
    upd.addQuery('application', 'global');
    upd.groupBy('name');
    upd.query();
    while (upd.next())
        globalCustomerUpdates[upd.getValue('name')] = true;

    var counts = {};
    var cs = new GlideRecord('sys_script_client');
    cs.addActiveQuery();
    cs.addQuery('sys_class_name', 'sys_script_client');
    cs.addNotNullQuery('table');
    cs.query();
    while (cs.next()) {
        var packageClass = cs.sys_package.sys_class_name + '';
        var isCustom = packageClass == 'sys_app' ||
            (cs.getValue('sys_package') == 'global' && globalCustomerUpdates[cs.getValue('sys_update_name')] === true);
        if (!isCustom) continue;
        var tableName = cs.getValue('table');
        counts[tableName] = (counts[tableName] || 0) + 1;
    }

    for (var tableName in counts) {
        if (counts[tableName] <= MAX_SCRIPTS) continue;
        var table = new GlideRecord('sys_db_object');
        if (table.get('name', tableName))
            engine.finding.setCurrentSource(table);
        engine.finding.setValue('finding_details', 'Table ' + tableName + ' has ' + counts[tableName] + ' active custom client scripts (limit ' + MAX_SCRIPTS + ')');
        engine.finding.increment();
    }
})(engine);`,
    resolutionDetails:
        'Consolidate client scripts on the table, move field visibility and mandatory logic to UI policies, and remove obsolete scripts.',
})

// IH-008: if all import set rows together exceed 5 million, report the 10 runs with the most rows
export const ih008ImportSetRowGrowth = ScriptOnlyCheck({
    $id: Now.ID['ih-008-import-set-row-growth'],
    name: 'IH-008 Import set rows over 5 million',
    active: true,
    category: 'performance',
    priority: '3',
    shortDescription: 'Reports the 10 largest import runs when import set rows exceed 5 million',
    description:
        'Large import set tables slow down imports and cleanup and use database space. Counts all import set rows together; if there are more than 5 million, the 10 import runs with the most rows are reported. Ideal state: fewer than 5 million import set rows.',
    script: `(function(engine) {
    var MAX_ROWS = 5000000;
    var TOP_RUNS = 10;

    var total = new GlideAggregate('sys_import_set_row');
    total.addAggregate('COUNT');
    total.query();
    var totalRows = total.next() ? parseInt(total.getAggregate('COUNT'), 10) : 0;
    if (totalRows <= MAX_ROWS) return;

    var runs = new GlideAggregate('sys_import_set_row');
    runs.addAggregate('COUNT', 'sys_import_set');
    runs.groupBy('sys_import_set');
    runs.orderByAggregate('COUNT', 'sys_import_set');
    runs.query();
    var reported = 0;
    while (runs.next() && reported < TOP_RUNS) {
        var rows = parseInt(runs.getAggregate('COUNT', 'sys_import_set'), 10);
        var share = (rows * 100 / totalRows).toFixed(1);
        var importSet = new GlideRecord('sys_import_set');
        var details = rows + ' rows (' + share + '% of ' + totalRows + ' import set rows)';
        if (importSet.get(runs.getValue('sys_import_set'))) {
            engine.finding.setCurrentSource(importSet);
            details += ' in ' + importSet.getValue('table_name') + ', created ' + importSet.getValue('sys_created_on');
        }
        engine.finding.setValue('finding_details', details);
        engine.finding.increment();
        reported++;
    }
})(engine);`,
    resolutionDetails:
        'Check that the Import Set Deleter job is active and its retention period fits, then delete the large old import runs.',
})

// IH-004: only the latest finished run of each active job counts, so fixed jobs drop out
export const ih004DataCollectorJobIssues = TableCheck({
    $id: Now.ID['ih-004-data-collector-job-issues'],
    name: 'IH-004 Data collector jobs with errors or warnings',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Finds active PA data collector jobs whose latest run had errors or warnings',
    description:
        'Data collector jobs that end with errors or warnings leave gaps in Performance Analytics scores. Only the latest finished run of each active job is evaluated. Ideal state: no job ends with errors or warnings.',
    table: 'sysauto_pa',
    conditions: 'active=true',
    advanced: true,
    script: `(function(engine, current) {
    var log = new GlideRecord('pa_job_logs');
    log.addQuery('job', current.getUniqueValue());
    log.addQuery('state', '!=', 'collecting');
    log.orderByDesc('sys_created_on');
    log.setLimit(1);
    log.query();
    if (!log.next()) return;

    var errors = parseInt(log.getValue('errors'), 10) || 0;
    var warnings = parseInt(log.getValue('warnings'), 10) || 0;
    var state = log.getValue('state');
    if (errors == 0 && warnings == 0 && state != 'collected_error' && state != 'collected_warning') return;

    engine.finding.setCurrentSource(current);
    engine.finding.setValue('finding_details', 'Latest run completed ' + log.getValue('completed') + ' with ' + errors + ' error(s) and ' + warnings + ' warning(s)');
    engine.finding.increment();
})(engine, current);`,
    resolutionDetails:
        'Open the latest job log and its log rows (pa_job_log_rows) and fix the failing indicators or breakdowns, or deactivate the job if it is no longer needed.',
})

// IH-009: gs.sql calls in any script column, ignoring commented-out code
export const ih009GsSqlUsage = ColumnTypeCheck({
    $id: Now.ID['ih-009-gs-sql-usage'],
    name: 'IH-009 Scripts using gs.sql',
    active: true,
    category: 'upgradability',
    priority: '2',
    shortDescription: 'Finds scripts that call gs.sql',
    description:
        'gs.sql is undocumented, bypasses ACLs and can lock tables. Ideal state: no script uses gs.sql.',
    columnType: 'script',
    script: `(function(engine, current, columnValue) {
    if (!columnValue || columnValue.indexOf('sql') == -1) return;

    var skipTables = ['scan_column_type_check', 'scan_script_only_check', 'scan_table_check', 'scan_linter_check', 'sys_script_execution_history'];
    if (current.getTableName && skipTables.indexOf(current.getTableName()) > -1) return;

    var searchRegex = /\\bgs\\s*\\.\\s*sql\\s*\\(/;
    if (!searchRegex.test(columnValue)) return;

    var commentsRegex = /\\/\\*[\\s\\S]*?\\*\\/|([^:]|^)\\/\\/.*$/gm;
    var clean = columnValue.replace(commentsRegex, '$1');
    if (searchRegex.test(clean)) {
        engine.finding.setCurrentSource(current);
        engine.finding.increment();
    }
})(engine, current, columnValue);`,
    resolutionDetails:
        'Replace gs.sql with GlideRecord or GlideAggregate queries.',
})
