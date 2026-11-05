import { TableCheck } from '@servicenow/sdk/core'

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
    engine.finding.setCurrentSource(current);
    engine.finding.setValue('finding_details', 'Recent average run time ' + avgSeconds.toFixed(1) + ' s over ' + current.getValue('recent_number_executions') + ' recent run(s) on table ' + current.getValue('report_table'));
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
