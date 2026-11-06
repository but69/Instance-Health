// Instance Health: remove the test data created by create-test-data.js
// Run in System Definition > Scripts - Background, scope global, as admin.
// Deletes all IH-TEST records, their customer updates and versions (in any update set),
// the update set "Instance Health - Test Data", and the scan findings that point to
// the deleted records.

// Records and update sets follow the user's current application, not the script scope.
// Run in global and always restore the user's application afterwards.
function runInGlobal(fn) {
    var previousApp = gs.getCurrentApplicationId();
    gs.setCurrentApplicationId('global');
    try {
        fn();
    } finally {
        if (previousApp && previousApp != 'global')
            gs.setCurrentApplicationId(previousApp);
    }
}

runInGlobal(function removeInstanceHealthTestData() {
    var MARKER = 'IH-TEST';
    var UPDATE_SET_NAME = 'Instance Health - Test Data';
    var deleted = {};
    var removedSysIds = [];
    var updateNames = [];

    function count(table, n) {
        deleted[table] = (deleted[table] || 0) + n;
    }

    function deleteWhere(table, field, operator, value, tracked) {
        var gr = new GlideRecord(table);
        gr.addQuery(field, operator, value);
        gr.query();
        var n = 0;
        while (gr.next()) {
            removedSysIds.push(gr.getUniqueValue());
            if (tracked)
                updateNames.push(gr.getRecordClassName() + '_' + gr.getUniqueValue());
            gr.deleteRecord();
            n++;
        }
        count(table, n);
    }

    var updateSet = new GlideRecord('sys_update_set');
    updateSet.addQuery('name', UPDATE_SET_NAME);
    updateSet.addQuery('application', 'global');
    updateSet.query();
    var hasUpdateSet = updateSet.next();

    // Delete inside the test update set so no deletes land in another update set
    var updateSetApi = new GlideUpdateSet();
    if (hasUpdateSet)
        updateSetApi.set(updateSet.getUniqueValue());

    // Report stats point to the test reports, so delete them first
    var reports = new GlideRecord('sys_report');
    reports.addQuery('title', 'STARTSWITH', MARKER);
    reports.query();
    while (reports.next()) {
        deleteWhere('report_stats', 'report_sys_id', '=', reports.getUniqueValue(), false);
        removedSysIds.push(reports.getUniqueValue());
        updateNames.push('sys_report_' + reports.getUniqueValue());
        reports.deleteRecord();
        count('sys_report', 1);
    }

    deleteWhere('sys_script_client', 'name', 'STARTSWITH', MARKER, true);
    // Match UI scripts by description: in a scoped app the name gets rewritten
    deleteWhere('sys_ui_script', 'description', 'STARTSWITH', MARKER, true);
    deleteWhere('sys_script_include', 'name', 'STARTSWITH', 'IHTestGsSql', true);

    // Scan findings that link to the deleted test records
    if (removedSysIds.length > 0)
        deleteWhere('scan_finding', 'source', 'IN', removedSysIds.join(','), false);

    // Customer updates and versions of the test records, wherever they were captured
    // (also covers records that ended up in another update set by mistake)
    if (updateNames.length > 0) {
        deleteWhere('sys_update_xml', 'name', 'IN', updateNames.join(','), false);
        deleteWhere('sys_update_version', 'name', 'IN', updateNames.join(','), false);
    }

    // Switch back to the Default update set, then drop the test update set
    if (hasUpdateSet) {
        var defaultSet = new GlideRecord('sys_update_set');
        defaultSet.addQuery('name', 'Default');
        defaultSet.addQuery('application', 'global');
        defaultSet.query();
        if (defaultSet.next())
            updateSetApi.set(defaultSet.getUniqueValue());

        deleteWhere('sys_update_xml', 'update_set', '=', updateSet.getUniqueValue(), false);
        updateSet.deleteRecord();
        count('sys_update_set', 1);
    }

    for (var table in deleted)
        gs.print('Deleted ' + deleted[table] + ' record(s) from ' + table);
});
