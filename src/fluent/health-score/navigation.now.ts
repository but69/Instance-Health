import { ApplicationMenu, Record } from '@servicenow/sdk/core'
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
