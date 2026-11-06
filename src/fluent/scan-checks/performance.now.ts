import { ColumnTypeCheck, TableCheck } from '@servicenow/sdk/core'

// IH-002: reports whose recent average run time exceeds 5 s (durations are stored in ms)
export const ih002SlowReports = TableCheck({
    $id: Now.ID['ih-002-slow-reports'],
    name: 'IH-002 Slow reports',
    active: true,
    category: 'performance',
    priority: '3',
    shortDescription: 'Finds recently run reports with an average run time over 5 seconds',
    description:
        'Slow reports load dashboards and the database. Uses the recent average run time of reports that ran recently. Ideal state: every report loads in under 5 seconds.',
    table: 'report_stats',
    conditions: 'recent_avg_execution_duration>5000^recent_number_executions>0',
    advanced: true,
    script: `(function(engine, current) {
    var avgSeconds = parseInt(current.getValue('recent_avg_execution_duration'), 10) / 1000;
    var details = 'Recent average run time ' + avgSeconds.toFixed(1) + ' s over ' + current.getValue('recent_number_executions') + ' recent run(s)';

    // Link the finding to the report itself (sys_report or par_visualization), falling back to the stats record
    var reportTable = current.getValue('report_table');
    var report = reportTable ? new GlideRecord(reportTable) : null;
    if (report && report.isValid() && report.get(current.getValue('report_sys_id'))) {
        engine.finding.setCurrentSource(report);
        details = details + ' (' + report.getClassDisplayValue() + ': ' + report.getDisplayValue() + ')';
    } else {
        engine.finding.setCurrentSource(current);
    }

    engine.finding.setValue('finding_details', details);
    engine.finding.increment();
})(engine, current);`,
    resolutionDetails:
        'Add filters or a shorter date range, avoid group-bys on dot-walked fields of large tables, and check for missing indexes on the filtered fields.',
})

// IH-005: global UI scripts are loaded on every page
export const ih005GlobalUiScripts = TableCheck({
    $id: Now.ID['ih-005-global-ui-scripts'],
    name: 'IH-005 Global UI scripts',
    active: true,
    category: 'performance',
    priority: '3',
    shortDescription: 'Finds active UI scripts that run globally',
    description:
        'Global UI scripts are loaded on every page and slow down page load for all users. Ideal state: no global UI scripts.',
    table: 'sys_ui_script',
    conditions: 'global=true^active=true',
    resolutionDetails:
        'Load the UI script only where it is needed (on demand via g_ui_scripts or ScriptLoader) and set Global to false.',
})

// IH-007: client scripts on table "global" run on every form and list
export const ih007GlobalClientScripts = TableCheck({
    $id: Now.ID['ih-007-global-client-scripts'],
    name: 'IH-007 Global client scripts',
    active: true,
    category: 'performance',
    priority: '3',
    shortDescription: 'Finds active client scripts that run on table global',
    description:
        'Client scripts on table global run on every form of every table. Ideal state: no client scripts on global.',
    table: 'sys_script_client',
    conditions: 'table=global^active=true',
    resolutionDetails:
        'Move the logic to a client script on the specific table, or into a UI script that is loaded on demand.',
})

// IH-010: <var>.<reference>.sys_id in custom scripts; "this." and common non-reference objects
// (data, options, input, ...) are skipped to avoid widget and helper false positives
export const ih010DotWalkToSysId = ColumnTypeCheck({
    $id: Now.ID['ih-010-dot-walk-to-sys-id'],
    name: 'IH-010 Unnecessary dot-walk to sys_id',
    active: true,
    category: 'performance',
    priority: '3',
    shortDescription: 'Finds custom scripts that read a reference value with .sys_id',
    description:
        'A reference field already holds the sys_id of the referenced record. Reading it with gr.field.sys_id dot-walks to the referenced record for the same value. Only custom scripts are checked; every matching line is listed. Ideal state: reference values are read with getValue(field).',
    columnType: 'script',
    script: `(function(engine, current, columnValue) {
    if (!columnValue || columnValue.indexOf('.sys_id') == -1) return;
    var regex = /(^|[^\\w$.])(?!this\\.)[A-Za-z_$][\\w$]*\\.(?!(?:sys_id|data|options|input|params|body|request|response|result|answer)\\b)[A-Za-z_$][\\w$]*\\.sys_id\\b/;
    new x_bits2_inst_hlth.IHScanUtil().checkScript(engine, current, columnValue, regex);
})(engine, current, columnValue);`,
    resolutionDetails:
        'Replace gr.field.sys_id with gr.getValue(\'field\') (or gr.field + \'\'); the reference field already contains the sys_id.',
})

