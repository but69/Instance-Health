import { Dashboard } from '@servicenow/sdk/core'

// Platform Analytics dashboard "Instance Health" (user request 2026-11-06): filter on top to choose the
// trend lines, trend chart with drilldown, and the list of health scores (each row opens the record).
// The chart reads x_bits2_inst_hlth_health_score_value (one row per scan and trend line), because a
// dashboard filter selects records by a field value; the lines are the values of "dimension".
const VALUE_TABLE = 'x_bits2_inst_hlth_health_score_value'
const SCORE_TABLE = 'x_bits2_inst_hlth_health_score'
// sys_id of the platform role admin (same on every instance)
const ADMIN_ROLE = '2831a114c611228501d4ea6c309d626d'

export const instanceHealthDashboard = Dashboard({
    $id: Now.ID['ih-dashboard'],
    name: 'Instance Health',
    description: 'Health score of the instance and its categories per run of the scan suite "Instance health". 100 = completely healthy.',
    active: true,
    topLayout: {
        widgets: [
            {
                $id: Now.ID['ih-dashboard-filter-trend-lines'],
                component: 'filter',
                componentProps: {
                    filterName: 'Trend lines',
                    filterComponentType: 'multiselect',
                    isDashboard: true,
                    enableClearFilter: true,
                    isShowSelectedValueInPill: true,
                    defaultSelectedItems: [],
                    datasource: { type: 'table', payload: { table: VALUE_TABLE, field: 'dimension', fieldType: 'choice' } },
                    targets: [{ type: 'table', payload: { table: VALUE_TABLE, field: 'dimension', fieldType: 'choice' } }],
                },
                width: 24,
                height: 6,
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
                        headerTitle: 'Instance Health Score Trend',
                        showHeader: true,
                        showBorder: true,
                        description: 'Average score per scan date. Click a point to open the scores behind it.',
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
                        enableDrilldown: true,
                        followFilters: true,
                        filterConfigurations: '@state.parFilters',
                    },
                    width: 48,
                    height: 20,
                    position: { x: 0, y: 0 },
                },
                {
                    $id: Now.ID['ih-dashboard-score-list'],
                    component: 'list-simple',
                    componentProps: {
                        listTitle: 'Health scores',
                        table: SCORE_TABLE,
                        query: 'ORDERBYDESCscan_date',
                        fixedQuery: '',
                        columns: 'scan_result,scan_date,health_score,score_uncapped,knock_out_checks,score_security,score_performance,score_manageability,score_upgradability',
                        limit: 20,
                        maxColumns: 9,
                        showBorder: true,
                        wordWrap: false,
                    },
                    width: 48,
                    height: 12,
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
