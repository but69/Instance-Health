// Instance Health: create test data for the scan checks
// Run in System Definition > Scripts - Background, scope global, as admin.
// Creates positive (must be found) and negative (must not be found) records for
// IH-001 to IH-003, IH-005, IH-006, IH-008 to IH-016, IH-018, IH-020, IH-023 to IH-030,
// IH-032, IH-034, IH-035, IH-037 to IH-043 (test users ih.test.*, the active one locked out),
// IH-045 to IH-049, IH-052 to IH-055 and IH-057 (view ih_test, on-demand jobs, tasks marked IH-TEST),
// IH-059, IH-062, IH-063, IH-064, IH-065, IH-069 and IH-071 to IH-073 (imports scheduled for 2099,
// disabled trigger, computer without name marked by serial IHTEST-074).
// Every record is marked with IH-TEST (script includes: name starts with IHTest, UI page:
// ih_test_) and captured in the update set "Instance Health - Test Data". Records are created
// in global with a customer update, so they count as custom for the checks that only report
// custom code. IH-023 and IH-024 to IH-028 use synthetic statistics / customization rows.
// Not covered: IH-004 and IH-007 (need a failing PA job / 5 million rows), IH-017 (would
// need a new table; the instance has real findings), IH-044 (real findings), IH-019, IH-022,
// IH-031, IH-033, IH-036, IH-050, IH-051 and IH-056 (instance-wide settings), IH-021 (needs a
// platform upgrade).
// Test business rules have condition "false" and test ACLs sit on a non-existent field,
// so none of them ever runs or decides access.
// Remove everything again with remove-test-data.js.

// Records and update sets follow the user's current application, not the script scope.
// Run in global so nothing lands in a scoped app (e.g. Instance Health itself), and
// always restore the user's application afterwards (this also restores its update set).
function runInGlobal(fn) {
    var previousApp = gs.getCurrentApplicationId();
    gs.setCurrentApplicationId('global');
    try {
        if (gs.getCurrentApplicationId() != 'global')
            throw new Error('Could not switch the current application to global.');
        fn();
    } finally {
        if (previousApp && previousApp != 'global')
            gs.setCurrentApplicationId(previousApp);
    }
}