// IH-011: synchronous AJAX patterns, only in client-side script columns of custom records
export const ih011SynchronousAjax = ColumnTypeCheck({
    $id: Now.ID['ih-011-synchronous-ajax'],
    name: 'IH-011 Synchronous AJAX in client code',
    active: true,
    category: 'performance',
    priority: '3',
    shortDescription: 'Finds custom client code that makes synchronous server calls',
    description:
        'Synchronous calls block the browser until the server answers. Checks custom client scripts, catalog client scripts, UI policy scripts, client UI actions, UI scripts, UI page and widget client scripts for getXMLWait(), getReference() without callback, client GlideRecord query() without callback and async: false. Every matching line is listed. Ideal state: client code only uses asynchronous calls.',
    columnType: 'script',
    script: `(function(engine, current, columnValue) {
    if (!columnValue) return;
    var regex = /getXMLWait\\s*\\(|\\.getReference\\s*\\(\\s*[^,()]+\\)|\\.query\\s*\\(\\s*\\)|\\basync\\s*:\\s*false\\b/;
    if (!regex.test(columnValue)) return;

    // Client-side columns per table; server-side columns of the same records are ignored
    var clientColumns = {
        sys_script_client: ['script'],
        catalog_script_client: ['script'],
        sys_ui_policy: ['script_true', 'script_false'],
        catalog_ui_policy: ['script_true', 'script_false'],
        sys_ui_script: ['script'],
        sys_ui_page: ['client_script'],
        sp_widget: ['client_script'],
        sys_ui_action: ['script']
    };
    var tableName = current.getRecordClassName();
    var columns = clientColumns[tableName];
    if (!columns) return;
    if (tableName == 'sys_ui_action' && String(current.client) != 'true') return;
    var isClientColumn = false;
    for (var i = 0; i < columns.length; i++)
        if (current.getValue(columns[i]) == columnValue) isClientColumn = true;
    if (!isClientColumn) return;

    new x_bits2_inst_hlth.IHScanUtil().checkScript(engine, current, columnValue, regex);
})(engine, current, columnValue);`,
    resolutionDetails:
        'Use GlideAjax with getXMLAnswer() or getXML(callback), g_form.getReference(field, callback), and client GlideRecord query(callback); never set async: false.',
})

// IH-015: business rules on table global are loaded on every transaction; custom rules only
export const ih015GlobalBusinessRules = TableCheck({
    $id: Now.ID['ih-015-global-business-rules'],
    name: 'IH-015 Global business rules',
    active: true,
    category: 'performance',
    priority: '3',
    shortDescription: 'Finds active custom business rules that run on table global',
    description:
        'Business rules on table global are evaluated on every transaction. Only custom rules are reported; rules from ServiceNow plugins and the base system are ignored. Ideal state: no custom business rule runs on global.',
    table: 'sys_script',
    conditions: 'collection=global^active=true',
    advanced: true,
    script: `(function(engine, current) {
    if (!new x_bits2_inst_hlth.IHScanUtil().isCustom(current)) return;
    engine.finding.setCurrentSource(current);
    engine.finding.increment();
})(engine, current);`,
    resolutionDetails:
        'Move shared functions into a script include, and move table logic into a business rule on the specific table.',
})

