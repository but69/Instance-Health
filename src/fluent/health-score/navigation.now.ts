import { ApplicationMenu, Record, UiAction } from '@servicenow/sdk/core'
import { x_bits2_inst_hlth_health_score } from './health-score.now'

// Navigator menu "Instance Health" with the health scores and their trend (user request 2026-11-06).
// Admin only, like the ACLs of the health score table.
export const instanceHealthMenu = ApplicationMenu({
    $id: Now.ID['ih-menu'],
    title: 'Instance Health',
    hint: 'Health score of the instance from the scan suite "Instance health"',
    description: 'Health scores per run of the scan suite "Instance health" and their trend.',
    active: true,
    roles: ['admin'],
})

// List banner button on the health scores: starts the scan suite (user request 2026-11-06). The
// health score of the run is calculated by the scheduled job up to 15 minutes after the scan ends.
UiAction({
    $id: Now.ID['ih-ui-action-run-suite'],
    name: 'Run Instance Health Scan',
    actionName: 'ih_run_instance_health_scan',
    table: x_bits2_inst_hlth_health_score.name,
    active: true,
    hint: 'Starts the scan suite "Instance health"; the health score appears here when the scan is finished',
    roles: ['admin'],
    condition: "gs.hasRole('admin')",
    list: {
        showBannerButton: true,
        style: 'primary',
    },
    script: `(function runInstanceHealthScan() {
    var listUrl = 'x_bits2_inst_hlth_health_score_list.do?sysparm_query=ORDERBYDESCscan_date';
    var suite = new GlideRecord('scan_check_suite');
    if (!suite.get('name', 'Instance health')) {
        gs.addErrorMessage('The scan suite "Instance health" does not exist.');
        action.setRedirectURL(listUrl);
        return;
    }

    // Do not start a second run while one is still in progress
    var running = new GlideRecord('scan_suite_execution');
    running.addQuery('suite', suite.getUniqueValue());
    running.addQuery('result.state', 'in_progress');
    running.setLimit(1);
    running.query();
    if (running.next()) {
        gs.addInfoMessage('The scan suite "Instance health" is already running (' + running.result.getDisplayValue() + '). The health score appears in this list up to 15 minutes after it has finished.');
        action.setRedirectURL(listUrl);
        return;
    }

    new sn_instance_scan.ScanInstance().triggerSuiteScan(suite.getUniqueValue());
    gs.addInfoMessage('The scan suite "Instance health" was started. The scan takes about 15 minutes; the health score appears in this list up to 15 minutes after it has finished.');
    action.setRedirectURL(listUrl);
})();`,
})

// List control: no "New" button on the health score list, records are only created by the
// scheduled job (user request 2026-11-06). Record() sets no defaults, so all flags are explicit.
Record({
    $id: Now.ID['ih-list-control-health-score'],
    table: 'sys_ui_list_control',
    data: {
        name: x_bits2_inst_hlth_health_score.name,
        omit_new_button: true,
        omit_edit_button: false,
        omit_if_empty: false,
        omit_columns_if_empty: false,
        omit_count_views: false,
        omit_related_list_count: false,
        hierarchical_lists: false,
        omit_links: false,
        omit_filters: false,
        disable_nlq: false,
        omit_count: false,
        omit_drilldown_link: false,
        list_edit_insert_row: false,
    },
})

// Base colors of the Reporting plugin (sys_report_color), same sys_ids on every instance
const REPORT_COLORS = {
    black: '65b30218a9fe3dba0120df8611520d97',
    crimson: '65b3022ca9fe3dba00b0c2a1508ad489',
    royalBlue: '65b30395a9fe3dba00175667ec52620d',
    forestGreen: '65b3027ca9fe3dba00d5b649d600fe09',
    darkOrange: '65b30254a9fe3dba00b44ce0710382b3',
}

// Line chart: average health score per day (several runs on one day are averaged).
// Record() sets no platform defaults, so the display fields are set explicitly (values as in the
// platform line chart "Service View - Completeness Trend"); without them the module stayed hidden.
export const healthScoreTrendReport = Record({
    $id: Now.ID['ih-report-health-score-trend'],
    table: 'sys_report',
    data: {
        active: true,
        name: 'Instance Health Score Trend',
        source_type: 'table',
        show_chart_title: 'report',
        title_horizontal_alignment: 'center',
        title_vertical_alignment: 'top',
        chart_title_size: 16,
        show_legend: true,
        legend_horizontal_alignment: 'center',
        legend_vertical_alignment: 'bottom',
        show_marker: true,
        set_color: 'one_color',
        series_name_text: 'Health score',
        color: REPORT_COLORS.black,
        y_axis_display_grid: true,
        x_axis_display_grid: false,
        y_axis_label_size: 11,
        x_axis_label_size: 11,
        y_axis_title_size: 12,
        x_axis_title_size: 12,
        decimal_precision: 1,
        compute_percent: 'aggregate',
        others: 'false',
        show_empty: false,
        show_zero: false,
        display_grid: false,
        custom_chart_size: false,
        is_scheduled: false,
        exp_report_attrs: true,
        title: 'Instance Health Score Trend',
        description: 'Health score per scan date (average when the suite ran several times on one day). 100 = completely healthy; at most 60 while a priority 1 check scores 0.',
        table: x_bits2_inst_hlth_health_score.name,
        type: 'line',
        trend_field: 'scan_date',
        interval: 'date',
        aggregate: 'AVG',
        sumfield: 'health_score',
        filter: '^TRENDBYscan_date,date',
        chart_size: 'large',
        show_chart_data_label: true,
        user: 'GLOBAL',
        roles: ['admin'],
        is_published: false,
    },
})

