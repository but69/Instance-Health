import { ColumnTypeCheck, TableCheck } from '@servicenow/sdk/core'

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
    if (searchRegex.test(clean))
        engine.finding.increment();
})(engine, current, columnValue);`,
    resolutionDetails:
        'Replace gs.sql with GlideRecord or GlideAggregate queries.',
})