// IH-017: per active transform map, finding if none of its coalesce fields starts a database index.
// Indexes come from v_db_index (physical names). Fields whose physical column name is unknown
// (child table stored in its parent, e.g. CMDB) cannot be checked and are skipped.
export const ih017CoalesceWithoutIndex = TableCheck({
    $id: Now.ID['ih-017-coalesce-without-index'],
    name: 'IH-017 Transform map coalesces on non-indexed fields',
    active: true,
    category: 'performance',
    priority: '3',
    shortDescription: 'Finds active transform maps whose coalesce fields have no database index',
    description:
        'For every import row, coalesce looks up an existing target record by the coalesce fields. Without an index this is a full table scan. A transform map is reported when none of its coalesce fields is the first column of an index on the target table. Fields of child tables that are stored in a parent table (for example CMDB classes) cannot be checked and are skipped. Ideal state: every transform map coalesces on at least one indexed field.',
    table: 'sys_transform_map',
    conditions: 'active=true',
    advanced: true,
    script: `(function(engine, current) {
    var entries = new GlideRecord('sys_transform_entry');
    entries.addQuery('map', current.getUniqueValue());
    entries.addQuery('coalesce', true);
    entries.query();
    if (!entries.hasNext()) return;

    var indexCache = {};
    function firstIndexColumns(table) {
        if (indexCache.hasOwnProperty(table)) return indexCache[table];
        var columns = [];
        var idx = new GlideRecord('v_db_index');
        idx.addQuery('table_name', table);
        idx.query();
        while (idx.next()) {
            var names = (idx.getValue('column_names') || '').replace(/^\\[|\\]$/g, '');
            if (names) columns.push(names.split(';')[0]);
        }
        indexCache[table] = columns;
        return columns;
    }
    function parentOf(table) {
        var obj = new GlideRecord('sys_db_object');
        return obj.get('name', table) && obj.getValue('super_class') ? obj.super_class.name + '' : '';
    }
    function definingTable(table, field) {
        for (var t = table, depth = 0; t && depth < 20; t = parentOf(t), depth++) {
            var dict = new GlideRecord('sys_dictionary');
            dict.addQuery('name', t);
            dict.addQuery('element', field);
            dict.setLimit(1);
            dict.query();
            if (dict.hasNext()) return t;
        }
        return '';
    }
    // 'indexed', 'missing' or 'unknown'
    function evaluate(table, field) {
        if (field == 'sys_id') return 'indexed';
        var defining = definingTable(table, field);
        if (!defining) return 'unknown';
        for (var t = defining, depth = 0; t && depth < 20; t = parentOf(t), depth++) {
            var columns = firstIndexColumns(t);
            if (columns.length == 0) continue;
            if (t != defining) return 'unknown';
            return columns.indexOf(field) > -1 ? 'indexed' : 'missing';
        }
        return 'unknown';
    }

    var missing = [];
    var unknown = 0;
    while (entries.next()) {
        var field = entries.getValue('target_field');
        var result = evaluate(entries.getValue('target_table') || current.getValue('target_table'), field);
        if (result == 'indexed') return;
        if (result == 'missing') missing.push(field);
        else unknown++;
    }
    if (missing.length == 0 || unknown > 0) return;

    engine.finding.setCurrentSource(current);
    engine.finding.setValue('finding_details', 'Target table ' + current.getValue('target_table') + ': no index starts with the coalesce field(s) ' + missing.join(', '));
    engine.finding.increment();
})(engine, current);`,
    resolutionDetails:
        'Add a database index on the coalesce field (or a composite index starting with one of the coalesce fields) on the target table, or coalesce on a field that is already indexed.',
})

// IH-019: database queries in read ACL scripts run for every record and field that is read
export const ih019ReadAclQueries = TableCheck({
    $id: Now.ID['ih-019-read-acl-queries'],
    name: 'IH-019 Read ACLs with GlideRecord or GlideAggregate',
    active: true,
    category: 'performance',
    priority: '3',
    shortDescription: 'Finds custom read ACLs whose script queries the database',
    description:
        'Read ACL scripts run for every record and field that is displayed. A GlideRecord, GlideRecordSecure or GlideAggregate query in the script multiplies the database load of every list. Only custom ACLs are checked; every matching line is listed. Ideal state: read ACLs use roles and conditions, not queries.',
    table: 'sys_security_acl',
    conditions: 'operation.name=read^active=true^advanced=true^scriptLIKEGlide',
    advanced: true,
    script: `(function(engine, current) {
    var util = new x_bits2_inst_hlth.IHScanUtil();
    if (!util.isCustom(current)) return;
    var lines = util.matchingLines(current.getValue('script'), /\\bnew\\s+Glide(RecordSecure|Record|Aggregate)\\s*\\(/);
    if (lines.length > 0)
        util.reportLines(engine, current, lines, 'Read ACL ' + current.getValue('name'));
})(engine, current);`,
    resolutionDetails:
        'Replace the query with roles or a condition, check a value the user session already has, or cache the result (for example in the session) instead of querying for each record.',
})
