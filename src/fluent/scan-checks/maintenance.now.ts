import { ColumnTypeCheck } from '@servicenow/sdk/core'

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