// Additional lines of the trend report, one dataset (sys_report_layer) per category score
// (user request 2026-11-06). Record() sets no defaults, so all display flags are explicit.
Record({
    $id: Now.ID['ih-report-layer-security'],
    table: 'sys_report_layer',
    data: {
        report: healthScoreTrendReport,
        sequence: 1,
        series_name_text: 'Security',
        color: REPORT_COLORS.crimson,
        type: 'line',
        source_type: 'table',
        table: x_bits2_inst_hlth_health_score.name,
        trend_field: 'scan_date',
        interval: 'date',
        aggregate: 'AVG',
        sumfield: 'score_security',
        set_color: 'one_color',
        compute_percent: 'aggregate',
        show_marker: true,
        show_chart_data_label: false,
        show_data_label_position_middle: false,
        allow_data_label_overlap: false,
        show_2nd_y_axis: false,
        bar_unstack: false,
        use_null_in_trend: false,
    },
})
Record({
    $id: Now.ID['ih-report-layer-performance'],
    table: 'sys_report_layer',
    data: {
        report: healthScoreTrendReport,
        sequence: 2,
        series_name_text: 'Performance',
        color: REPORT_COLORS.royalBlue,
        type: 'line',
        source_type: 'table',
        table: x_bits2_inst_hlth_health_score.name,
        trend_field: 'scan_date',
        interval: 'date',
        aggregate: 'AVG',
        sumfield: 'score_performance',
        set_color: 'one_color',
        compute_percent: 'aggregate',
        show_marker: true,
        show_chart_data_label: false,
        show_data_label_position_middle: false,
        allow_data_label_overlap: false,
        show_2nd_y_axis: false,
        bar_unstack: false,
        use_null_in_trend: false,
    },
})
Record({
    $id: Now.ID['ih-report-layer-manageability'],
    table: 'sys_report_layer',
    data: {
        report: healthScoreTrendReport,
        sequence: 3,
        series_name_text: 'Manageability',
        color: REPORT_COLORS.forestGreen,
        type: 'line',
        source_type: 'table',
        table: x_bits2_inst_hlth_health_score.name,
        trend_field: 'scan_date',
        interval: 'date',
        aggregate: 'AVG',
        sumfield: 'score_manageability',
        set_color: 'one_color',
        compute_percent: 'aggregate',
        show_marker: true,
        show_chart_data_label: false,
        show_data_label_position_middle: false,
        allow_data_label_overlap: false,
        show_2nd_y_axis: false,
        bar_unstack: false,
        use_null_in_trend: false,
    },
})
Record({
    $id: Now.ID['ih-report-layer-upgradability'],
    table: 'sys_report_layer',
    data: {
        report: healthScoreTrendReport,
        sequence: 4,
        series_name_text: 'Upgradability',
        color: REPORT_COLORS.darkOrange,
        type: 'line',
        source_type: 'table',
        table: x_bits2_inst_hlth_health_score.name,
        trend_field: 'scan_date',
        interval: 'date',
        aggregate: 'AVG',
        sumfield: 'score_upgradability',
        set_color: 'one_color',
        compute_percent: 'aggregate',
        show_marker: true,
        show_chart_data_label: false,
        show_data_label_position_middle: false,
        allow_data_label_overlap: false,
        show_2nd_y_axis: false,
        bar_unstack: false,
        use_null_in_trend: false,
    },
})

Record({
    $id: Now.ID['ih-module-health-scores'],
    table: 'sys_app_module',
    data: {
        title: 'Health Scores',
        mobile_title: 'Health Scores',
        active: true,
        override_menu_roles: false,
        uncancelable: false,
        require_confirmation: false,
        application: instanceHealthMenu,
        link_type: 'LIST',
        name: x_bits2_inst_hlth_health_score.name,
        filter: 'ORDERBYDESCscan_date',
        order: 100,
        roles: ['admin'],
        hint: 'Health score per run of the scan suite, newest first',
    },
})

Record({
    $id: Now.ID['ih-module-health-score-trend'],
    table: 'sys_app_module',
    data: {
        title: 'Health Score Trend',
        mobile_title: 'Health Score Trend',
        active: true,
        override_menu_roles: false,
        uncancelable: false,
        require_confirmation: false,
        application: instanceHealthMenu,
        link_type: 'REPORT',
        report: healthScoreTrendReport,
        order: 200,
        roles: ['admin'],
        hint: 'Trend of the health score over the scan runs',
    },
})
