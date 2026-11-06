import { ColumnTypeCheck, ScriptOnlyCheck, TableCheck } from '@servicenow/sdk/core'

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

// IH-020: com.snc.sla.engine.version selects the task rule: 2010 (default) = async "Process SLAs",
// 2011 = synchronous "Run SLAs"
export const ih020SlaEngineSynchronous = ScriptOnlyCheck({
    $id: Now.ID['ih-020-sla-engine-synchronous'],
    name: 'IH-020 SLA engine runs synchronously',
    active: true,
    category: 'performance',
    priority: '3',
    shortDescription: 'Checks that SLAs are processed synchronously (SLA engine 2011)',
    description:
        'With SLA engine 2010 (the default when com.snc.sla.engine.version is not set) task SLAs are processed by the async business rule "Process SLAs", so SLA states lag behind the task. Engine 2011 processes them synchronously with the business rule "Run SLAs". Ideal state: com.snc.sla.engine.version is 2011.',
    script: `(function(engine) {
    var PROPERTY = 'com.snc.sla.engine.version';
    var property = new GlideRecord('sys_properties');
    var hasProperty = property.get('name', PROPERTY);
    var value = hasProperty ? property.getValue('value') : '';
    if (value == '2011') return;

    if (hasProperty) {
        engine.finding.setCurrentSource(property);
    } else {
        // No property: link to the async rule, if Service Level Management is installed at all
        var rule = new GlideRecord('sys_script');
        rule.addQuery('collection', 'task');
        rule.addQuery('name', 'Process SLAs');
        rule.query();
        if (!rule.next()) return;
        engine.finding.setCurrentSource(rule);
    }
    engine.finding.setValue('finding_details', PROPERTY + ' is ' + (hasProperty ? value : 'not set (default 2010)') + ': SLAs are processed by the async business rule "Process SLAs"');
    engine.finding.increment();
})(engine);`,
    resolutionDetails:
        'Set com.snc.sla.engine.version to 2011 so that SLAs are processed synchronously by "Run SLAs". Test custom SLA logic first.',
})

// IH-021: outbound REST/SOAP calls in custom business rules that are not async
export const ih021SyncOutboundCalls = TableCheck({
    $id: Now.ID['ih-021-sync-outbound-calls'],
    name: 'IH-021 Business rules with outbound REST or SOAP calls must be async',
    active: true,
    category: 'performance',
    priority: '3',
    shortDescription: 'Finds custom synchronous business rules that call REST or SOAP services',
    description:
        'An outbound call in a before, after or display business rule makes the user wait for the remote system and fails the transaction when it is down. Only custom rules are checked; every matching line is listed. Ideal state: business rules with outbound calls run async.',
    table: 'sys_script',
    conditions: 'active=true^when!=async^when!=async_always^scriptLIKERESTMessage^ORscriptLIKESOAPMessage^ORscriptLIKEGlideHTTPRequest',
    advanced: true,
    script: `(function(engine, current) {
    var util = new x_bits2_inst_hlth.IHScanUtil();
    if (!util.isCustom(current)) return;
    var lines = util.matchingLines(current.getValue('script'), /\\b(RESTMessageV2|SOAPMessageV2|RESTMessage|SOAPMessage|GlideHTTPRequest)\\s*\\(/);
    if (lines.length > 0)
        util.reportLines(engine, current, lines, 'Business rule (' + (current.getValue('when') || 'no when') + ') on ' + current.getValue('collection'));
})(engine, current);`,
    resolutionDetails:
        'Change the business rule to async, or trigger the call through an event and script action or a flow.',
})

