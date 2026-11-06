// Instance Health: create test data for the scan checks
// Run in System Definition > Scripts - Background, scope global, as admin.
// Creates positive (must be found) and negative (must not be found) records for
// IH-001 to IH-003, IH-005, IH-007, IH-009 to IH-017, IH-019, IH-021, IH-024 to IH-031,
// IH-033, IH-035, IH-036, IH-038 to IH-044 (test users ih.test.*, the active one locked out),
// IH-047 to IH-051, IH-054 to IH-057 and IH-059 (view ih_test, on-demand jobs, tasks marked IH-TEST).
// Every record is marked with IH-TEST (script includes: name starts with IHTest, UI page:
// ih_test_) and captured in the update set "Instance Health - Test Data". Records are created
// in global with a customer update, so they count as custom for the checks that only report
// custom code. IH-024 and IH-025 to IH-029 use synthetic statistics / customization rows.
// Not covered: IH-004 and IH-008 (need a failing PA job / 5 million rows), IH-018 (would
// need a new table; the instance has real findings), IH-046 (real findings), IH-020, IH-023,
// IH-032, IH-034, IH-037, IH-052, IH-053 and IH-058 (instance-wide settings), IH-022 (needs a
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
        gs.print('Update set "' + UPDATE_SET_NAME + '" already exists. Run remove-test-data.js first.');
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

    // IH-007: active client script on global (positive), inactive one (negative)
    insert('sys_script_client', {
        name: MARKER + ' IH-007 global active',
        table: 'global',
        type: 'onLoad',
        ui_type: '0',
        active: 'true',
        script: EMPTY_ONLOAD
    });
    insert('sys_script_client', {
        name: MARKER + ' IH-007 global inactive',
        table: 'global',
        type: 'onLoad',
        ui_type: '0',
        active: 'false',
        script: EMPTY_ONLOAD
    });

    // IH-009: script include calling gs.sql (positive), and only in comments (negative).
    // The functions are never called, so gs.sql is not executed.
    insert('sys_script_include', {
        name: 'IHTestGsSqlUsed',
        description: MARKER + ' IH-009 gs.sql in code',
        active: 'true',
        access: 'package_private',
        script: 'var IHTestGsSqlUsed = Class.create();\nIHTestGsSqlUsed.prototype = {\n    initialize: function() {},\n    neverCalled: function() {\n        return gs.sql(\'SELECT 1\');\n    },\n    type: \'IHTestGsSqlUsed\'\n};'
    });
    insert('sys_script_include', {
        name: 'IHTestGsSqlCommented',
        description: MARKER + ' IH-009 gs.sql only in comments',
        active: 'true',
        access: 'package_private',
        script: 'var IHTestGsSqlCommented = Class.create();\nIHTestGsSqlCommented.prototype = {\n    initialize: function() {},\n    neverCalled: function() {\n        // return gs.sql(\'SELECT 1\');\n        /* var rows = gs.sql(\'SELECT 2\'); */\n        return null;\n    },\n    type: \'IHTestGsSqlCommented\'\n};'
    });

    // IH-010: dot-walk to sys_id (positive), getValue (negative)
    insert('sys_script_include', scriptInclude('IHTestDotWalkUsed', 'IH-010 dot-walk to sys_id',
        '        var gr = new GlideRecord(\'incident\');\n        return gr.caller_id.sys_id + \'\';'));
    insert('sys_script_include', scriptInclude('IHTestDotWalkAvoided', 'IH-010 getValue instead of dot-walk',
        '        var gr = new GlideRecord(\'incident\');\n        // return gr.caller_id.sys_id + \'\';\n        return gr.getValue(\'caller_id\');'));

    // IH-011: synchronous (positive) and asynchronous (negative) client calls on cmn_location
    insert('sys_script_client', {
        name: MARKER + ' IH-011 synchronous ajax',
        table: 'cmn_location',
        type: 'onLoad',
        ui_type: '0',
        active: 'true',
        script: 'function onLoad() {\n    // ' + MARKER + ': test data for Instance Health, safe to delete\n    if (false) {\n        var ga = new GlideAjax(\'IHTestNoSuchAjax\');\n        ga.getXMLWait();\n    }\n}'
    });
    insert('sys_script_client', {
        name: MARKER + ' IH-011 asynchronous ajax',
        table: 'cmn_location',
        type: 'onLoad',
        ui_type: '0',
        active: 'true',
        script: 'function onLoad() {\n    // ' + MARKER + ': test data for Instance Health, safe to delete\n    if (false) {\n        var ga = new GlideAjax(\'IHTestNoSuchAjax\');\n        ga.getXMLAnswer(function(answer) {});\n    }\n}'
    });

    // IH-012: hard-coded instance URL (positive), property (negative)
    insert('sys_script_include', scriptInclude('IHTestUrlHardCoded', 'IH-012 hard-coded instance URL',
        '        return \'https://ihtest.service-now.com/nav_to.do\';'));
    insert('sys_script_include', scriptInclude('IHTestUrlProperty', 'IH-012 URL from property',
        '        return gs.getProperty(\'glide.servlet.uri\') + \'nav_to.do\';'));

    // IH-013: literal sys_id (positive), lookup by name (negative)
    insert('sys_script_include', scriptInclude('IHTestSysIdHardCoded', 'IH-013 hard-coded sys_id',
        '        var gr = new GlideRecord(\'sys_user\');\n        return gr.get(\'0123456789abcdef0123456789abcdef\');'));
    insert('sys_script_include', scriptInclude('IHTestSysIdLookup', 'IH-013 lookup by name',
        '        var gr = new GlideRecord(\'sys_user\');\n        return gr.get(\'user_name\', \'ih.test\');'));

    // IH-014: before rule updating another record (positive), before rule setting current and
    // after rule updating another record (negative). Condition false: they never run.
    insert('sys_script', testRule('IH-014 before rule with update', 'cmn_location', 'before',
        '    var other = new GlideRecord(\'cmn_location\');\n    other.update();'));
    // sys_script.name holds at most 40 characters including the "IH-TEST " prefix
    insert('sys_script', testRule('IH-014 before rule no update', 'cmn_location', 'before',
        '    current.setValue(\'street\', current.getValue(\'street\'));'));
    insert('sys_script', testRule('IH-014 after rule with update', 'cmn_location', 'after',
        '    var other = new GlideRecord(\'cmn_location\');\n    other.update();'));

    // IH-015: active global rule (positive), inactive global rule (negative).
    // Global rules are loaded on every transaction, so the script only declares a function.
    var globalRule = {
        collection: 'global',
        when: 'before',
        advanced: 'true',
        condition: 'false',
        script: '// ' + MARKER + ': test data for Instance Health, safe to delete\nfunction ihTestGlobalRuleNoop() {}'
    };
    globalRule.name = MARKER + ' IH-015 global rule active';
    globalRule.active = 'true';
    insert('sys_script', globalRule);
    globalRule.name = MARKER + ' IH-015 global rule inactive';
    globalRule.active = 'false';
    insert('sys_script', globalRule);

    // IH-016: two script includes with the same API name (positive), a unique one (negative)
    tryInsert('IH-016 duplicate 1', 'sys_script_include', scriptInclude('IHTestDuplicate', 'IH-016 duplicate name (1)', '        return 1;'));
    tryInsert('IH-016 duplicate 2', 'sys_script_include', scriptInclude('IHTestDuplicate', 'IH-016 duplicate name (2)', '        return 2;'));
    insert('sys_script_include', scriptInclude('IHTestUnique', 'IH-016 unique name', '        return 0;'));

    // IH-017: transform maps coalescing on fax_phone (no index, positive) and name (indexed, negative).
    // The maps are never run; their source is the import set row base table.
    var coalesceCases = [['IH-017 coalesce without index', 'fax_phone'], ['IH-017 coalesce with index', 'name']];
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

    // IH-019: read ACLs on a non-existent field, with a query (positive) and without (negative)
    var readOperation = new GlideRecord('sys_security_operation');
    if (readOperation.get('name', 'read')) {
        tryInsert('IH-019 read ACL with query', 'sys_security_acl', {
            name: 'cmn_location.u_ih_test_query',
            type: 'record',
            operation: readOperation.getUniqueValue(),
            active: 'true',
            advanced: 'true',
            description: MARKER + ' IH-019 read ACL with GlideRecord, on a field that does not exist',
            script: 'var gr = new GlideRecord(\'sys_user\');\ngr.get(gs.getUserID());\nanswer = gr.isValidRecord();'
        });
        tryInsert('IH-019 read ACL without query', 'sys_security_acl', {
            name: 'cmn_location.u_ih_test_role',
            type: 'record',
            operation: readOperation.getUniqueValue(),
            active: 'true',
            advanced: 'true',
            description: MARKER + ' IH-019 read ACL without query, on a field that does not exist',
            script: '// var gr = new GlideRecord(\'sys_user\');\nanswer = gs.hasRole(\'itil\');'
        });
    } else {
        warnings.push('IH-019: operation "read" not found, ACLs not created');
    }

    // IH-021: outbound REST call in an after rule (positive) and in an async rule (negative)
    var restCall = '    var request = new sn_ws.RESTMessageV2();\n    request.setEndpoint(\'https://example.invalid\');';
    insert('sys_script', testRule('IH-021 after rule with REST call', 'cmn_location', 'after', restCall));
    insert('sys_script', testRule('IH-021 async rule with REST call', 'cmn_location', 'async', restCall));

    // IH-024: synthetic slow script statistics: 8 s recent (positive, linked to a test script
    // include), 8 s last seen 60 days ago and 3 s recent (negative)
    var ih024Source = new GlideRecord('sys_script_include');
    ih024Source.get('name', 'IHTestUnique');
    var sixtyDaysAgo = new GlideDateTime();
    sixtyDaysAgo.addDaysUTC(-60);
    var slowCases = [['IH-024 slow recent', 8000, new GlideDateTime()], ['IH-024 slow old', 8000, sixtyDaysAgo], ['IH-024 fast recent', 3000, new GlideDateTime()]];
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

    // IH-025 to IH-029: mark test records as changed ServiceNow records in the platform list of
    // customized records (sys_metadata_customization). Positive: author_type ServiceNow.
    var uiActionId = insert('sys_ui_action', {
        name: MARKER + ' IH-029 UI action',
        table: 'cmn_location',
        active: 'false',
        script: '// ' + MARKER + ': test data for Instance Health, safe to delete'
    });
    var uiPageId = insert('sys_ui_page', {
        name: 'ih_test_ih028_page',
        description: MARKER + ' IH-028 UI page',
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
    markCustomized('IH-025 positive', 'sys_script', 'name', MARKER + ' IH-014 before rule with update', 'ServiceNow');
    markCustomized('IH-025 negative', 'sys_script', 'name', MARKER + ' IH-014 before rule no update', 'Custom');
    markCustomized('IH-026 positive', 'sys_script_include', 'name', 'IHTestUnique', 'ServiceNow');
    markCustomized('IH-027 positive', 'sys_script_client', 'name', MARKER + ' IH-011 asynchronous ajax', 'ServiceNow');
    markCustomized('IH-028 positive', 'sys_ui_page', 'sys_id', uiPageId, 'ServiceNow');
    markCustomized('IH-029 positive', 'sys_ui_action', 'sys_id', uiActionId, 'ServiceNow');

    // IH-030 and IH-031: test computers (serial numbers set where IH-031 must not report them)
    function computer(name, values) {
        values.name = MARKER + ' ' + name;
        return insert('cmdb_ci_computer', values);
    }
    var virtualWithAsset = computer('IH-030 virtual with asset', { virtual: 'true', serial_number: 'IHTEST-030-1' });
    computer('IH-030 virtual without asset', { virtual: 'true', serial_number: 'IHTEST-030-2' });
    var assetId = tryInsert('IH-030 asset', 'alm_hardware', { asset_tag: MARKER + '-030', serial_number: 'IHTEST-030-1' });
    if (assetId) {
        var vci = new GlideRecord('cmdb_ci_computer');
        vci.get(virtualWithAsset);
        vci.setValue('asset', assetId);
        vci.update();
    }
    computer('IH-031 no serial', {});
    computer('IH-031 retired no serial', { install_status: '7' });
    computer('IH-031 with serial', { serial_number: 'IHTEST-031-1' });

    // IH-033: invalid discovery source (positive), valid one and retired CI with invalid one (negative).
    // Serial numbers set so IH-031 does not report these computers.
    computer('IH-033 invalid source', { discovery_source: MARKER + ' invalid', serial_number: 'IHTEST-033-1' });
    computer('IH-033 valid source', { discovery_source: 'ManualEntry', serial_number: 'IHTEST-033-2' });
    computer('IH-033 retired invalid source', { discovery_source: MARKER + ' invalid', serial_number: 'IHTEST-033-3', install_status: '7' });

    // IH-035: two update sets with the same name (positive), one unique (negative); state complete
    insert('sys_update_set', { name: MARKER + ' IH-035 duplicate name', application: 'global', state: 'complete' });
    insert('sys_update_set', { name: MARKER + ' IH-035 duplicate name', application: 'global', state: 'complete' });
    // The duplicates have no description (IH-057 positive), the unique one has one (IH-057 negative)
    insert('sys_update_set', { name: MARKER + ' IH-035 unique name', application: 'global', state: 'complete', description: MARKER + ': test data for Instance Health' });

    // IH-036: active knowledge base without retire workflow (positive), with one and inactive (negative)
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
    knowledgeBase('IH-036 KB without retire workflow', {});
    if (kbWorkflow.next())
        knowledgeBase('IH-036 KB with retire workflow', { retire_workflow: kbWorkflow.getUniqueValue() });
    else
        warnings.push('IH-036: no workflow on kb_knowledge found, negative case with retire workflow not created');
    knowledgeBase('IH-036 KB inactive', { active: 'false' });

    // IH-038: business rules passing current to a script include that updates its parameter
    // (positive) and to one that only reads it (negative). Condition false: they never run.
    insert('sys_script_include', scriptInclude('IHTestUpdatesParam', 'IH-038 updates its parameter',
        '        return null;\n    },\n    touch: function(record) {\n        record.update();'));
    insert('sys_script_include', scriptInclude('IHTestReadsParam', 'IH-038 only reads its parameter',
        '        return null;\n    },\n    read: function(record) {\n        return record.getValue(\'name\');'));
    insert('sys_script', testRule('IH-038 calls updating include', 'cmn_location', 'before',
        '    new IHTestUpdatesParam().touch(current);'));
    insert('sys_script', testRule('IH-038 calls reading include', 'cmn_location', 'before',
        '    new IHTestReadsParam().read(current);'));

    // IH-039: complex condition (positive); all other test rules have the simple condition "false".
    // The condition short-circuits, so the function is never called.
    var complexRule = testRule('IH-039 complex condition', 'cmn_location', 'before', '    // nothing');
    complexRule.condition = 'false && (function() { var x = 1; return x > 1; })()';
    insert('sys_script', complexRule);

    // IH-040 to IH-044: test users (active one is locked out), groups, memberships and roles
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

    var g40 = group('IH-040 inactive member', { manager: activeUser });
    member(g40, inactiveUser);
    member(g40, activeUser);
    var g41 = group('IH-041 inactive manager', { manager: inactiveUser });
    member(g41, activeUser);
    group('IH-042 without members', { manager: activeUser });
    var g44a = group('IH-044 role without type', { manager: activeUser });
    member(g44a, activeUser);
    insert('sys_group_has_role', { group: g44a, role: testRole.getUniqueValue() });
    var catalogType = new GlideRecord('sys_user_group_type');
    catalogType.get('name', 'catalog');
    var g44b = group('IH-044 role with type', { manager: activeUser, type: catalogType.getUniqueValue() });
    member(g44b, activeUser);
    insert('sys_group_has_role', { group: g44b, role: testRole.getUniqueValue() });
    // IH-043: direct role for the active test user (positive); the roles inherited from the
    // IH-044 groups are the negative case
    insert('sys_user_has_role', { user: activeUser, role: testRole.getUniqueValue() });

    // IH-047: list layout of cmn_location in a test view, two elements at position 0 (positive)
    var viewId = insert('sys_ui_view', { name: 'ih_test', title: MARKER + ' view' });
    var listId = insert('sys_ui_list', { name: 'cmn_location', view: viewId });
    insert('sys_ui_list_element', { list_id: listId, element: 'name', position: '0' });
    insert('sys_ui_list_element', { list_id: listId, element: 'city', position: '0' });
    insert('sys_ui_list_element', { list_id: listId, element: 'street', position: '1' });

    // IH-048: catalog task without requested item and request (positive)
    tryInsert('IH-048 catalog task', 'sc_task', { short_description: MARKER + ' IH-048 catalog task without request' });

    // IH-049, IH-050: on-demand jobs (never scheduled) run as a missing user, an inactive user
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
    job('IH-049 run as deleted user', 'ih.test.deleted');
    job('IH-050 run as inactive user', inactiveUser);
    job('IH-049 run as active user', activeUser);
    job('IH-049 run as system', 'system');

    // IH-051 and IH-056: plain tasks
    insert('task', { short_description: MARKER + ' IH-051 opened by inactive user', opened_by: inactiveUser, active: 'true' });
    insert('task', { short_description: MARKER + ' IH-051 opened by active user', opened_by: activeUser, active: 'true' });
    insert('task', { short_description: MARKER + ' IH-056 active with closed date', opened_by: activeUser, active: 'true', closed_at: new GlideDateTime().getValue() });

    // IH-054, IH-055: resolved incident and closed problem inserted without business rules, so
    // mark_resolved / the problem closure rule do not fill the fields (positive)
    function insertWithoutRules(table, values) {
        var gr = new GlideRecord(table);
        gr.initialize();
        gr.setWorkflow(false);
        for (var field in values)
            gr.setValue(field, values[field]);
        var sysId = gr.insert();
        if (!sysId)
            throw new Error('Insert into ' + table + ' failed: ' + JSON.stringify(values));
        created.push(table + ' ' + sysId);
        return sysId;
    }
    insertWithoutRules('incident', { short_description: MARKER + ' IH-054 resolved without resolved by', caller_id: activeUser, opened_by: activeUser, state: '6' });
    insertWithoutRules('problem', { short_description: MARKER + ' IH-055 closed without closed by', opened_by: activeUser, state: '107', active: 'false', closed_at: new GlideDateTime().getValue() });

    // IH-059: scripted REST API with a resource without ACL authorization (positive) and one with
    // both settings (negative). Both require authentication, so nothing is public.
    var restApi = tryInsert('IH-059 API', 'sys_ws_definition', { name: MARKER + ' IH-059 API', service_id: 'ih_test_api', active: 'true' });
    if (restApi) {
        var noContent = '(function process(request, response) {\n    // ' + MARKER + ': test data for Instance Health, safe to delete\n    response.setStatus(204);\n})(request, response);';
        tryInsert('IH-059 resource without ACL', 'sys_ws_operation', {
            name: MARKER + ' IH-059 without ACL', web_service_definition: restApi, http_method: 'GET', relative_path: '/without_acl',
            requires_authentication: 'true', requires_acl_authorization: 'false', active: 'true', operation_script: noContent
        });
        tryInsert('IH-059 resource with ACL', 'sys_ws_operation', {
            name: MARKER + ' IH-059 with ACL', web_service_definition: restApi, http_method: 'GET', relative_path: '/with_acl',
            requires_authentication: 'true', requires_acl_authorization: 'true', active: 'true', operation_script: noContent
        });
    }

    // Check that the records really landed in global and the public report is published
    var check = new GlideRecord('sys_report');
    if (!check.get(publicReport) || String(check.is_published) != 'true' || check.getValue('sys_scope') != 'global')
        gs.print('WARNING: public report is not published or not in global, IH-001 test is invalid.');

    gs.print('Created ' + created.length + ' test records in global, update set "' + UPDATE_SET_NAME + '".');
    gs.print('');
    gs.print('Expected findings after running the checks:');
    gs.print('  IH-001: "' + MARKER + ' IH-001 public report" found, private report not found');
    gs.print('  IH-002: public report found (8.0 s, linked to the report), private report not found');
    gs.print('  IH-003: table ' + IH003_POSITIVE_TABLE + ' found (11 or more scripts), ' + IH003_NEGATIVE_TABLE + ' not found');
    gs.print('  IH-005: IH_TEST_IH005_global found, IH_TEST_IH005_not_global not found');
    gs.print('  IH-007: "' + MARKER + ' IH-007 global active" found, inactive one not found');
    gs.print('  IH-009: script include IHTestGsSqlUsed found, IHTestGsSqlCommented not found');
    gs.print('  IH-010: IHTestDotWalkUsed found (line 6), IHTestDotWalkAvoided not found');
    gs.print('  IH-011: "' + MARKER + ' IH-011 synchronous ajax" found (line 5), asynchronous one not found');
    gs.print('  IH-012: IHTestUrlHardCoded found (line 5), IHTestUrlProperty not found');
    gs.print('  IH-013: IHTestSysIdHardCoded found (line 6), IHTestSysIdLookup not found');
    gs.print('  IH-014: "' + MARKER + ' IH-014 before rule with update" found (line 4), the other two not found');
    gs.print('  IH-015: "' + MARKER + ' IH-015 global rule active" found, inactive one not found');
    gs.print('  IH-016: both IHTestDuplicate script includes found, IHTestUnique not found');
    gs.print('  IH-017: map "' + MARKER + ' IH-017 coalesce without index" found (fax_phone), "... with index" not found');
    gs.print('  IH-018: no test data; e.g. x_bits2_quackology_family found, incident not found');
    gs.print('  IH-019: ACL cmn_location.u_ih_test_query found (line 1), cmn_location.u_ih_test_role not found');
    gs.print('  IH-020, IH-022, IH-023: no test data (would change instance-wide settings / needs an upgrade)');
    gs.print('  IH-021: "' + MARKER + ' IH-021 after rule with REST call" found (line 3), async one not found');
    gs.print('  IH-024: "' + MARKER + ' IH-024 slow recent" found, linked to script include IHTestUnique; slow old and fast recent not found');
    gs.print('  IH-025: "' + MARKER + ' IH-014 before rule with update" found, "' + MARKER + ' IH-014 before rule no update" not found');
    gs.print('  IH-026: IHTestUnique found; IH-027: "' + MARKER + ' IH-011 asynchronous ajax" found');
    gs.print('  IH-028: UI page ih_test_ih028_page found; IH-029: UI action "' + MARKER + ' IH-029 UI action" found');
    gs.print('  IH-030: "' + MARKER + ' IH-030 virtual with asset" found, "... without asset" not found');
    gs.print('  IH-031: "' + MARKER + ' IH-031 no serial" found, retired one and the one with serial not found');
    gs.print('  IH-032, IH-034, IH-037: no test data (would change instance-wide settings)');
    gs.print('  IH-033: "' + MARKER + ' IH-033 invalid source" found, valid and retired ones not found');
    gs.print('  IH-035: both "' + MARKER + ' IH-035 duplicate name" update sets found, unique one not found');
    gs.print('  IH-036: "' + MARKER + ' IH-036 KB without retire workflow" found, the other two not found');
    gs.print('  IH-038: "' + MARKER + ' IH-038 calls updating include" found (IHTestUpdatesParam), "... reading include" not found');
    gs.print('  IH-039: "' + MARKER + ' IH-039 complex condition" found (several statements, function)');
    gs.print('  IH-040: membership of ih.test.inactive in "' + MARKER + ' IH-040 inactive member" found, ih.test.active not found');
    gs.print('  IH-041: "' + MARKER + ' IH-041 inactive manager" found');
    gs.print('  IH-042: "' + MARKER + ' IH-042 without members" found, the other test groups not found');
    gs.print('  IH-043: direct role personalize_choices of ih.test.active found, the inherited ones not found');
    gs.print('  IH-044: "' + MARKER + ' IH-044 role without type" found, "... role with type" not found');
    gs.print('  IH-046: no test data (real findings); IH-052, IH-053, IH-058: no test data (instance-wide settings)');
    gs.print('  IH-047: list layout cmn_location (view ih_test) found, position 0: name, city');
    gs.print('  IH-048: "' + MARKER + ' IH-048 catalog task without request" found');
    gs.print('  IH-049: job "' + MARKER + ' IH-049 run as deleted user" found, active user and system not found');
    gs.print('  IH-050: job "' + MARKER + ' IH-050 run as inactive user" found');
    gs.print('  IH-051: task "' + MARKER + ' IH-051 opened by inactive user" found, active one not found');
    gs.print('  IH-054: incident "' + MARKER + ' IH-054 resolved without resolved by" found');
    gs.print('  IH-055: problem "' + MARKER + ' IH-055 closed without closed by" found');
    gs.print('  IH-056: task "' + MARKER + ' IH-056 active with closed date" found');
    gs.print('  IH-057: both IH-035 duplicate update sets found, the unique one (with description) not found');
    gs.print('  IH-059: resource "' + MARKER + ' IH-059 without ACL" found, "... with ACL" not found');
    gs.print('  IH-001 to IH-009 test script includes and client scripts must not appear in IH-010 to IH-016.');
    gs.print('');
    for (var w = 0; w < warnings.length; w++)
        gs.print('WARNING: ' + warnings[w]);
    gs.print('Existing custom client scripts may change the IH-003 counts; check ' + IH003_NEGATIVE_TABLE + ' if it is reported.');
});
