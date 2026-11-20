import { Form } from '@servicenow/sdk/core'

// Form of the health score (user request 2026-11-20): three sections General, Scan check groups, Details.
// Fields that are not listed here (checks_failed) are not shown on the form.
export const ihHealthScoreForm = Form({
    table: 'x_bits2_inst_hlth_health_score',
    view: Now.ref('sys_ui_view', 'Default view'),
    sections: [
        {
            caption: 'General',
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'scan_result', type: 'table_field' },
                        { field: 'scan_date', type: 'table_field' },
                        { field: 'findings', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'health_score', type: 'table_field' },
                        { field: 'score_uncapped', type: 'table_field' },
                        { field: 'knock_out', type: 'table_field' },
                    ],
                },
            ],
        },
        {
            caption: 'Scan check groups',
            header: true,
            content: [
                {
                    layout: 'two-column',
                    leftElements: [
                        { field: 'score_priority_1', type: 'table_field' },
                        { field: 'score_priority_2', type: 'table_field' },
                        { field: 'score_priority_3', type: 'table_field' },
                    ],
                    rightElements: [
                        { field: 'score_upgradability', type: 'table_field' },
                        { field: 'score_performance', type: 'table_field' },
                        { field: 'score_manageability', type: 'table_field' },
                        { field: 'score_security', type: 'table_field' },
                    ],
                },
            ],
        },
        {
            caption: 'Details',
            header: true,
            content: [
                {
                    layout: 'one-column',
                    elements: [
                        { field: 'details', type: 'table_field' },
                        { field: 'knock_out_checks', type: 'table_field' },
                        { field: 'checks_evaluated', type: 'table_field' },
                    ],
                },
            ],
        },
    ],
})