// IH-037: business rule call stack logging (debug setting) switched on
export const ih037BusinessRuleCallstack = TableCheck({
    $id: Now.ID['ih-037-business-rule-callstack'],
    name: 'IH-037 Business rule call stack logging enabled',
    active: true,
    category: 'performance',
    priority: '3',
    shortDescription: 'Checks that glide.businessrule.callstack is not set to true',
    description:
        'glide.businessrule.callstack writes the call stack of business rules to the log. It is meant for debugging and slows down every transaction. Ideal state: the property is false or not set.',
    table: 'sys_properties',
    conditions: 'name=glide.businessrule.callstack^value=true',
    resolutionDetails:
        'Set glide.businessrule.callstack to false or delete the property.',
})

// IH-062: custom remote tables that return 1000 rows or more (ServiceNow remote tables are not
// queried, their scripts can call external systems; user decision)
export const ih062LargeRemoteTables = TableCheck({
    $id: Now.ID['ih-062-large-remote-tables'],
    name: 'IH-062 Remote tables with 1000 rows or more',
    active: true,
    category: 'performance',
    priority: '3',
    shortDescription: 'Finds custom remote tables that return 1000 rows or more',
    description:
        'Remote tables build their rows in a script on every query. Large result sets make lists, reports and portal widgets on these tables slow. Only custom remote tables are queried, because querying runs the remote table script. Ideal state: remote tables return fewer than 1000 rows.',
    table: 'sys_script_vtable',
    conditions: 'active=true',
    advanced: true,
    script: `(function(engine, current) {
    var LIMIT = 1000;
    if (!new x_bits2_inst_hlth.IHScanUtil().isCustom(current)) return;
    var rows = new GlideRecord(current.getValue('table'));
    if (!rows.isValid()) return;
    rows.setLimit(LIMIT);
    rows.query();
    var count = 0;
    while (rows.next()) count++;
    if (count < LIMIT) return;
    engine.finding.setCurrentSource(current);
    engine.finding.setValue('finding_details', 'Remote table ' + current.getValue('table') + ' returns at least ' + LIMIT + ' rows');
    engine.finding.increment();
})(engine, current);`,
    resolutionDetails:
        'Filter the remote table script: use the query conditions, pagination or a narrower data source so it returns only the rows needed.',
})

// IH-063: recurring jobs (trigger type Repeat or Interval) whose average run time over the last
// 7 days (sys_scheduler_job_history, "Recurring.<name>", ms) is longer than the interval
// (user decision 2026-11-06: average, not the longest run, so short spikes are not reported)
export const ih063JobsLongerThanInterval = ScriptOnlyCheck({
    $id: Now.ID['ih-063-jobs-longer-than-interval'],
    name: 'IH-063 Scheduled jobs running longer than their interval',
    active: true,
    category: 'performance',
    priority: '3',
    shortDescription: 'Finds recurring jobs that run longer than their repeat interval',
    description:
        'A job that runs longer than its interval on average is still running when the next run is due; runs pile up and block scheduler workers. Compares the repeat interval of recurring jobs with their average run time over the last 7 days; short spikes are not reported. Ideal state: every recurring job finishes before its next run.',
    script: `(function(engine) {
    var since = new GlideDateTime();
    since.addDaysUTC(-7);
    var stats = {};
    var history = new GlideAggregate('sys_scheduler_job_history');
    history.addQuery('sys_created_on', '>=', since.getValue());
    history.addQuery('job_classification', 'STARTSWITH', 'Recurring.');
    history.groupBy('job_classification');
    history.addAggregate('SUM', 'total');
    history.addAggregate('SUM', 'count');
    history.addAggregate('MAX', 'max_duration');
    history.query();
    while (history.next()) {
        var runs = parseFloat(history.getAggregate('SUM', 'count')) || 0;
        if (runs == 0) continue;
        stats[history.getValue('job_classification')] = {
            average: (parseFloat(history.getAggregate('SUM', 'total')) || 0) / runs,
            longest: parseFloat(history.getAggregate('MAX', 'max_duration')) || 0,
            runs: runs
        };
    }

    var trigger = new GlideRecord('sys_trigger');
    trigger.addQuery('trigger_type', 'IN', '1,10');
    trigger.addNotNullQuery('repeat');
    trigger.query();
    while (trigger.next()) {
        // repeat is stored as a date-time from 1970-01-01 (UTC), e.g. 1970-01-01 01:00:00 = 1 hour
        var interval = new GlideDateTime(trigger.getValue('repeat')).getNumericValue();
        if (interval <= 0) continue;
        var stat = stats['Recurring.' + trigger.getValue('name')];
        if (!stat || stat.average <= interval) continue;
        var job = null;
        if (trigger.getValue('document') && trigger.getValue('document_key')) {
            job = new GlideRecord(trigger.getValue('document'));
            if (!job.isValid() || !job.get(trigger.getValue('document_key'))) job = null;
        }
        engine.finding.setCurrentSource(job || trigger);
        engine.finding.setValue('finding_details', 'Job ' + trigger.getValue('name') + ' runs every ' + (interval / 1000) + ' s but takes ' + (stat.average / 1000).toFixed(1) + ' s on average over ' + stat.runs + ' run(s) in 7 days (longest ' + (stat.longest / 1000).toFixed(1) + ' s)');
        engine.finding.increment();
    }
})(engine);`,
    resolutionDetails:
        'Optimize the job (fewer records per run, indexes) or increase its repeat interval so it finishes before the next run.',
})

