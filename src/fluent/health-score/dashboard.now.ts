import { Dashboard } from '@servicenow/sdk/core'

// Platform Analytics dashboard "Instance Health" (user request 2026-11-06): filter on top to choose the
// trend lines, the trend chart (no drilldown, user request 2026-11-06) and below it the list of all
// health scores with the columns of the "Health Scores" list (default view).
// The chart reads x_bits2_inst_hlth_health_score_value (one row per scan and trend line), because a
// dashboard filter selects records by a field value; the lines are the values of "dimension".
const VALUE_TABLE = 'x_bits2_inst_hlth_health_score_value'
const SCORE_TABLE = 'x_bits2_inst_hlth_health_score'
// sys_id of the platform role admin (same on every instance)
const ADMIN_ROLE = '2831a114c611228501d4ea6c309d626d'
// UX components (sys_ux_macroponent). SDK 4.14.0 resolves 'line' to its sys_id but writes 'filter' and
// 'list-simple' unresolved, which broke both widgets ("unknown error", no filter). Platform sys_ids:
const COMPONENT_FILTER = '226449101138d0dff1abe0e1566c8b2a' // Filter
const COMPONENT_LIST_SIMPLE = '2b1c080881e05dc63b917044290b233f' // List - Simple
// Columns of the "Health Scores" list, default view, in its order (sys_ui_list_element positions 0-9)
const SCORE_LIST_COLUMNS =
    'checks_evaluated,checks_failed,details,findings,health_score,knock_out,knock_out_checks,scan_date,scan_result,score_manageability'

export const instanceHealthDashboard = Dashboard({
    $id: Now.ID['ih-dashboard'],
    name: 'BiHa-Instance Health',
    description: 'Health score of the instance and its categories per run of the scan suite "Instance health". 100 = completely healthy.',
    active: true,
    topLayout: {
        widgets: [
            {
                $id: Now.ID['ih-dashboard-filter-trend-lines'],
                component: COMPONENT_FILTER,
                componentProps: {
                    filterId: 'ih-filter-trend-lines',
                    filterName: 'Trend lines',
                    filterComponentType: 'multiselect',
                    isDashboard: true,
                    enableClearFilter: true,
                    enableResetToDefault: false,
                    isShowSelectedValueInPill: true,
                    defaultSelectedItems: [],
                    dateFilterView: 'calendar-reldates',
                    sort: 'ASC',
                    maxElements: 500,
                    cascadeScope: 'top_layout',
                    datasource: { type: 'table', payload: { table: VALUE_TABLE, field: 'dimension', fieldType: 'choice' } },
                    targets: [{ type: 'table', payload: { table: VALUE_TABLE, field: 'dimension', fieldType: 'choice' } }],
                },
                width: 16,
                height: 3,
                position: { x: 0, y: 0 },
            },
        ],
    },
    tabs: [
        {
            $id: Now.ID['ih-dashboard-tab-trend'],
            name: 'Trend',
            widgets: [
                {
                    $id: Now.ID['ih-dashboard-trend-chart'],
                    component: 'line',
                    componentProps: {
                        headerTitle: 'BiHa-Instance Health Score Trend',
                        showHeader: true,
                        showBorder: true,
                        description: 'Average score per scan date. Choose the trend lines with the filter "Trend lines" above.',
                        dataSources: [{ sourceType: 'table', tableOrViewName: VALUE_TABLE, filterQuery: '', id: 'ds_values' }],
                        groupBy: [
                            {
                                groupBy: [{ dataSource: 'ds_values', groupByField: 'dimension', isChoice: true }],
                                maxNumberOfGroups: 'ALL',
                            },
                        ],
                        metrics: [
                            {
                                dataSource: 'ds_values',
                                aggregateFunction: 'AVG',
                                aggregateField: 'score',
                                axisId: 'primary',
                                id: 'metric_score',
                            },
                        ],
                        trendBy: { trendByFrequency: 'date', trendByFields: [{ field: 'scan_date', metric: 'metric_score' }] },
                        showLegend: true,
                        legendPosition: 'bottom',
                        showYGrid: true,
                        // No click-through to a list (user request 2026-11-06)
                        enableDrilldown: false,
                        followFilters: true,
                        filterConfigurations: '@state.parFilters',
                    },
                    width: 48,
                    height: 20,
                    position: { x: 0, y: 0 },
                },
                {
                    // All health scores (one per scan result), newest first
                    $id: Now.ID['ih-dashboard-score-list'],
                    component: COMPONENT_LIST_SIMPLE,
                    componentProps: {
                        listTitle: 'Health scores',
                        table: SCORE_TABLE,
                        query: 'ORDERBYDESCscan_date',
                        fixedQuery: '',
                        columnPreferenceKey: '',
                        columns: SCORE_LIST_COLUMNS,
                        maxColumns: 10,
                        followFilters: true,
                        isDashboard: true,
                        showBorder: true,
                        bare: false,
                        wordWrap: false,
                        maxCharLimit: 4000,
                        hideViewAll: false,
                        hideLinks: false,
                        hideInlineEditing: true,
                        hidePersonalization: true,
                        hideTitleRowCount: false,
                        hideLastRefreshedText: true,
                        hideRefreshButton: false,
                        hideHeader: false,
                        hideTitle: false,
                    },
                    width: 48,
                    height: 16,
                    position: { x: 0, y: 20 },
                },
            ],
        },
    ],
    permissions: [
        {
            $id: Now.ID['ih-dashboard-permission-admin'],
            role: ADMIN_ROLE,
            canRead: true,
            canWrite: true,
            canShare: true,
            owner: false,
        },
    ],
    visibilities: [],
})
