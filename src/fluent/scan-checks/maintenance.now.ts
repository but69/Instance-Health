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
    var util = new x_bits2_inst_hlth.IHScanUtil();

    var counts = {};
    var cs = new GlideRecord('sys_script_client');
    cs.addActiveQuery();
    cs.addQuery('sys_class_name', 'sys_script_client');
    cs.addNotNullQuery('table');
    cs.query();
    while (cs.next()) {
        if (!util.isCustom(cs)) continue;
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

// IH-012: instance URLs (any instance) in custom scripts
export const ih012HardCodedInstanceUrl = ColumnTypeCheck({
    $id: Now.ID['ih-012-hard-coded-instance-url'],
    name: 'IH-012 Hard-coded instance URL',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Finds custom scripts that contain a ServiceNow instance URL',
    description:
        'Hard-coded instance URLs point to the wrong instance after a clone or when code moves between instances. Only custom scripts are checked; every matching line is listed. Ideal state: URLs are built from the property glide.servlet.uri.',
    columnType: 'script',
    script: `(function(engine, current, columnValue) {
    if (!columnValue || columnValue.indexOf('.com') == -1) return;
    var regex = /https?:\\/\\/[a-z0-9-]+\\.(service-now|servicenowservices)\\.com/i;
    new x_bits2_inst_hlth.IHScanUtil().checkScript(engine, current, columnValue, regex);
})(engine, current, columnValue);`,
    resolutionDetails:
        'Build the URL from gs.getProperty(\'glide.servlet.uri\') or the instance_name property, or store external URLs in a system property.',
})

// IH-013: quoted 32-character hex strings (sys_ids) in custom scripts
export const ih013HardCodedSysIds = ColumnTypeCheck({
    $id: Now.ID['ih-013-hard-coded-sys-ids'],
    name: 'IH-013 Hard-coded sys_ids in scripts',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Finds custom scripts that contain literal sys_ids',
    description:
        'Literal sys_ids break when the referenced record does not exist on another instance and hide what the code depends on. Only custom scripts are checked; every matching line is listed. Ideal state: no script contains a literal sys_id.',
    columnType: 'script',
    script: `(function(engine, current, columnValue) {
    if (!columnValue) return;
    var regex = /['"][0-9a-f]{32}['"]/i;
    new x_bits2_inst_hlth.IHScanUtil().checkScript(engine, current, columnValue, regex);
})(engine, current, columnValue);`,
    resolutionDetails:
        'Store the value in a system property, look the record up by a stable key (name, number), or reference it through configuration.',
})

// IH-014: update()/insert() in custom before business rules (current.update() included)
export const ih014BeforeRuleUpdates = TableCheck({
    $id: Now.ID['ih-014-before-rule-updates'],
    name: 'IH-014 Before business rules that update or insert records',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Finds custom before business rules that call update() or insert()',
    description:
        'Before business rules should only change the current record, which is saved anyway. Calling update() or insert() there writes other records before the current one is saved, or saves current twice. Only custom rules are checked; every matching line is listed. Ideal state: before rules only set values on current.',
    table: 'sys_script',
    conditions: 'when=before^active=true^scriptLIKEupdate^ORscriptLIKEinsert',
    advanced: true,
    script: `(function(engine, current) {
    var util = new x_bits2_inst_hlth.IHScanUtil();
    if (!util.isCustom(current)) return;
    var lines = util.matchingLines(current.getValue('script'), /\\.\\s*(update|insert)\\s*\\(/);
    if (lines.length > 0)
        util.reportLines(engine, current, lines, 'Before business rule on ' + current.getValue('collection'));
})(engine, current);`,
    resolutionDetails:
        'Move updates and inserts of other records to an after or async business rule; for the current record, set the values without calling current.update().',
})

// IH-016: same api_name used by more than one script include; reported if a member is custom
export const ih016DuplicateScriptIncludes = ScriptOnlyCheck({
    $id: Now.ID['ih-016-duplicate-script-includes'],
    name: 'IH-016 Script includes with duplicate names',
    active: true,
    category: 'manageability',
    priority: '3',
    shortDescription: 'Finds script includes that share their API name with another script include',
    description:
        'When two script includes have the same API name (same name in the same scope), it is undefined which one is loaded. The same name in different scopes is allowed and not reported. A duplicate group is reported when at least one member is custom; each member is a finding. Ideal state: every API name is unique.',
    script: `(function(engine) {
    var util = new x_bits2_inst_hlth.IHScanUtil();

    var dup = new GlideAggregate('sys_script_include');
    dup.addNotNullQuery('api_name');
    dup.groupBy('api_name');
    dup.addAggregate('COUNT');
    dup.addHaving('COUNT', '>', '1');
    dup.query();
    while (dup.next()) {
        var apiName = dup.getValue('api_name');
        var members = [];
        var anyCustom = false;
        var si = new GlideRecord('sys_script_include');
        si.addQuery('api_name', apiName);
        si.orderBy('sys_created_on');
        si.query();
        while (si.next()) {
            members.push(si.getUniqueValue());
            if (util.isCustom(si)) anyCustom = true;
        }
        if (!anyCustom) continue;

        for (var i = 0; i < members.length; i++) {
            var member = new GlideRecord('sys_script_include');
            if (!member.get(members[i])) continue;
            engine.finding.setCurrentSource(member);
            engine.finding.setValue('finding_details', 'API name ' + apiName + ' is used by ' + members.length + ' script includes (' + member.sys_package.getDisplayValue() + ', ' + (member.active == true ? 'active' : 'inactive') + ')');
            engine.finding.increment();
        }
    }
})(engine);`,
    resolutionDetails:
        'Rename or delete the duplicate script include so every API name is unique, and update the callers.',
})

// IH-025 to IH-029: ServiceNow records changed by the customer (sys_metadata_customization,
// author_type ServiceNow), one check per record type group

export const ih025BaselineBusinessRules = ScriptOnlyCheck({
    $id: Now.ID['ih-025-baseline-business-rules'],
    name: 'IH-025 Differs from baseline: business rules',
    active: true,
    category: 'upgradability',
    priority: '2',
    shortDescription: 'Finds ServiceNow business rules that were changed by the customer',
    description:
        'Changed ServiceNow business rules are skipped by upgrades, so they miss fixes and new features and must be reviewed by hand. Uses the platform list of customized records (sys_metadata_customization) and reports records originally delivered by ServiceNow. Ideal state: ServiceNow business rules are not changed; customizations are made in copies or extensions.',
    script: `(function(engine) {
    new x_bits2_inst_hlth.IHScanUtil().reportBaselineChanges(engine, ['sys_script']);
})(engine);`,
    resolutionDetails:
        'Revert the record to the base system version where possible (Revert to Base System in the versions list), or move the change into a copy or extension and document why it is needed.',
})

export const ih026BaselineScriptIncludes = ScriptOnlyCheck({
    $id: Now.ID['ih-026-baseline-script-includes'],
    name: 'IH-026 Differs from baseline: script includes',
    active: true,
    category: 'upgradability',
    priority: '2',
    shortDescription: 'Finds ServiceNow script includes that were changed by the customer',
    description:
        'Changed ServiceNow script includes are skipped by upgrades, so they miss fixes and new features and must be reviewed by hand. Uses the platform list of customized records (sys_metadata_customization) and reports records originally delivered by ServiceNow. Ideal state: ServiceNow script includes are not changed; customizations are made in copies or extensions.',
    script: `(function(engine) {
    new x_bits2_inst_hlth.IHScanUtil().reportBaselineChanges(engine, ['sys_script_include']);
})(engine);`,
    resolutionDetails:
        'Revert the record to the base system version where possible (Revert to Base System in the versions list), or move the change into a copy or extension and document why it is needed.',
})

export const ih027BaselineClientScripts = ScriptOnlyCheck({
    $id: Now.ID['ih-027-baseline-client-scripts'],
    name: 'IH-027 Differs from baseline: client scripts and UI scripts',
    active: true,
    category: 'upgradability',
    priority: '2',
    shortDescription: 'Finds ServiceNow client scripts and UI scripts that were changed by the customer',
    description:
        'Changed ServiceNow client scripts and UI scripts are skipped by upgrades, so they miss fixes and new features and must be reviewed by hand. Uses the platform list of customized records (sys_metadata_customization) and reports records originally delivered by ServiceNow. Ideal state: ServiceNow client scripts and UI scripts are not changed; customizations are made in copies or extensions.',
    script: `(function(engine) {
    new x_bits2_inst_hlth.IHScanUtil().reportBaselineChanges(engine, ['sys_script_client', 'sys_ui_script']);
})(engine);`,
    resolutionDetails:
        'Revert the record to the base system version where possible (Revert to Base System in the versions list), or move the change into a copy or extension and document why it is needed.',
})

export const ih028BaselineUiMacrosPages = ScriptOnlyCheck({
    $id: Now.ID['ih-028-baseline-ui-macros-pages'],
    name: 'IH-028 Differs from baseline: UI macros and UI pages',
    active: true,
    category: 'upgradability',
    priority: '2',
    shortDescription: 'Finds ServiceNow UI macros and UI pages that were changed by the customer',
    description:
        'Changed ServiceNow UI macros and UI pages are skipped by upgrades, so they miss fixes and new features and must be reviewed by hand. Uses the platform list of customized records (sys_metadata_customization) and reports records originally delivered by ServiceNow. Ideal state: ServiceNow UI macros and UI pages are not changed; customizations are made in copies or extensions.',
    script: `(function(engine) {
    new x_bits2_inst_hlth.IHScanUtil().reportBaselineChanges(engine, ['sys_ui_macro', 'sys_ui_page']);
})(engine);`,
    resolutionDetails:
        'Revert the record to the base system version where possible (Revert to Base System in the versions list), or move the change into a copy or extension and document why it is needed.',
})

export const ih029BaselineUiActions = ScriptOnlyCheck({
    $id: Now.ID['ih-029-baseline-ui-actions'],
    name: 'IH-029 Differs from baseline: UI actions',
    active: true,
    category: 'upgradability',
    priority: '2',
    shortDescription: 'Finds ServiceNow UI actions that were changed by the customer',
    description:
        'Changed ServiceNow UI actions are skipped by upgrades, so they miss fixes and new features and must be reviewed by hand. Uses the platform list of customized records (sys_metadata_customization) and reports records originally delivered by ServiceNow. Ideal state: ServiceNow UI actions are not changed; customizations are made in copies or extensions.',
    script: `(function(engine) {
    new x_bits2_inst_hlth.IHScanUtil().reportBaselineChanges(engine, ['sys_ui_action']);
})(engine);`,
    resolutionDetails:
        'Revert the record to the base system version where possible (Revert to Base System in the versions list), or move the change into a copy or extension and document why it is needed.',
})