// IH-065: cache flush calls in custom scripts
export const ih065CacheFlush = ColumnTypeCheck({
    $id: Now.ID['ih-065-cache-flush'],
    name: 'IH-065 Scripts that flush the cache',
    active: true,
    category: 'performance',
    priority: '3',
    shortDescription: 'Finds custom scripts that flush the system cache',
    description:
        'gs.cacheFlush() and GlideCacheManager.flush() empty the system cache; every user is slower until it is rebuilt, and on multi-node instances the flush is repeated on every node. Only custom scripts are checked; every matching line is listed. Ideal state: no script flushes the cache.',
    columnType: 'script',
    script: `(function(engine, current, columnValue) {
    if (!columnValue || (columnValue.indexOf('cacheFlush') == -1 && columnValue.indexOf('GlideCacheManager') == -1)) return;
    var regex = /\\bgs\\s*\\.\\s*cacheFlush\\s*\\(|\\bGlideCacheManager\\s*\\.\\s*flush\\b/;
    new x_bits2_inst_hlth.IHScanUtil().checkScript(engine, current, columnValue, regex);
})(engine, current, columnValue);`,
    resolutionDetails:
        'Remove the cache flush; the platform invalidates the affected caches when records change. If a cache really has to be cleared, clear only that cache.',
})

// IH-068: list reports with a group by, recent average 15 s or more, run in the last 60 days
export const ih068SlowGroupedListReports = TableCheck({
    $id: Now.ID['ih-068-slow-grouped-list-reports'],
    name: 'IH-068 Slow list reports with group by',
    active: true,
    category: 'performance',
    priority: '3',
    shortDescription: 'Finds list reports with a group by that ran in the last 60 days and take 15 seconds or more',
    description:
        'List reports with a group by over large data sets load the database heavily. Reports list reports with a group by whose recent average run time is 15 seconds or more and that ran in the last 60 days (all slow reports over 5 seconds: IH-002). Ideal state: grouped list reports run in under 15 seconds.',
    table: 'report_stats',
    conditions: 'recent_avg_execution_duration>=15000^report_table=sys_report',
    advanced: true,
    script: `(function(engine, current) {
    var since = new GlideDateTime();
    since.addDaysUTC(-60);
    if (new GlideDateTime(current.getValue('sys_updated_on')).before(since)) return;
    var report = new GlideRecord('sys_report');
    if (!report.get(current.getValue('report_sys_id'))) return;
    if (report.getValue('type') != 'list' || !report.getValue('group')) return;
    var avgSeconds = parseInt(current.getValue('recent_avg_execution_duration'), 10) / 1000;
    engine.finding.setCurrentSource(report);
    engine.finding.setValue('finding_details', 'List report on ' + report.getValue('table') + ' grouped by ' + report.getValue('group') + ': recent average ' + avgSeconds.toFixed(1) + ' s');
    engine.finding.increment();
})(engine, current);`,
    resolutionDetails:
        'Remove the group by or limit the data set with filters or a shorter period; consider a chart or aggregate report instead.',
})

