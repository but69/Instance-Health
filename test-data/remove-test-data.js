// Instance Health: remove the test data created by create-test-data.js
// Run in System Definition > Scripts - Background, scope global, as admin.
// Deletes all IH-TEST records, the update set "Instance Health - Test Data" with its
// customer updates, and the scan findings that point to the deleted records.

(function removeInstanceHealthTestData() {
    var MARKER = 'IH-TEST';
    var UPDATE_SET_NAME = 'Instance Health - Test Data';
    var deleted = {};
    var removedSysIds = [];

    function deleteWhere(table, field, operator, value) {
        var gr = new GlideRecord(table);
        gr.addQuery(field, operator, value);
        gr.query();
        var count = 0;
        while (gr.next()) {
            removedSysIds.push(gr.getUniqueValue());
            gr.deleteRecord();
            count++;
        }
        deleted[table] = (deleted[table] || 0) + count;
    }

    var updateSet = new GlideRecord('sys_update_set');
    var hasUpdateSet = updateSet.get('name', UPDATE_SET_NAME);

    // Delete inside the test update set so no deletes land in another update set
    var updateSetApi = new GlideUpdateSet();
    if (hasUpdateSet)
        updateSetApi.set(updateSet.getUniqueValue());

    // Report stats point to the test reports, so delete them first
    var reports = new GlideRecord('sys_report');
    reports.addQuery('title', 'STARTSWITH', MARKER);
    reports.query();
    while (reports.next()) {
        deleteWhere('report_stats', 'report_sys_id', '=', reports.getUniqueValue());
        removedSysIds.push(reports.getUniqueValue());
        reports.deleteRecord();
        deleted.sys_report = (deleted.sys_report || 0) + 1;
    }

    deleteWhere('sys_script_client', 'name', 'STARTSWITH', MARKER);
    deleteWhere('sys_ui_script', 'name', 'STARTSWITH', 'IH_TEST_');
    deleteWhere('sys_script_include', 'name', 'STARTSWITH', 'IHTestGsSql');

    // Scan findings that link to the deleted test records
    if (removedSysIds.length > 0)
        deleteWhere('scan_finding', 'source', 'IN', removedSysIds.join(','));

    // Switch back to the Default update set, then drop the test update set and its customer updates
    if (hasUpdateSet) {
        var defaultSet = new GlideRecord('sys_update_set');
        defaultSet.addQuery('name', 'Default');
        defaultSet.addQuery('application', 'global');
        defaultSet.query();
        if (defaultSet.next())
            updateSetApi.set(defaultSet.getUniqueValue());

        deleteWhere('sys_update_xml', 'update_set', '=', updateSet.getUniqueValue());
        updateSet.deleteRecord();
        deleted.sys_update_set = 1;
    }

    for (var table in deleted)
        gs.print('Deleted ' + deleted[table] + ' record(s) from ' + table);
    gs.print('Your current update set is now "Default".');
})();
