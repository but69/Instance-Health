// Instance Health: create test data for the scan checks
// Run in System Definition > Scripts - Background, scope global, as admin.
// Creates positive (must be found) and negative (must not be found) records for
// IH-001, IH-002, IH-003, IH-005, IH-007 and IH-009. Every record is marked with
// IH-TEST and captured in the update set "Instance Health - Test Data".
// IH-004 and IH-008 are not covered (need a failing PA job / 5 million rows).
// Remove everything again with remove-test-data.js.

(function createInstanceHealthTestData() {
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

    // Capture everything in a dedicated update set
    var updateSetApi = new GlideUpdateSet();
    var updateSetId = updateSetApi.create(UPDATE_SET_NAME);
    updateSetApi.set(updateSetId);

    // IH-001: published report (positive) and unpublished report (negative)
    var publicReport = insert('sys_report', {
        title: MARKER + ' IH-001 public report',
        table: 'incident',
        type: 'list',
        field_list: 'number,short_description',
        is_published: 'true'
    });
    var privateReport = insert('sys_report', {
        title: MARKER + ' IH-001 private report',
        table: 'incident',
        type: 'list',
        field_list: 'number,short_description',
        is_published: 'false'
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

    gs.print('Created ' + created.length + ' test records in update set "' + UPDATE_SET_NAME + '".');
    gs.print('Your current update set is now "' + UPDATE_SET_NAME + '". Switch back before doing other work.');
    gs.print('');
    gs.print('Expected findings after running the checks:');
    gs.print('  IH-001: "' + MARKER + ' IH-001 public report" found, private report not found');
    gs.print('  IH-002: public report found (8.0 s, linked to the report), private report not found');
    gs.print('  IH-003: table ' + IH003_POSITIVE_TABLE + ' found (11 or more scripts), ' + IH003_NEGATIVE_TABLE + ' not found');
    gs.print('  IH-005: IH_TEST_IH005_global found, IH_TEST_IH005_not_global not found');
    gs.print('  IH-007: "' + MARKER + ' IH-007 global active" found, inactive one not found');
    gs.print('  IH-009: script include IHTestGsSqlUsed found, IHTestGsSqlCommented not found');
    gs.print('');
    gs.print('Existing custom client scripts may change the IH-003 counts; check ' + IH003_NEGATIVE_TABLE + ' if it is reported.');
})();