// IH-075: active scheduled imports (without parent) that share their schedule with another one
export const ih075ConcurrentScheduledImports = ScriptOnlyCheck({
    $id: Now.ID['ih-075-concurrent-scheduled-imports'],
    name: 'IH-075 Scheduled imports at the same time',
    active: true,
    category: 'performance',
    priority: '3',
    shortDescription: 'Finds active scheduled imports that are scheduled at the same time',
    description:
        'Imports that start together compete for scheduler workers and database locks and can process dependent data in the wrong order. Compares the schedule (run type, time, day, period) of active scheduled imports; child imports run after their parent and are ignored, as are on-demand imports. Ideal state: scheduled imports start at different times or are chained.',
    script: `(function(engine) {
    function key(imp) {
        var type = imp.getValue('run_type');
        var time = (imp.getValue('run_time') || '').substring(11);
        if (type == 'on_demand') return '';
        if (type == 'daily') return 'daily ' + time;
        if (type == 'weekly') return 'weekly day ' + imp.getValue('run_dayofweek') + ' ' + time;
        if (type == 'monthly') return 'monthly day ' + imp.getValue('run_dayofmonth') + ' ' + time;
        if (type == 'periodically') return 'every ' + imp.getValue('run_period') + ' from ' + imp.getValue('run_start');
        // A one-time import without start date has no schedule (seen on bithawkdemo1)
        if (type == 'once') return imp.getValue('run_start') ? 'once at ' + imp.getValue('run_start') : '';
        return type + ' ' + imp.getValue('run_start') + ' ' + time;
    }
    var groups = {};
    var imp = new GlideRecord('scheduled_import_set');
    imp.addActiveQuery();
    imp.addNullQuery('parent');
    imp.query();
    while (imp.next()) {
        var k = key(imp);
        if (!k) continue;
        if (!groups[k]) groups[k] = [];
        groups[k].push(imp.getUniqueValue());
    }
    for (var k2 in groups) {
        if (groups[k2].length < 2) continue;
        for (var i = 0; i < groups[k2].length; i++) {
            var record = new GlideRecord('scheduled_import_set');
            if (!record.get(groups[k2][i])) continue;
            engine.finding.setCurrentSource(record);
            engine.finding.setValue('finding_details', 'Scheduled ' + k2 + ' together with ' + (groups[k2].length - 1) + ' other import(s)');
            engine.finding.increment();
        }
    }
})(engine);`,
    resolutionDetails:
        'Stagger the start times, or chain dependent imports with the Parent field so they run one after another.',
})

// IH-076: synchronous outbound calls in custom server-side UI actions (business rules: IH-021)
export const ih076UiActionOutboundCalls = TableCheck({
    $id: Now.ID['ih-076-ui-action-outbound-calls'],
    name: 'IH-076 UI actions with synchronous outbound calls',
    active: true,
    category: 'performance',
    priority: '3',
    shortDescription: 'Finds custom server-side UI actions that call REST or SOAP services synchronously',
    description:
        'A UI action that calls an external system synchronously makes the user wait for that system and fails when it is down. UI actions that only use executeAsync() are not reported. Only custom UI actions are checked; every matching line is listed. Ideal state: UI actions trigger outbound calls asynchronously.',
    table: 'sys_ui_action',
    conditions: 'active=true^client=false^scriptLIKERESTMessage^ORscriptLIKESOAPMessage^ORscriptLIKEGlideHTTPRequest',
    advanced: true,
    script: `(function(engine, current) {
    var util = new x_bits2_inst_hlth.IHScanUtil();
    if (!util.isCustom(current)) return;
    var script = util.stripComments(current.getValue('script'));
    if (/\\.executeAsync\\s*\\(/.test(script) && !/\\.execute\\s*\\(/.test(script)) return;
    var lines = util.matchingLines(current.getValue('script'), /\\b(RESTMessageV2|SOAPMessageV2|RESTMessage|SOAPMessage|GlideHTTPRequest)\\s*\\(/);
    if (lines.length > 0)
        util.reportLines(engine, current, lines, 'UI action on ' + (current.getValue('table') || 'global'));
})(engine, current);`,
    resolutionDetails:
        'Trigger the call asynchronously (event and script action, flow, or executeAsync()) and tell the user that the request was sent.',
})

