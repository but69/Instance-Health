import { ColumnTypeCheck, ScriptOnlyCheck, TableCheck } from '@servicenow/sdk/core'

// IH-003: custom = customer scoped app, or global with a customer update; plugins and store apps never count
export const ih003TooManyClientScripts = ScriptOnlyCheck({
    $id: Now.ID['ih-003-too-many-client-scripts'],
    name: 'IH-003 Tables with more than 10 custom client scripts',
    active: true,
    category: 'manageability',
    priority: '3',
    scoreScale: 2,
    shortDescription: 'Finds tables with more than 10 active custom client scripts',
    description:
        'Many client scripts on one table slow down forms and are hard to maintain. Counts active client scripts from customer scoped apps, and global client scripts that have a customer update. Scripts from ServiceNow plugins and store apps, inactive scripts and catalog client scripts do not count. The limit is the system property x_bits2_inst_hlth.max_client_scripts_per_table (default 10). Ideal state: at most 10 custom client scripts per table.',
    script: `(function(engine) {
    var MAX_SCRIPTS = parseInt(gs.getProperty('x_bits2_inst_hlth.max_client_scripts_per_table', '10'), 10);
    if (isNaN(MAX_SCRIPTS)) MAX_SCRIPTS = 10;
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

// IH-007: if all import set rows together exceed the limit (property max_import_set_rows, default 5 million), report the 10 runs with the most rows
export const ih008ImportSetRowGrowth = ScriptOnlyCheck({
    $id: Now.ID['ih-008-import-set-row-growth'],
    name: 'IH-007 Import set rows over 5 million',
    active: true,
    category: 'performance',
    priority: '2',
    scoreScale: 100,
    shortDescription: 'Reports the 10 largest import runs when import set rows exceed 5 million',
    description:
        'Large import set tables slow down imports and cleanup and use database space. Counts all import set rows together; if there are more than the limit (system property x_bits2_inst_hlth.max_import_set_rows, default 5 million), the 10 import runs with the most rows are reported. Ideal state: fewer than 5 million import set rows.',
    script: `(function(engine) {
    var MAX_ROWS = parseInt(gs.getProperty('x_bits2_inst_hlth.max_import_set_rows', '5000000'), 10);
    if (isNaN(MAX_ROWS)) MAX_ROWS = 5000000;
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
    scoreScale: 2,
    shortDescription: 'Finds active PA data collector jobs whose latest run had errors or warnings, or is older than 7 days',
    description:
        'Data collector jobs that end with errors or warnings leave gaps in Performance Analytics scores. Only the latest finished run of each active job is evaluated. A job whose latest finished run is older than x_bits2_inst_hlth.data_collector_max_age_days (default 7, 0 = off) is reported as stale, because its scores are no longer updated. Ideal state: no job ends with errors or warnings and every job runs regularly.',
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
    var completedValue = log.getValue('completed') || log.getValue('sys_created_on');
    var issues = [];
    if (errors > 0 || warnings > 0 || state == 'collected_error' || state == 'collected_warning')
        issues.push(errors + ' error(s) and ' + warnings + ' warning(s)');

    var maxAgeDays = parseInt(gs.getProperty('x_bits2_inst_hlth.data_collector_max_age_days', '7'), 10);
    if (isNaN(maxAgeDays)) maxAgeDays = 7;
    if (maxAgeDays > 0 && completedValue) {
        var ageDays = Math.floor(gs.dateDiff(completedValue, gs.nowDateTime(), true) / 86400);
        if (ageDays > maxAgeDays) issues.push('no run for ' + ageDays + ' days (limit ' + maxAgeDays + ')');
    }
    if (issues.length == 0) return;

    engine.finding.setCurrentSource(current);
    engine.finding.setValue('finding_details', 'Latest run completed ' + completedValue + ': ' + issues.join('; '));
    engine.finding.increment();
})(engine, current);`,
    resolutionDetails:
        'Open the latest job log and its log rows (pa_job_log_rows) and fix the failing indicators or breakdowns, or deactivate the job if it is no longer needed.',
})

// IH-008: gs.sql calls in any script column, ignoring commented-out code
export const ih009GsSqlUsage = ColumnTypeCheck({
    $id: Now.ID['ih-009-gs-sql-usage'],
    name: 'IH-008 Scripts using gs.sql',
    active: true,
    category: 'upgradability',
    priority: '1',
    scoreScale: 20,
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

// IH-011: instance URLs (any instance) in custom scripts
export const ih012HardCodedInstanceUrl = ColumnTypeCheck({
    $id: Now.ID['ih-012-hard-coded-instance-url'],
    name: 'IH-011 Hard-coded instance URL',
    active: true,
    category: 'manageability',
    priority: '3',
    scoreScale: 2,
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

// IH-012: quoted 32-character hex strings (sys_ids) in custom scripts
export const ih013HardCodedSysIds = ColumnTypeCheck({
    $id: Now.ID['ih-013-hard-coded-sys-ids'],
    name: 'IH-012 Hard-coded sys_ids in scripts',
    active: true,
    category: 'manageability',
    priority: '3',
    scoreScale: 2,
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

// IH-013: update()/insert() in custom before business rules (current.update() included)
export const ih014BeforeRuleUpdates = TableCheck({
    $id: Now.ID['ih-014-before-rule-updates'],
    name: 'IH-013 Before business rules that update or insert records',
    active: true,
    category: 'manageability',
    priority: '2',
    scoreScale: 5,
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

// IH-015: same api_name used by more than one script include; reported if a member is custom
export const ih016DuplicateScriptIncludes = ScriptOnlyCheck({
    $id: Now.ID['ih-016-duplicate-script-includes'],
    name: 'IH-015 Script includes with duplicate names',
    active: true,
    category: 'manageability',
    priority: '2',
    scoreScale: 5,
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

// IH-034: update sets sharing a name ("Default" excluded, every application has one)
export const ih035DuplicateUpdateSetNames = ScriptOnlyCheck({
    $id: Now.ID['ih-035-duplicate-update-set-names'],
    name: 'IH-034 Update sets with duplicate names',
    active: true,
    category: 'manageability',
    priority: '3',
    scoreScale: 2,
    shortDescription: 'Finds update sets that share their name with another update set',
    description:
        'Update sets with the same name are easily mixed up when they are moved, previewed and committed. "Default" is ignored because every application has one. Each update set of a duplicate group is a finding. Ideal state: every update set has a unique name.',
    script: `(function(engine) {
    var dup = new GlideAggregate('sys_update_set');
    dup.addQuery('name', '!=', 'Default');
    dup.groupBy('name');
    dup.addAggregate('COUNT');
    dup.addHaving('COUNT', '>', '1');
    dup.query();
    while (dup.next()) {
        var name = dup.getValue('name');
        var count = dup.getAggregate('COUNT');
        var set = new GlideRecord('sys_update_set');
        set.addQuery('name', name);
        set.query();
        while (set.next()) {
            engine.finding.setCurrentSource(set);
            engine.finding.setValue('finding_details', 'Name "' + name + '" is used by ' + count + ' update sets (this one: ' + set.getDisplayValue('state') + ', application ' + set.application.getDisplayValue() + ', created ' + set.getValue('sys_created_on') + ')');
            engine.finding.increment();
        }
    }
})(engine);`,
    resolutionDetails:
        'Rename the update sets with a unique, meaningful name, for example the story number and a short title.',
})

// IH-037: business rules passing current to a script include that calls update() on a parameter
// (escapes the current.update() check IH-013); heuristic in IHScanUtil.findIndirectCurrentUpdates
// ScriptOnlyCheck since 2026-11-06 (new key 078, was the TableCheck ih-038): the suite scan did not
// evaluate the custom rule "AMAG - Vehicle Registration - Create CI" as a TableCheck (SR00014613).
export const ih078IndirectCurrentUpdate = ScriptOnlyCheck({
    $id: Now.ID['ih-078-indirect-current-update'],
    name: 'IH-037 Script includes that update current',
    active: true,
    category: 'manageability',
    priority: '2',
    scoreScale: 5,
    shortDescription: 'Finds custom business rules that pass current to a script include which updates it',
    description:
        'Calling update() on current inside a business rule saves the record again and runs all business rules a second time. When the call is hidden in a script include, it is not found by the current.update() check. Reports custom business rules that pass current to a script include whose functions call update() on a parameter. Heuristic: updates through stored fields (this.record.update()) or nested calls are not found. Ideal state: business rules never update current through a script include.',
    script: `(function(engine) {
    var util = new x_bits2_inst_hlth.IHScanUtil();
    var rule = new GlideRecord('sys_script');
    rule.addQuery('active', true);
    rule.addQuery('script', 'CONTAINS', 'current');
    rule.query();
    while (rule.next()) {
        if (!util.isCustom(rule)) continue;
        var lines = util.findIndirectCurrentUpdates(rule.getValue('script'));
        if (lines.length > 0)
            util.reportLines(engine, rule, lines, 'Business rule (' + (rule.getValue('when') || 'no when') + ') on ' + rule.getValue('collection'));
    }
})(engine);`,
    resolutionDetails:
        'In a before rule, set the values on current and let the platform save it; in other rules, avoid updating current or pass the values the script include needs instead of the record.',
})

// IH-038: complex script conditions on custom business rules (user decision: length or logic)
export const ih039ComplexConditions = TableCheck({
    $id: Now.ID['ih-039-complex-conditions'],
    name: 'IH-038 Business rules with complex script conditions',
    active: true,
    category: 'manageability',
    priority: '3',
    scoreScale: 2,
    shortDescription: 'Finds custom business rules with long or scripted conditions',
    description:
        'The condition of a business rule is evaluated on every matching transaction and is hard to read and debug. A condition is complex when it is longer than 200 characters or contains a query (GlideRecord, GlideAggregate), a statement separator (;) or a function. Only custom business rules are checked. Ideal state: conditions are short expressions; logic belongs in the script.',
    table: 'sys_script',
    conditions: 'active=true^conditionISNOTEMPTY',
    advanced: true,
    script: `(function(engine, current) {
    var util = new x_bits2_inst_hlth.IHScanUtil();
    var condition = current.getValue('condition');
    var reasons = util.conditionComplexity(condition);
    if (reasons.length == 0) return;
    if (!util.isCustom(current)) return;
    engine.finding.setCurrentSource(current);
    engine.finding.setValue('finding_details', 'Complex condition (' + reasons.join(', ') + '): ' + condition.substring(0, 300) + (condition.length > 300 ? '...' : ''));
    engine.finding.increment();
})(engine, current);`,
    resolutionDetails:
        'Use the condition builder or a short expression and move the logic into the script or a script include.',
})

// IH-044: dictionary entries (class sys_dictionary only) whose table does not exist; internal
// storage of list fields (<table><field> with sys_id, parent_id, value, sequence) is excluded
export const ih046OrphanedDictionaryEntries = ScriptOnlyCheck({
    $id: Now.ID['ih-046-orphaned-dictionary-entries'],
    name: 'IH-044 Dictionary entries for tables that do not exist',
    active: true,
    category: 'manageability',
    priority: '3',
    scoreScale: 2,
    shortDescription: 'Finds dictionary entries that belong to a table that does not exist',
    description:
        'Dictionary entries left over from deleted tables clutter the dictionary and can break upgrades and table re-creation. Variables of flows, actions and tests that are stored in the dictionary are ignored, as is the internal storage of list fields. One finding per missing table. Ideal state: every dictionary entry belongs to an existing table.',
    script: `(function(engine) {
    var tables = {};
    var table = new GlideRecord('sys_db_object');
    table.query();
    while (table.next()) tables[table.getValue('name')] = true;

    var storageElements = { sys_id: true, parent_id: true, value: true, sequence: true };
    var names = new GlideAggregate('sys_dictionary');
    names.addQuery('sys_class_name', 'sys_dictionary');
    names.groupBy('name');
    names.query();
    while (names.next()) {
        var name = names.getValue('name');
        if (!name || tables[name]) continue;
        var entry = new GlideRecord('sys_dictionary');
        entry.addQuery('name', name);
        entry.addQuery('sys_class_name', 'sys_dictionary');
        entry.orderBy('element');
        entry.query();
        var elements = [];
        var onlyStorage = true;
        var first = null;
        while (entry.next()) {
            var element = entry.getValue('element') || '(table entry)';
            elements.push(element);
            if (!storageElements[element]) onlyStorage = false;
            if (!first) first = entry.getUniqueValue();
        }
        if (onlyStorage || !first) continue;
        var source = new GlideRecord('sys_dictionary');
        source.get(first);
        engine.finding.setCurrentSource(source);
        engine.finding.setValue('finding_details', 'Table ' + name + ' does not exist; ' + elements.length + ' dictionary entr' + (elements.length == 1 ? 'y' : 'ies') + ': ' + elements.slice(0, 20).join(', '));
        engine.finding.increment();
    }
})(engine);`,
    resolutionDetails:
        'Delete the orphaned dictionary entries, or recreate the table if it was deleted by mistake.',
})

// IH-045: list layouts (sys_ui_list) where two elements share a position
export const ih047ListLayoutDuplicatePositions = ScriptOnlyCheck({
    $id: Now.ID['ih-047-list-layout-duplicate-positions'],
    name: 'IH-045 List layouts with duplicate positions',
    active: true,
    category: 'manageability',
    priority: '3',
    scoreScale: 2,
    shortDescription: 'Finds list layouts where two columns have the same position',
    description:
        'When two elements of a list layout share a position, the column order is undefined and can change between users and releases. Elements without a position are ignored. One finding per list layout. Ideal state: every element of a list layout has its own position.',
    script: `(function(engine) {
    var positions = {};
    // Elements without a position (empty rows without a field) are not counted as a shared position
    var dup = new GlideAggregate('sys_ui_list_element');
    dup.addNotNullQuery('position');
    dup.groupBy('list_id');
    dup.groupBy('position');
    dup.addAggregate('COUNT');
    dup.addHaving('COUNT', '>', '1');
    dup.query();
    while (dup.next()) {
        var listId = dup.getValue('list_id');
        if (!positions[listId]) positions[listId] = [];
        positions[listId].push(dup.getValue('position'));
    }
    for (var id in positions) {
        var list = new GlideRecord('sys_ui_list');
        if (!list.get(id)) continue;
        var details = [];
        for (var i = 0; i < positions[id].length; i++) {
            var element = new GlideRecord('sys_ui_list_element');
            element.addQuery('list_id', id);
            element.addQuery('position', positions[id][i]);
            element.query();
            var names = [];
            while (element.next()) names.push(element.getValue('element'));
            details.push('position ' + positions[id][i] + ': ' + names.join(', '));
        }
        engine.finding.setCurrentSource(list);
        engine.finding.setValue('finding_details', 'List layout ' + list.getValue('name') + ' (view ' + (list.view.getDisplayValue() || 'Default') + '): ' + details.join('; '));
        engine.finding.increment();
    }
})(engine);`,
    resolutionDetails:
        'Open the list layout (Configure > List Layout) and save it again, or fix the positions so each element has its own.',
})

// IH-055: update sets without description ("Default" excluded)
export const ih057UpdateSetWithoutDescription = TableCheck({
    $id: Now.ID['ih-057-update-set-without-description'],
    name: 'IH-055 Update sets without description',
    active: true,
    category: 'manageability',
    priority: '3',
    scoreScale: 2,
    shortDescription: 'Finds update sets without a description',
    description:
        'Without a description, reviewers and release managers cannot tell what an update set contains and why. "Default" update sets are ignored. Ideal state: every update set has a description.',
    table: 'sys_update_set',
    conditions: 'descriptionISEMPTY^name!=Default',
    resolutionDetails:
        'Describe the content and purpose of the update set, for example the story number and a short summary.',
})

// IH-059: complex conditions on custom UI actions (same rule as IH-038)
export const ih061UiActionComplexConditions = TableCheck({
    $id: Now.ID['ih-061-ui-action-complex-conditions'],
    name: 'IH-059 UI actions with complex conditions',
    active: true,
    category: 'manageability',
    priority: '3',
    scoreScale: 2,
    shortDescription: 'Finds custom UI actions with long or scripted conditions',
    description:
        'UI action conditions are evaluated for every record shown in a form or list, so queries and long scripts there slow down every page. A condition is complex when it is longer than 200 characters or contains a query (GlideRecord, GlideAggregate), a statement separator (;) or a function. Only custom UI actions are checked. Ideal state: UI action conditions are short expressions.',
    table: 'sys_ui_action',
    conditions: 'active=true^conditionISNOTEMPTY',
    advanced: true,
    script: `(function(engine, current) {
    var util = new x_bits2_inst_hlth.IHScanUtil();
    var condition = current.getValue('condition');
    var reasons = util.conditionComplexity(condition);
    if (reasons.length == 0) return;
    if (!util.isCustom(current)) return;
    engine.finding.setCurrentSource(current);
    engine.finding.setValue('finding_details', 'Complex condition on ' + (current.getValue('table') || 'global') + ' (' + reasons.join(', ') + '): ' + condition.substring(0, 300) + (condition.length > 300 ? '...' : ''));
    engine.finding.increment();
})(engine, current);`,
    resolutionDetails:
        'Move the logic into a script include function and call it from a short condition.',
})

// IH-062: scheduled jobs with an error on their trigger; linked to the job when it exists
export const ih064ScheduledJobErrors = TableCheck({
    $id: Now.ID['ih-064-scheduled-job-errors'],
    name: 'IH-062 Scheduled jobs with errors',
    active: true,
    category: 'manageability',
    priority: '2',
    scoreScale: 5,
    shortDescription: 'Finds scheduled jobs whose last run failed or that have an error count',
    description:
        'A failing scheduled job silently stops doing its work (cleanup, imports, calculations). Uses the error information of the scheduler trigger (sys_trigger). Ideal state: scheduled jobs run without errors.',
    table: 'sys_trigger',
    conditions: 'last_errorISNOTEMPTY^ORerror_count>0',
    advanced: true,
    script: `(function(engine, current) {
    var details = (current.getValue('error_count') > 0 ? current.getValue('error_count') + ' error(s)' : 'Last run failed') +
        (current.getValue('last_error') ? ': ' + current.getValue('last_error').substring(0, 500) : '');
    var job = null;
    if (current.getValue('document') && current.getValue('document_key')) {
        job = new GlideRecord(current.getValue('document'));
        if (!job.isValid() || !job.get(current.getValue('document_key'))) job = null;
    }
    engine.finding.setCurrentSource(job || current);
    engine.finding.setValue('finding_details', 'Job ' + current.getValue('name') + ': ' + details);
    engine.finding.increment();
})(engine, current);`,
    resolutionDetails:
        'Fix the job script or configuration (for "Unable to find the specified job handler", the plugin or job definition is missing); deactivate or delete obsolete jobs.',
})

// IH-074: share of active store applications with an update available (outdated share, user decision
// 2026-11-13 after the per-app TableCheck produced 408 findings); one summary finding above the threshold
export const ih082StoreAppsOutdatedShare = ScriptOnlyCheck({
    $id: Now.ID['ih-082-store-apps-outdated-share'],
    name: 'IH-074 Share of store applications not on the latest version',
    active: true,
    category: 'upgradability',
    priority: '2',
    scoreScale: 5,
    shortDescription: 'Reports the share of active store applications for which a newer version is available when it is above 20%',
    description:
        'Applications that fall behind the latest version miss fixes and security patches and make later upgrades harder. Counts active, visible store applications (sys_store_app, not hidden on the UI) and those with an update available (update_available, set by the store sync). One summary finding when more than 20% are outdated; the details show the share and the applications with the oldest versions. Ideal state: at most 20% of the active store applications are outdated.',
    script: `(function(engine) {
    var THRESHOLD = 20;

    var apps = new GlideRecord('sys_store_app');
    apps.addQuery('active', true);
    apps.addQuery('hide_on_ui', false);
    apps.query();
    var total = 0;
    var outdated = [];
    while (apps.next()) {
        total++;
        if (apps.getValue('update_available') == '1') {
            outdated.push(apps.getValue('name') + ' (' + apps.getValue('version') + ' to ' + apps.getValue('latest_version') + ')');
        }
    }
    if (total == 0 || outdated.length == 0) return;

    var share = outdated.length * 100 / total;
    if (share <= THRESHOLD) return;

    var table = new GlideRecord('sys_db_object');
    if (!table.get('name', 'sys_store_app')) return;
    engine.finding.setCurrentSource(table);
    engine.finding.setValue('finding_details', share.toFixed(1) + '% of the active store applications are not on the latest version (' + outdated.length + ' of ' + total + '). Examples: ' + outdated.slice(0, 10).join(', ') + (outdated.length > 10 ? ', ...' : ''));
    engine.finding.increment();
})(engine);`,
    resolutionDetails:
        'Open Application Manager, filter the applications with an update available, read the release notes and update them in a sub-production instance first, then promote. Plan regular update windows so the share stays below the threshold.',
})

// IH-066: changed ServiceNow dictionary entries; u_ tables and u_ fields are skipped because the
// platform list marks some of them as ServiceNow (seen: u_sys_choice.u_table)
export const ih069ChangedDictionaryEntries = ScriptOnlyCheck({
    $id: Now.ID['ih-069-changed-dictionary-entries'],
    name: 'IH-066 Changed ServiceNow dictionary entries',
    active: true,
    category: 'upgradability',
    priority: '2',
    scoreScale: 5,
    shortDescription: 'Finds ServiceNow dictionary entries that were changed by the customer',
    description:
        'Changed ServiceNow dictionary entries are skipped by upgrades and can break when ServiceNow changes the field. Uses the platform list of customized records; entries on u_ tables or u_ fields are ignored. Ideal state: ServiceNow dictionary entries are not changed; dictionary overrides are used instead.',
    script: `(function(engine) {
    new x_bits2_inst_hlth.IHScanUtil().reportBaselineChanges(engine, ['sys_dictionary'], function(entry) {
        return (entry.getValue('name') || '').indexOf('u_') == 0 || (entry.getValue('element') || '').indexOf('u_') == 0;
    });
})(engine);`,
    resolutionDetails:
        'Revert the dictionary entry to the base system version and use a dictionary override on the child table where possible.',
})

// IH-068: ServiceNow CI classes with more than 10 custom fields (u_ fields or fields from a customer app)
export const ih071CiClassesWithCustomFields = ScriptOnlyCheck({
    $id: Now.ID['ih-071-ci-classes-with-custom-fields'],
    name: 'IH-068 ServiceNow CI classes with more than 10 custom fields',
    active: true,
    category: 'upgradability',
    priority: '3',
    scoreScale: 2,
    shortDescription: 'Finds ServiceNow CI classes with more than 10 custom fields',
    description:
        'Many custom attributes on ServiceNow CI classes make the CMDB hard to maintain, are not filled by Discovery and complicate upgrades. Counts u_ fields and fields from customer applications on CI classes that come from ServiceNow. Ideal state: at most 10 custom fields per ServiceNow CI class.',
    script: `(function(engine) {
    var MAX_FIELDS = 10;
    var fieldsByClass = {};
    var field = new GlideRecord('sys_dictionary');
    field.addQuery('name', 'STARTSWITH', 'cmdb_ci');
    field.addNotNullQuery('element');
    field.addQuery('sys_class_name', 'sys_dictionary');
    field.query();
    while (field.next()) {
        var element = field.getValue('element');
        var custom = element.indexOf('u_') == 0 ||
            (element.indexOf('x_') == 0 && field.sys_package.sys_class_name + '' == 'sys_app');
        if (!custom) continue;
        var table = field.getValue('name');
        if (!fieldsByClass[table]) fieldsByClass[table] = [];
        fieldsByClass[table].push(element);
    }
    for (var name in fieldsByClass) {
        if (fieldsByClass[name].length <= MAX_FIELDS) continue;
        var ciClass = new GlideRecord('sys_db_object');
        if (!ciClass.get('name', name)) continue;
        if (ciClass.sys_package.sys_class_name + '' == 'sys_app') continue;
        engine.finding.setCurrentSource(ciClass);
        engine.finding.setValue('finding_details', 'CI class ' + name + ' has ' + fieldsByClass[name].length + ' custom fields (limit ' + MAX_FIELDS + '): ' + fieldsByClass[name].slice(0, 30).join(', '));
        engine.finding.increment();
    }
})(engine);`,
    resolutionDetails:
        'Review the custom fields: use existing attributes, move class-specific data to a custom child class, or store related data in a separate table.',
})

// IH-069: current.update() in custom business rules that are not before rules (before rules: IH-013)
export const ih072CurrentUpdateInBusinessRules = TableCheck({
    $id: Now.ID['ih-072-current-update-in-business-rules'],
    name: 'IH-069 current.update() in business rules',
    active: true,
    category: 'manageability',
    priority: '2',
    scoreScale: 5,
    shortDescription: 'Finds custom after, async and display business rules that call current.update()',
    description:
        'current.update() in a business rule saves the record again and runs all business rules a second time, which can cause loops and duplicate notifications. Before rules are covered by IH-013. Only custom business rules are checked; every matching line is listed. Ideal state: no business rule calls current.update().',
    table: 'sys_script',
    conditions: 'active=true^when!=before^scriptLIKEcurrent.update(',
    advanced: true,
    script: `(function(engine, current) {
    var util = new x_bits2_inst_hlth.IHScanUtil();
    if (!util.isCustom(current)) return;
    var lines = util.matchingLines(current.getValue('script'), /\\bcurrent\\s*\\.\\s*update\\s*\\(/);
    if (lines.length > 0)
        util.reportLines(engine, current, lines, 'Business rule (' + (current.getValue('when') || 'no when') + ') on ' + current.getValue('collection'));
})(engine, current);`,
    resolutionDetails:
        'Set the values in a before rule instead, or move the logic so that current does not need to be saved again.',
})

// IH-021: summary of the last platform upgrade (the per-item log sys_upgrade_history_log cannot be
// read from other scopes); items that need a review = skipped and different + errors + manual merges
export const ih022UpgradeSkippedItems = ScriptOnlyCheck({
    $id: Now.ID['ih-022-upgrade-skipped-items'],
    name: 'IH-021 Skipped items in the last upgrade',
    active: true,
    category: 'upgradability',
    priority: '1',
    scoreScale: 100,
    shortDescription: 'Reports the last platform upgrade if skipped items still need a review',
    description:
        'An upgrade skips ServiceNow records that the customer changed. Skipped records that differ from the new version, skipped records with errors and manual merges must be reviewed, otherwise fixes of the upgrade are missing. Skipped records that already match the new version are not counted. Uses the summary of the last platform upgrade. Ideal state: no skipped item needs a review.',
    script: `(function(engine) {
    var upgrade = new GlideRecord('sys_upgrade_history');
    upgrade.addQuery('to_version', 'STARTSWITH', 'glide-');
    upgrade.orderByDesc('sys_created_on');
    upgrade.setLimit(1);
    upgrade.query();
    if (!upgrade.next()) return;

    function count(field) {
        return parseInt(upgrade.getValue(field), 10) || 0;
    }
    var different = count('skipped_and_different');
    var errors = count('skipped_error');
    var manualMerge = count('skipped_manual_merge');
    var toReview = different + errors + manualMerge;
    if (toReview == 0) return;

    engine.finding.setCurrentSource(upgrade);
    engine.finding.setValue('finding_details', toReview + ' skipped item(s) to review in the upgrade to ' + upgrade.getValue('to_version') +
        ' (finished ' + upgrade.getValue('upgrade_finished') + '): ' + different + ' skipped and different, ' + errors + ' skipped with error, ' +
        manualMerge + ' manual merge. ' + count('skipped_and_not_different') + ' further skipped item(s) already match the new version.');
    engine.finding.increment();
})(engine);`,
    resolutionDetails:
        'Open the upgrade history, filter the skipped records that differ, have errors or need a manual merge, and for each one revert to the base system, merge the changes, or keep the customization and mark it reviewed.',
})

// IH-024 to IH-028: ServiceNow records changed by the customer (sys_metadata_customization,
// author_type ServiceNow), one check per record type group

export const ih025BaselineBusinessRules = ScriptOnlyCheck({
    $id: Now.ID['ih-025-baseline-business-rules'],
    name: 'IH-024 Differs from baseline: business rules',
    active: true,
    category: 'upgradability',
    priority: '2',
    scoreScale: 5,
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
    name: 'IH-025 Differs from baseline: script includes',
    active: true,
    category: 'upgradability',
    priority: '2',
    scoreScale: 5,
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
    name: 'IH-026 Differs from baseline: client scripts and UI scripts',
    active: true,
    category: 'upgradability',
    priority: '2',
    scoreScale: 5,
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
    name: 'IH-027 Differs from baseline: UI macros and UI pages',
    active: true,
    category: 'upgradability',
    priority: '2',
    scoreScale: 5,
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
    name: 'IH-028 Differs from baseline: UI actions',
    active: true,
    category: 'upgradability',
    priority: '2',
    scoreScale: 5,
    shortDescription: 'Finds ServiceNow UI actions that were changed by the customer',
    description:
        'Changed ServiceNow UI actions are skipped by upgrades, so they miss fixes and new features and must be reviewed by hand. Uses the platform list of customized records (sys_metadata_customization) and reports records originally delivered by ServiceNow. Ideal state: ServiceNow UI actions are not changed; customizations are made in copies or extensions.',
    script: `(function(engine) {
    new x_bits2_inst_hlth.IHScanUtil().reportBaselineChanges(engine, ['sys_ui_action']);
})(engine);`,
    resolutionDetails:
        'Revert the record to the base system version where possible (Revert to Base System in the versions list), or move the change into a copy or extension and document why it is needed.',
})
