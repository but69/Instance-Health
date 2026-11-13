import { Property } from '@servicenow/sdk/core'

// Thresholds of the scan checks. Each check reads its property with the default shown here if the property is missing.
export const ihSlowReportSeconds = Property({
    $id: Now.ID['ih-prop-slow-report-seconds'],
    name: 'x_bits2_inst_hlth.slow_report_seconds',
    type: 'integer',
    value: 5,
    description: 'IH-002: reports with a recent average run time above this many seconds are reported.',
})

export const ihMaxClientScripts = Property({
    $id: Now.ID['ih-prop-max-client-scripts'],
    name: 'x_bits2_inst_hlth.max_client_scripts_per_table',
    type: 'integer',
    value: 10,
    description: 'IH-003: tables with more active custom client scripts than this are reported.',
})

export const ihMaxImportSetRows = Property({
    $id: Now.ID['ih-prop-max-import-set-rows'],
    name: 'x_bits2_inst_hlth.max_import_set_rows',
    type: 'integer',
    value: 5000000,
    description: 'IH-007: if all import set rows together exceed this number, the largest import runs are reported.',
})

export const ihCollectorMaxAgeDays = Property({
    $id: Now.ID['ih-prop-collector-max-age-days'],
    name: 'x_bits2_inst_hlth.data_collector_max_age_days',
    type: 'integer',
    value: 7,
    description: 'IH-004: active data collector jobs whose latest finished run is older than this many days are reported. 0 turns the age rule off.',
})