// IH-023: system default of rows per page (preference rowcount without user)
export const ih023DefaultRowsPerPage = TableCheck({
    $id: Now.ID['ih-023-default-rows-per-page'],
    name: 'IH-023 Default rows per page at most 50',
    active: true,
    category: 'performance',
    priority: '3',
    shortDescription: 'Checks that the system default for rows per page is 50 or less',
    description:
        'The system preference rowcount sets how many rows every list shows for users who have not chosen their own value. Large pages slow down every list. Ideal state: the system default is 50 or less.',
    table: 'sys_user_preference',
    conditions: 'name=rowcount^system=true^userISEMPTY',
    advanced: true,
    script: `(function(engine, current) {
    var MAX_ROWS = 50;
    var rows = parseInt(current.getValue('value'), 10);
    if (isNaN(rows) || rows <= MAX_ROWS) return;
    engine.finding.setCurrentSource(current);
    engine.finding.setValue('finding_details', 'System default rows per page is ' + rows + ' (limit ' + MAX_ROWS + ')');
    engine.finding.increment();
})(engine, current);`,
    resolutionDetails:
        'Set the value of the system preference rowcount to 50 or less.',
})

// IH-024: slow script patterns (average in ms) seen in the last 30 days, all scripts
export const ih024SlowScripts = TableCheck({
    $id: Now.ID['ih-024-slow-scripts'],
    name: 'IH-024 Long running scripts',
    active: true,
    category: 'performance',
    priority: '3',
    shortDescription: 'Finds scripts that ran in the last 30 days with an average run time over 5 seconds',
    description:
        'Uses the slow script statistics of the platform. A script is reported when its average run time is over 5 seconds and it ran in the last 30 days. ServiceNow scripts are included, because slow runs are often caused by data volume or configuration. Ideal state: no script runs longer than 5 seconds on average.',
    table: 'sys_script_pattern',
    conditions: 'average>5000',
    advanced: true,
    script: `(function(engine, current) {
    var DAYS = 30;
    var lastRun = new GlideDateTime(current.getValue('last'));
    var since = new GlideDateTime();
    since.addDaysUTC(-DAYS);
    if (!current.getValue('last') || lastRun.before(since)) return;

    var avgSeconds = parseFloat(current.getValue('average')) / 1000;
    var details = 'Average run time ' + avgSeconds.toFixed(1) + ' s over ' + current.getValue('count') + ' run(s), last run ' + current.getValue('last') + ': ' + current.getValue('label');

    // Link the finding to the script itself, falling back to the statistics record
    var sourceTable = current.getValue('script_source_table');
    var source = sourceTable ? new GlideRecord(sourceTable) : null;
    if (source && source.isValid() && source.get(current.getValue('script_source')))
        engine.finding.setCurrentSource(source);
    else
        engine.finding.setCurrentSource(current);
    engine.finding.setValue('finding_details', details);
    engine.finding.increment();
})(engine, current);`,
    resolutionDetails:
        'Optimize the script (selective queries, indexes, fewer loops and nested queries) or move it to an async context; check whether data growth causes the slowness.',
})