runInGlobal(function createInstanceHealthTestData() {
    var MARKER = 'IH-TEST';
    var UPDATE_SET_NAME = 'Instance Health - Test Data';
    var IH003_POSITIVE_TABLE = 'cmn_building';
    var IH003_NEGATIVE_TABLE = 'cmn_department';
    var EMPTY_ONLOAD = 'function onLoad() {\n    // ' + MARKER + ': test data for Instance Health, safe to delete\n}';
    var created = [];

    function insert(table, values) {
        var gr = new GlideRecord(table);
        gr.initialize();
        for (var field in values)
            gr.setValue(field, values[field]);
        var sysId = gr.insert();
        if (!sysId)
            throw new Error('Insert into ' + table + ' failed: ' + JSON.stringify(values));
        created.push(table + ' ' + sysId);
        return sysId;
    }

    // For records the platform may refuse (duplicate names, ACLs without security_admin)
    var warnings = [];
    function tryInsert(label, table, values) {
        try {
            return insert(table, values);
        } catch (e) {
            warnings.push(label + ': ' + e.message);
            return null;
        }
    }

    function scriptInclude(name, description, body) {
        return {
            name: name,
            description: MARKER + ' ' + description,
            active: 'true',
            access: 'package_private',
            script: 'var ' + name + ' = Class.create();\n' + name + '.prototype = {\n    initialize: function() {},\n    neverCalled: function() {\n' + body + '\n    },\n    type: \'' + name + '\'\n};'
        };
    }

    function testRule(name, table, when, body) {
        return {
            name: MARKER + ' ' + name,
            collection: table,
            when: when,
            action_update: 'true',
            active: 'true',
            advanced: 'true',
            condition: 'false',
            script: '(function executeRule(current, previous) {\n    // ' + MARKER + ': never runs, condition is false\n' + body + '\n})(current, previous);'
        };
    }

    function exists() {
        var gr = new GlideRecord('sys_update_set');
        gr.addQuery('name', UPDATE_SET_NAME);
        gr.query();
        return gr.hasNext();
    }

    if (exists()) {
        gs.info('Update set "' + UPDATE_SET_NAME + '" already exists. Run remove-test-data.js first.');
        return;
    }

    // Capture everything in a dedicated global update set
    // (GlideUpdateSet.create() returns nothing on bithawkdemo1, so insert it directly)
    var updateSet = new GlideRecord('sys_update_set');
    updateSet.initialize();
    updateSet.setValue('name', UPDATE_SET_NAME);
    updateSet.setValue('application', 'global');
    updateSet.setValue('state', 'in progress');
    updateSet.setValue('description', MARKER + ': test data for Instance Health, safe to delete');
    var updateSetId = updateSet.insert();
    if (!updateSetId)
        throw new Error('Could not create update set "' + UPDATE_SET_NAME + '".');
    new GlideUpdateSet().set(updateSetId);

    // IH-001: published report (positive) and unpublished report (negative).
    // is_published is set by the OOB rule "Report roles updated - is_publish field" from roles.
    var publicReport = insert('sys_report', {
        title: MARKER + ' IH-001 public report',
        table: 'incident',
        type: 'list',
        field_list: 'number,short_description',
        roles: 'public'
    });
    var privateReport = insert('sys_report', {
        title: MARKER + ' IH-001 private report',
        table: 'incident',
        type: 'list',
        field_list: 'number,short_description',
        roles: ''
    });

    // IH-002: synthetic report stats, 8 s (positive), 3 s (negative), 8 s without recent runs (negative)
    insert('report_stats', {
        report_table: 'sys_report',
        report_sys_id: publicReport,
        recent_avg_execution_duration: 8000,
        average_execution_duration: 8000,
        recent_number_executions: 3,
        number_executions_total: 3
    });
    insert('report_stats', {
        report_table: 'sys_report',
        report_sys_id: privateReport,
        recent_avg_execution_duration: 3000,
        average_execution_duration: 3000,
        recent_number_executions: 3,
        number_executions_total: 3
    });

    // IH-003: 11 active scripts on the positive table, 10 active + 2 inactive on the negative table
    var i;
    for (i = 1; i <= 11; i++)
        insert('sys_script_client', {
            name: MARKER + ' IH-003 positive ' + i,
            table: IH003_POSITIVE_TABLE,
            type: 'onLoad',
            ui_type: '0',
            active: 'true',
            script: EMPTY_ONLOAD
        });
    for (i = 1; i <= 12; i++)
        insert('sys_script_client', {
            name: MARKER + ' IH-003 negative ' + i,
            table: IH003_NEGATIVE_TABLE,
            type: 'onLoad',
            ui_type: '0',
            active: i <= 10 ? 'true' : 'false',
            script: EMPTY_ONLOAD
        });

    // IH-005: global UI script (positive), non-global UI script (negative)
    insert('sys_ui_script', {
        name: 'IH_TEST_IH005_global',
        description: MARKER + ' IH-005 global UI script',
        global: 'true',
        active: 'true',
        ui_type: '0',
        script: '// ' + MARKER + ': test data for Instance Health, safe to delete'
    });
    insert('sys_ui_script', {
        name: 'IH_TEST_IH005_not_global',
        description: MARKER + ' IH-005 non-global UI script',
        global: 'false',
        active: 'true',
        ui_type: '0',
        script: '// ' + MARKER + ': test data for Instance Health, safe to delete'
    });

    // IH-006: active client script on global (positive), inactive one (negative)
    insert('sys_script_client', {
        name: MARKER + ' IH-006 global active',
        table: 'global',
        type: 'onLoad',
        ui_type: '0',
        active: 'true',
        script: EMPTY_ONLOAD
    });
    insert('sys_script_client', {
        name: MARKER + ' IH-006 global inactive',
        table: 'global',
        type: 'onLoad',
        ui_type: '0',
        active: 'false',
        script: EMPTY_ONLOAD
    });

    // IH-008: script include calling gs.sql (positive), and only in comments (negative).
    // The functions are never called, so gs.sql is not executed.
    insert('sys_script_include', {
        name: 'IHTestGsSqlUsed',
        description: MARKER + ' IH-008 gs.sql in code',
        active: 'true',
        access: 'package_private',
        script: 'var IHTestGsSqlUsed = Class.create();\nIHTestGsSqlUsed.prototype = {\n    initialize: function() {},\n    neverCalled: function() {\n        return gs.sql(\'SELECT 1\');\n    },\n    type: \'IHTestGsSqlUsed\'\n};'
    });
    insert('sys_script_include', {
        name: 'IHTestGsSqlCommented',
        description: MARKER + ' IH-008 gs.sql only in comments',
        active: 'true',
        access: 'package_private',
        script: 'var IHTestGsSqlCommented = Class.create();\nIHTestGsSqlCommented.prototype = {\n    initialize: function() {},\n    neverCalled: function() {\n        // return gs.sql(\'SELECT 1\');\n        /* var rows = gs.sql(\'SELECT 2\'); */\n        return null;\n    },\n    type: \'IHTestGsSqlCommented\'\n};'
    });

    // IH-009: dot-walk to sys_id (positive), getValue (negative)
    insert('sys_script_include', scriptInclude('IHTestDotWalkUsed', 'IH-009 dot-walk to sys_id',
        '        var gr = new GlideRecord(\'incident\');\n        return gr.caller_id.sys_id + \'\';'));
    insert('sys_script_include', scriptInclude('IHTestDotWalkAvoided', 'IH-009 getValue instead of dot-walk',
        '        var gr = new GlideRecord(\'incident\');\n        // return gr.caller_id.sys_id + \'\';\n        return gr.getValue(\'caller_id\');'));
    insert('sys_script_include', scriptInclude('IHTestDotWalkChained', 'IH-009 sys_id followed by a dot',
        '        var gr = new GlideRecord(\'incident\');\n        var a = gr.caller_id.sys_id.toString();\n        return a + gr.sys_id.sys_id;'));

    // IH-010: synchronous (positive) and asynchronous (negative) client calls on cmn_location
    insert('sys_script_client', {
        name: MARKER + ' IH-010 synchronous ajax',
        table: 'cmn_location',
        type: 'onLoad',
        ui_type: '0',
        active: 'true',
        script: 'function onLoad() {\n    // ' + MARKER + ': test data for Instance Health, safe to delete\n    if (false) {\n        var ga = new GlideAjax(\'IHTestNoSuchAjax\');\n        ga.getXMLWait();\n    }\n}'
    });
    insert('sys_script_client', {
        name: MARKER + ' IH-010 asynchronous ajax',
        table: 'cmn_location',
        type: 'onLoad',
        ui_type: '0',
        active: 'true',
        script: 'function onLoad() {\n    // ' + MARKER + ': test data for Instance Health, safe to delete\n    if (false) {\n        var ga = new GlideAjax(\'IHTestNoSuchAjax\');\n        ga.getXMLAnswer(function(answer) {});\n    }\n}'
    });

    // IH-011: hard-coded instance URL (positive), property (negative)
    insert('sys_script_include', scriptInclude('IHTestUrlHardCoded', 'IH-011 hard-coded instance URL',
        '        return \'https://ihtest.service-now.com/nav_to.do\';'));
    insert('sys_script_include', scriptInclude('IHTestUrlProperty', 'IH-011 URL from property',
        '        return gs.getProperty(\'glide.servlet.uri\') + \'nav_to.do\';'));

    // IH-012: literal sys_id (positive), lookup by name (negative)
    insert('sys_script_include', scriptInclude('IHTestSysIdHardCoded', 'IH-012 hard-coded sys_id',
        '        var gr = new GlideRecord(\'sys_user\');\n        return gr.get(\'0123456789abcdef0123456789abcdef\');'));
    insert('sys_script_include', scriptInclude('IHTestSysIdLookup', 'IH-012 lookup by name',
        '        var gr = new GlideRecord(\'sys_user\');\n        return gr.get(\'user_name\', \'ih.test\');'));

    // IH-013: before rule updating another record (positive), before rule setting current and
    // after rule updating another record (negative). Condition false: they never run.
    insert('sys_script', testRule('IH-013 before rule with update', 'cmn_location', 'before',
        '    var other = new GlideRecord(\'cmn_location\');\n    other.update();'));
    // sys_script.name holds at most 40 characters including the "IH-TEST " prefix
    insert('sys_script', testRule('IH-013 before rule no update', 'cmn_location', 'before',
        '    current.setValue(\'street\', current.getValue(\'street\'));'));
    insert('sys_script', testRule('IH-013 after rule with update', 'cmn_location', 'after',
        '    var other = new GlideRecord(\'cmn_location\');\n    other.update();'));

    // IH-014: active global rule (positive), inactive global rule (negative).
    // Global rules are loaded on every transaction, so the script only declares a function.
    var globalRule = {
        collection: 'global',
        when: 'before',
        advanced: 'true',
        condition: 'false',
        script: '// ' + MARKER + ': test data for Instance Health, safe to delete\nfunction ihTestGlobalRuleNoop() {}'
    };
    globalRule.name = MARKER + ' IH-014 global rule active';
    globalRule.active = 'true';
    insert('sys_script', globalRule);
    globalRule.name = MARKER + ' IH-014 global rule inactive';
    globalRule.active = 'false';
    insert('sys_script', globalRule);

    // IH-015: two script includes with the same API name (positive), a unique one (negative)
    tryInsert('IH-015 duplicate 1', 'sys_script_include', scriptInclude('IHTestDuplicate', 'IH-015 duplicate name (1)', '        return 1;'));
    tryInsert('IH-015 duplicate 2', 'sys_script_include', scriptInclude('IHTestDuplicate', 'IH-015 duplicate name (2)', '        return 2;'));
    insert('sys_script_include', scriptInclude('IHTestUnique', 'IH-015 unique name', '        return 0;'));

    // IH-016: transform maps coalescing on fax_phone (no index, positive) and name (indexed, negative).
    // The maps are never run; their source is the import set row base table.
    var coalesceCases = [['IH-016 coalesce without index', 'fax_phone'], ['IH-016 coalesce with index', 'name']];
    for (var c = 0; c < coalesceCases.length; c++) {
        var mapId = insert('sys_transform_map', {
            name: MARKER + ' ' + coalesceCases[c][0],
            source_table: 'sys_import_set_row',
            target_table: 'cmn_location',
            active: 'true',
            run_business_rules: 'false'
        });
        insert('sys_transform_entry', {
            map: mapId,
            source_table: 'sys_import_set_row',
            source_field: 'sys_id',
            target_table: 'cmn_location',
            target_field: coalesceCases[c][1],
            coalesce: 'true'
        });
    }

    // IH-018: read ACLs on a non-existent field, with a query (positive) and without (negative)
    var readOperation = new GlideRecord('sys_security_operation');
    if (readOperation.get('name', 'read')) {
        tryInsert('IH-018 read ACL with query', 'sys_security_acl', {
            name: 'cmn_location.u_ih_test_query',
            type: 'record',
            operation: readOperation.getUniqueValue(),
            active: 'true',
            advanced: 'true',
            description: MARKER + ' IH-018 read ACL with GlideRecord, on a field that does not exist',
            script: 'var gr = new GlideRecord(\'sys_user\');\ngr.get(gs.getUserID());\nanswer = gr.isValidRecord();'
        });
        tryInsert('IH-018 read ACL without query', 'sys_security_acl', {
            name: 'cmn_location.u_ih_test_role',
            type: 'record',
            operation: readOperation.getUniqueValue(),
            active: 'true',
            advanced: 'true',
            description: MARKER + ' IH-018 read ACL without query, on a field that does not exist',
            script: '// var gr = new GlideRecord(\'sys_user\');\nanswer = gs.hasRole(\'itil\');'
        });
    } else {
        warnings.push('IH-018: operation "read" not found, ACLs not created');
    }

    // IH-020: outbound REST call in an after rule (positive) and in an async rule (negative)
    var restCall = '    var request = new sn_ws.RESTMessageV2();\n    request.setEndpoint(\'https://example.invalid\');';
    insert('sys_script', testRule('IH-020 after rule with REST call', 'cmn_location', 'after', restCall));
    insert('sys_script', testRule('IH-020 async rule with REST call', 'cmn_location', 'async', restCall));

    // IH-023: synthetic slow script statistics: 8 s recent (positive, linked to a test script
    // include), 8 s last seen 60 days ago and 3 s recent (negative)
    var ih024Source = new GlideRecord('sys_script_include');
    ih024Source.get('name', 'IHTestUnique');
    var sixtyDaysAgo = new GlideDateTime();
    sixtyDaysAgo.addDaysUTC(-60);
    var slowCases = [['IH-023 slow recent', 8000, new GlideDateTime()], ['IH-023 slow old', 8000, sixtyDaysAgo], ['IH-023 fast recent', 3000, new GlideDateTime()]];
    for (var s = 0; s < slowCases.length; s++)
        tryInsert(slowCases[s][0], 'sys_script_pattern', {
            label: MARKER + ' ' + slowCases[s][0],
            average: slowCases[s][1],
            count: 3,
            last: slowCases[s][2].getValue(),
            first: slowCases[s][2].getValue(),
            script_source_table: 'sys_script_include',
            script_source: ih024Source.getUniqueValue()
        });

    // IH-024 to IH-028: mark test records as changed ServiceNow records in the platform list of
    // customized records (sys_metadata_customization). Positive: author_type ServiceNow.
    var uiActionId = insert('sys_ui_action', {
        name: MARKER + ' IH-028 UI action',
        table: 'cmn_location',
        active: 'false',
        script: '// ' + MARKER + ': test data for Instance Health, safe to delete'
    });
    var uiPageId = insert('sys_ui_page', {
        name: 'ih_test_ih028_page',
        description: MARKER + ' IH-027 UI page',
        html: '<?xml version="1.0" encoding="utf-8" ?><j:jelly trim="false" xmlns:j="jelly:core" xmlns:g="glide" xmlns:j2="null" xmlns:g2="null"><!-- ' + MARKER + ' --></j:jelly>'
    });
    function markCustomized(label, table, field, value, authorType) {
        var rec = new GlideRecord(table);
        if (!rec.get(field, value)) {
            warnings.push(label + ': record not found');
            return;
        }
        var row = new GlideRecord('sys_metadata_customization');
        if (row.get('sys_metadata', rec.getUniqueValue())) {
            row.setValue('author_type', authorType);
            row.update();
        } else {
            tryInsert(label, 'sys_metadata_customization', { sys_metadata: rec.getUniqueValue(), author_type: authorType });
        }
    }
    markCustomized('IH-024 positive', 'sys_script', 'name', MARKER + ' IH-013 before rule with update', 'ServiceNow');
    markCustomized('IH-024 negative', 'sys_script', 'name', MARKER + ' IH-013 before rule no update', 'Custom');
    markCustomized('IH-025 positive', 'sys_script_include', 'name', 'IHTestUnique', 'ServiceNow');
    markCustomized('IH-026 positive', 'sys_script_client', 'name', MARKER + ' IH-010 asynchronous ajax', 'ServiceNow');
    markCustomized('IH-027 positive', 'sys_ui_page', 'sys_id', uiPageId, 'ServiceNow');
    markCustomized('IH-028 positive', 'sys_ui_action', 'sys_id', uiActionId, 'ServiceNow');

    // IH-029 and IH-030: test computers (serial numbers set where IH-030 must not report them)
    function computer(name, values) {
        values.name = MARKER + ' ' + name;
        return insert('cmdb_ci_computer', values);
    }
    var virtualWithAsset = computer('IH-029 virtual with asset', { virtual: 'true', serial_number: 'IHTEST-030-1' });
    // Negative case: a physical computer. A virtual computer without asset does not stay that way on
    // bithawkdemo1: a platform job creates "Unknown" assets for computers without asset (seen 2026-11-06).
    computer('IH-029 physical computer', { virtual: 'false', serial_number: 'IHTEST-030-2' });
    var assetId = tryInsert('IH-029 asset', 'alm_hardware', { asset_tag: MARKER + '-030', serial_number: 'IHTEST-030-1' });
    if (assetId) {
        var vci = new GlideRecord('cmdb_ci_computer');
        vci.get(virtualWithAsset);
        vci.setValue('asset', assetId);
        vci.update();
    }
    computer('IH-030 no serial', {});
    computer('IH-030 retired no serial', { install_status: '7' });
    computer('IH-030 with serial', { serial_number: 'IHTEST-031-1' });

    // IH-032: invalid discovery source (positive), valid one and retired CI with invalid one (negative).
    // Serial numbers set so IH-030 does not report these computers.
    computer('IH-032 invalid source', { discovery_source: MARKER + ' invalid', serial_number: 'IHTEST-033-1' });
    computer('IH-032 valid source', { discovery_source: 'ManualEntry', serial_number: 'IHTEST-033-2' });
    computer('IH-032 retired invalid source', { discovery_source: MARKER + ' invalid', serial_number: 'IHTEST-033-3', install_status: '7' });

    // IH-034: two update sets with the same name (positive), one unique (negative); state complete
    insert('sys_update_set', { name: MARKER + ' IH-034 duplicate name', application: 'global', state: 'complete' });
    insert('sys_update_set', { name: MARKER + ' IH-034 duplicate name', application: 'global', state: 'complete' });
    // The duplicates have no description (IH-055 positive), the unique one has one (IH-055 negative)
    insert('sys_update_set', { name: MARKER + ' IH-034 unique name', application: 'global', state: 'complete', description: MARKER + ': test data for Instance Health' });

    // IH-035: active knowledge base without retire workflow (positive), with one and inactive (negative)
    // Any existing workflow is enough for the check; prefer one for kb_knowledge (bithawkdemo1 has none)
    var kbWorkflow = new GlideRecord('wf_workflow');
    kbWorkflow.addQuery('table', 'kb_knowledge');
    kbWorkflow.setLimit(1);
    kbWorkflow.query();
    if (!kbWorkflow.hasNext()) {
        kbWorkflow = new GlideRecord('wf_workflow');
        kbWorkflow.setLimit(1);
        kbWorkflow.query();
    }
    var kbBase = { owner: gs.getUserID(), active: 'true' };
    function knowledgeBase(title, values) {
        var v = { title: MARKER + ' ' + title, owner: kbBase.owner, active: kbBase.active };
        for (var k in values) v[k] = values[k];
        return tryInsert(title, 'kb_knowledge_base', v);
    }
    knowledgeBase('IH-035 KB without retire workflow', {});
    if (kbWorkflow.next())
        knowledgeBase('IH-035 KB with retire workflow', { retire_workflow: kbWorkflow.getUniqueValue() });
    else
        warnings.push('IH-035: no workflow on kb_knowledge found, negative case with retire workflow not created');
    knowledgeBase('IH-035 KB inactive', { active: 'false' });

    // IH-037: business rules passing current to a script include that updates its parameter
    // (positive) and to one that only reads it (negative). Condition false: they never run.
    insert('sys_script_include', scriptInclude('IHTestUpdatesParam', 'IH-037 updates its parameter',
        '        return null;\n    },\n    touch: function(record) {\n        record.update();'));
    insert('sys_script_include', scriptInclude('IHTestReadsParam', 'IH-037 only reads its parameter',
        '        return null;\n    },\n    read: function(record) {\n        return record.getValue(\'name\');'));
    insert('sys_script', testRule('IH-037 calls updating include', 'cmn_location', 'before',
        '    new IHTestUpdatesParam().touch(current);'));
    insert('sys_script', testRule('IH-037 calls reading include', 'cmn_location', 'before',
        '    new IHTestReadsParam().read(current);'));
    // Only the called function counts: peek() only reads, although touch() of the same include updates its parameter
    insert('sys_script_include', scriptInclude('IHTestUpdatesOther', 'IH-037 other function updates',
        '        return null;\n    },\n    touch: function(record) {\n        record.update();\n    },\n    peek: function(record) {\n        return record.getValue(\'name\');'));
    insert('sys_script', testRule('IH-037 calls other function', 'cmn_location', 'before',
        '    new IHTestUpdatesOther().peek(current);'));

    // IH-038: complex condition (positive); all other test rules have the simple condition "false".
    // The condition short-circuits, so the function is never called.
    var complexRule = testRule('IH-038 complex condition', 'cmn_location', 'before', '    // nothing');
    complexRule.condition = 'false && (function() { var x = 1; return x > 1; })()';
    insert('sys_script', complexRule);

    // IH-039 to IH-043: test users (active one is locked out), groups, memberships and roles
    var activeUser = insert('sys_user', { user_name: 'ih.test.active', first_name: MARKER, last_name: 'active user', active: 'true', locked_out: 'true' });
    var inactiveUser = insert('sys_user', { user_name: 'ih.test.inactive', first_name: MARKER, last_name: 'inactive user', active: 'false' });
    function group(name, values) {
        values.name = MARKER + ' ' + name;
        values.active = 'true';
        values.description = MARKER + ': test data for Instance Health, safe to delete';
        return insert('sys_user_group', values);
    }
    function member(groupId, userId) {
        insert('sys_user_grmember', { group: groupId, user: userId });
    }
    var testRole = new GlideRecord('sys_user_role');
    testRole.get('name', 'personalize_choices');

    var g40 = group('IH-039 inactive member', { manager: activeUser });
    member(g40, inactiveUser);
    member(g40, activeUser);
    var g41 = group('IH-040 inactive manager', { manager: inactiveUser });
    member(g41, activeUser);
    group('IH-041 without members', { manager: activeUser });
    var g44a = group('IH-043 role without type', { manager: activeUser });
    member(g44a, activeUser);
    insert('sys_group_has_role', { group: g44a, role: testRole.getUniqueValue() });
    var catalogType = new GlideRecord('sys_user_group_type');
    catalogType.get('name', 'catalog');
    var g44b = group('IH-043 role with type', { manager: activeUser, type: catalogType.getUniqueValue() });
    member(g44b, activeUser);
    insert('sys_group_has_role', { group: g44b, role: testRole.getUniqueValue() });
    // IH-042: direct role for the active test user (positive); the roles inherited from the
    // IH-043 groups are the negative case
    insert('sys_user_has_role', { user: activeUser, role: testRole.getUniqueValue() });

    // IH-045: list layout of cmn_location in a test view, two elements at position 0 (positive)
    var viewId = insert('sys_ui_view', { name: 'ih_test', title: MARKER + ' view' });
    var listId = insert('sys_ui_list', { name: 'cmn_location', view: viewId });
    insert('sys_ui_list_element', { list_id: listId, element: 'name', position: '0' });
    insert('sys_ui_list_element', { list_id: listId, element: 'city', position: '0' });
    insert('sys_ui_list_element', { list_id: listId, element: 'street', position: '1' });

    // IH-046: catalog task without requested item and request (positive)
    tryInsert('IH-046 catalog task', 'sc_task', { short_description: MARKER + ' IH-046 catalog task without request' });

    // IH-047, IH-048: on-demand jobs (never scheduled) run as a missing user, an inactive user
    // (positive), an active user and the internal user "system" (negative)
    function job(name, runAs) {
        return tryInsert(name, 'sysauto_script', {
            name: MARKER + ' ' + name,
            active: 'true',
            run_type: 'on_demand',
            run_as: runAs,
            script: '// ' + MARKER + ': test data for Instance Health, safe to delete'
        });
    }
    job('IH-047 run as deleted user', 'ih.test.deleted');
    job('IH-048 run as inactive user', inactiveUser);
    job('IH-047 run as active user', activeUser);
    job('IH-047 run as system', 'system');
    job('IH-047 run as empty', '');

    // IH-049 and IH-054: plain tasks
    insert('task', { short_description: MARKER + ' IH-049 opened by inactive user', opened_by: inactiveUser, active: 'true' });
    insert('task', { short_description: MARKER + ' IH-049 opened by active user', opened_by: activeUser, active: 'true' });
    insert('task', { short_description: MARKER + ' IH-054 active with closed date', opened_by: activeUser, active: 'true', closed_at: new GlideDateTime().getValue() });

    // IH-052, IH-053: resolved incident and closed problem inserted without business rules, so
    // mark_resolved / the problem closure rule do not fill the fields (positive)
    function insertWithoutRules(table, values) {
        var gr = new GlideRecord(table);
        gr.initialize();
        gr.setWorkflow(false);
        for (var field in values)
            gr.setValue(field, values[field]);
        var sysId = gr.insert();
        if (!sysId)
            throw new Error('Insert into ' + table + ' failed (' + gr.getLastErrorMessage() + '): ' + JSON.stringify(values));
        created.push(table + ' ' + sysId);
        return sysId;
    }
    // The data policy "Make close info mandatory when resolved or closed" needs a resolution code and close notes
    var closeCode = new GlideRecord('sys_choice');
    closeCode.addQuery('name', 'incident');
    closeCode.addQuery('element', 'close_code');
    closeCode.addQuery('inactive', false);
    closeCode.setLimit(1);
    closeCode.query();
    var closeCodeValue = closeCode.next() ? closeCode.getValue('value') : '';
    try {
        insertWithoutRules('incident', { short_description: MARKER + ' IH-052 resolved without resolved by', caller_id: activeUser, opened_by: activeUser, state: '6',
            close_code: closeCodeValue, close_notes: MARKER + ': test data for Instance Health, safe to delete' });
    } catch (e) {
        warnings.push('IH-052 incident: ' + e.message);
    }
    try {
        // Data policies for closed problems: Assigned to, Resolution code and Close notes are mandatory
        insertWithoutRules('problem', { short_description: MARKER + ' IH-053 closed without closed by', opened_by: activeUser, assigned_to: activeUser,
            resolution_code: 'canceled', close_notes: MARKER + ': test data for Instance Health, safe to delete', state: '107', active: 'false', closed_at: new GlideDateTime().getValue() });
    } catch (e) {
        warnings.push('IH-053 problem: ' + e.message);
    }

    // IH-057: scripted REST API with a resource without ACL authorization (positive) and one with
    // both settings (negative). Both require authentication, so nothing is public.
    var restApi = tryInsert('IH-057 API', 'sys_ws_definition', { name: MARKER + ' IH-057 API', service_id: 'ih_test_api', active: 'true' });
    if (restApi) {
        var noContent = '(function process(request, response) {\n    // ' + MARKER + ': test data for Instance Health, safe to delete\n    response.setStatus(204);\n})(request, response);';
        tryInsert('IH-057 resource without ACL', 'sys_ws_operation', {
            name: MARKER + ' IH-057 without ACL', web_service_definition: restApi, http_method: 'GET', relative_path: '/without_acl',
            requires_authentication: 'true', requires_acl_authorization: 'false', active: 'true', operation_script: noContent
        });
        tryInsert('IH-057 resource with ACL', 'sys_ws_operation', {
            name: MARKER + ' IH-057 with ACL', web_service_definition: restApi, http_method: 'GET', relative_path: '/with_acl',
            requires_authentication: 'true', requires_acl_authorization: 'true', active: 'true', operation_script: noContent
        });
    }

    // IH-059 and IH-073: active UI actions on cmn_location; the conditions are false, so they are
    // never shown. IH-059: complex condition (positive), simple one (negative). IH-073: synchronous
    // REST call (positive), executeAsync only (negative).
    function uiAction(name, values) {
        values.name = MARKER + ' ' + name;
        values.table = 'cmn_location';
        values.active = 'true';
        values.client = 'false';
        if (!values.condition) values.condition = 'false';
        if (!values.script) values.script = '// ' + MARKER + ': test data for Instance Health, safe to delete';
        return insert('sys_ui_action', values);
    }
    uiAction('IH-059 complex condition', { condition: 'false && (function() { var x = 1; return x > 1; })()' });
    uiAction('IH-059 simple condition', {});
    uiAction('IH-073 sync REST call', { script: 'var request = new sn_ws.RESTMessageV2();\nrequest.setEndpoint(\'https://example.invalid\');\nvar response = request.execute();' });
    uiAction('IH-073 async REST call', { script: 'var request = new sn_ws.RESTMessageV2();\nrequest.setEndpoint(\'https://example.invalid\');\nrequest.executeAsync();' });

    // IH-062: disabled trigger (never runs) with an error (positive)
    tryInsert('IH-062 trigger', 'sys_trigger', { name: MARKER + ' IH-062 failing job', trigger_type: '2', last_error: MARKER + ': simulated error for Instance Health' });

    // IH-063: script include flushing the cache (positive), only in a comment (negative)
    insert('sys_script_include', scriptInclude('IHTestCacheFlush', 'IH-063 flushes the cache', '        gs.cacheFlush();'));
    insert('sys_script_include', scriptInclude('IHTestCacheFlushCommented', 'IH-063 cache flush only in a comment', '        // gs.cacheFlush();\n        return null;'));

    // IH-064: active user without login for 120 days (positive); ih.test.active (created today) and a
    // web-service-only user with an old login (negative)
    var oldLogin = new GlideDateTime();
    oldLogin.addDaysUTC(-120);
    insert('sys_user', { user_name: 'ih.test.nologin', first_name: MARKER, last_name: 'no login user', active: 'true', locked_out: 'true', last_login_time: oldLogin.getValue() });
    insert('sys_user', { user_name: 'ih.test.webservice', first_name: MARKER, last_name: 'web service user', active: 'true', locked_out: 'true', web_service_access_only: 'true', last_login_time: oldLogin.getValue() });

    // IH-065: grouped list report with 20 s recent average (positive; also reported by IH-002)
    var groupedReport = insert('sys_report', { title: MARKER + ' IH-065 grouped list report', table: 'incident', type: 'list', field_list: 'number,short_description', group: 'state', roles: '' });
    insert('report_stats', { report_table: 'sys_report', report_sys_id: groupedReport, recent_avg_execution_duration: 20000, average_execution_duration: 20000, recent_number_executions: 2, number_executions_total: 2 });

    // IH-069: after rule calling current.update() (positive), async rule with the call only in a comment (negative)
    insert('sys_script', testRule('IH-069 after rule current.update', 'cmn_location', 'after', '    current.update();'));
    insert('sys_script', testRule('IH-069 async rule commented', 'cmn_location', 'async', '    // current.update();'));

    // IH-071: computer without name (positive), marked by its serial number
    insert('cmdb_ci_computer', { name: '', serial_number: 'IHTEST-074-1' });

    // IH-072: one-time imports in 2099 (never run before removal): two at the same time (positive), one later (negative)
    function scheduledImport(name, start) {
        return tryInsert(name, 'scheduled_import_set', { name: MARKER + ' ' + name, active: 'true', run_type: 'once', run_start: start });
    }
    scheduledImport('IH-072 import A', '2099-01-01 00:00:00');
    scheduledImport('IH-072 import B', '2099-01-01 00:00:00');
    scheduledImport('IH-072 import C', '2099-01-02 00:00:00');

    // Check that the records really landed in global and the public report is published
    var check = new GlideRecord('sys_report');
    if (!check.get(publicReport) || String(check.is_published) != 'true' || check.getValue('sys_scope') != 'global')
        gs.info('WARNING: public report is not published or not in global, IH-001 test is invalid.');

    gs.info('Created ' + created.length + ' test records in global, update set "' + UPDATE_SET_NAME + '".');
    gs.info('');
    gs.info('Expected findings after running the checks:');
    gs.info('  IH-001: "' + MARKER + ' IH-001 public report" found, private report not found');
    gs.info('  IH-002: public report found (8.0 s, linked to the report), private report not found');
    gs.info('  IH-003: table ' + IH003_POSITIVE_TABLE + ' found (11 or more scripts), ' + IH003_NEGATIVE_TABLE + ' not found');
    gs.info('  IH-005: IH_TEST_IH005_global found, IH_TEST_IH005_not_global not found');
    gs.info('  IH-006: "' + MARKER + ' IH-006 global active" found, inactive one not found');
    gs.info('  IH-008: script include IHTestGsSqlUsed found, IHTestGsSqlCommented not found');
    gs.info('  IH-009: IHTestDotWalkUsed found (line 6), IHTestDotWalkAvoided and IHTestDotWalkChained not found');
    gs.info('  IH-010: "' + MARKER + ' IH-010 synchronous ajax" found (line 5), asynchronous one not found');
    gs.info('  IH-011: IHTestUrlHardCoded found (line 5), IHTestUrlProperty not found');
    gs.info('  IH-012: IHTestSysIdHardCoded found (line 6), IHTestSysIdLookup not found');
    gs.info('  IH-013: "' + MARKER + ' IH-013 before rule with update" found (line 4), the other two not found');
    gs.info('  IH-014: "' + MARKER + ' IH-014 global rule active" found, inactive one not found');
    gs.info('  IH-015: both IHTestDuplicate script includes found, IHTestUnique not found');
    gs.info('  IH-016: map "' + MARKER + ' IH-016 coalesce without index" found (fax_phone), "... with index" not found');
    gs.info('  IH-017: no test data; e.g. x_bits2_quackology_family found, incident not found');
    gs.info('  IH-018: ACL cmn_location.u_ih_test_query found (line 1), cmn_location.u_ih_test_role not found');
    gs.info('  IH-019, IH-021, IH-022: no test data (would change instance-wide settings / needs an upgrade)');
    gs.info('  IH-020: "' + MARKER + ' IH-020 after rule with REST call" found (line 3), async one not found');
    gs.info('  IH-023: "' + MARKER + ' IH-023 slow recent" found, linked to script include IHTestUnique; slow old and fast recent not found');
    gs.info('  IH-024: "' + MARKER + ' IH-013 before rule with update" found, "' + MARKER + ' IH-013 before rule no update" not found');
    gs.info('  IH-025: IHTestUnique found; IH-026: "' + MARKER + ' IH-010 asynchronous ajax" found');
    gs.info('  IH-027: UI page ih_test_ih028_page found; IH-028: UI action "' + MARKER + ' IH-028 UI action" found');
    gs.info('  IH-029: "' + MARKER + ' IH-029 virtual with asset" found, "' + MARKER + ' IH-029 physical computer" not found');
    gs.info('  IH-030: "' + MARKER + ' IH-030 no serial" found, retired one and the one with serial not found');
    gs.info('  IH-031, IH-033, IH-036: no test data (would change instance-wide settings)');
    gs.info('  IH-032: "' + MARKER + ' IH-032 invalid source" found, valid and retired ones not found');
    gs.info('  IH-034: both "' + MARKER + ' IH-034 duplicate name" update sets found, unique one not found');
    gs.info('  IH-035: "' + MARKER + ' IH-035 KB without retire workflow" found, the other two not found');
    gs.info('  IH-037: "' + MARKER + ' IH-037 calls updating include" found (IHTestUpdatesParam), "... reading include" and "... calls other function" (only another function of the include updates) not found');
    gs.info('  IH-038: "' + MARKER + ' IH-038 complex condition" found (several statements, function)');
    gs.info('  IH-039: membership of ih.test.inactive in "' + MARKER + ' IH-039 inactive member" found, ih.test.active not found');
    gs.info('  IH-040: "' + MARKER + ' IH-040 inactive manager" found');
    gs.info('  IH-041: "' + MARKER + ' IH-041 without members" found, the other test groups not found');
    gs.info('  IH-042: direct role personalize_choices of ih.test.active found, the inherited ones not found');
    gs.info('  IH-043: "' + MARKER + ' IH-043 role without type" found, "... role with type" not found');
    gs.info('  IH-044: no test data (real findings); IH-050, IH-051, IH-056: no test data (instance-wide settings)');
    gs.info('  IH-045: list layout cmn_location (view ih_test) found, position 0: name, city');
    gs.info('  IH-046: "' + MARKER + ' IH-046 catalog task without request" found');
    gs.info('  IH-047: job "' + MARKER + ' IH-047 run as deleted user" found, active user, system and empty run as not found');
    gs.info('  IH-048: job "' + MARKER + ' IH-048 run as inactive user" found');
    gs.info('  IH-049: task "' + MARKER + ' IH-049 opened by inactive user" found, active one not found');
    gs.info('  IH-052: incident "' + MARKER + ' IH-052 resolved without resolved by" found');
    gs.info('  IH-053: problem "' + MARKER + ' IH-053 closed without closed by" found');
    gs.info('  IH-054: task "' + MARKER + ' IH-054 active with closed date" found');
    gs.info('  IH-055: both IH-034 duplicate update sets found, the unique one (with description) not found');
    gs.info('  IH-057: resource "' + MARKER + ' IH-057 without ACL" found, "... with ACL" not found');
    gs.info('  IH-058, IH-060, IH-061, IH-066 to IH-068, IH-070: no test data (instance settings, schema changes or real findings)');
    gs.info('  IH-059: UI action "' + MARKER + ' IH-059 complex condition" found, simple one not found');
    gs.info('  IH-062: trigger "' + MARKER + ' IH-062 failing job" found');
    gs.info('  IH-063: IHTestCacheFlush found (line 5), IHTestCacheFlushCommented not found');
    gs.info('  IH-064: ih.test.nologin found, ih.test.active and ih.test.webservice not found');
    gs.info('  IH-065: report "' + MARKER + ' IH-065 grouped list report" found (also in IH-002 with 20.0 s)');
    gs.info('  IH-069: "' + MARKER + ' IH-069 after rule current.update" found (line 3), async one not found');
    gs.info('  IH-071: computer with serial IHTEST-074-1 found');
    gs.info('  IH-072: "' + MARKER + ' IH-072 import A" and "... import B" found, import C not found');
    gs.info('  IH-073: UI action "' + MARKER + ' IH-073 sync REST call" found, async one not found');
    gs.info('  IH-001 to IH-008 test script includes and client scripts must not appear in IH-009 to IH-015.');
    gs.info('');
    for (var w = 0; w < warnings.length; w++)
        gs.info('WARNING: ' + warnings[w]);
    gs.info('Existing custom client scripts may change the IH-003 counts; check ' + IH003_NEGATIVE_TABLE + ' if it is reported.');
});
