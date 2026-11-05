import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: '934348acb0a84087b6119196dc0881fc'
                    }
                    'ih-001-public-reports': {
                        table: 'scan_table_check'
                        id: '1887f48f241840c1b90a8f3b35158391'
                    }
                    'ih-002-slow-reports': {
                        table: 'scan_table_check'
                        id: '28d0a7a9c5c041fa8073f4df77651aba'
                    }
                    'ih-003-too-many-client-scripts': {
                        table: 'scan_script_only_check'
                        id: '58117751009047a395594b063f5efcd0'
                    }
                    'ih-004-data-collector-job-issues': {
                        table: 'scan_table_check'
                        id: 'dd473c175d664f5e9b1fc4c38666aa2c'
                    }
                    'ih-005-global-ui-scripts': {
                        table: 'scan_table_check'
                        id: '559304cfde2f422bb2870113ab0cb4b4'
                    }
                    'ih-007-global-client-scripts': {
                        table: 'scan_table_check'
                        id: '85181e0698d44c7a8999d8758800eac9'
                    }
                    'ih-008-import-set-row-growth': {
                        table: 'scan_script_only_check'
                        id: '74bfccb246d44d5296e0b37fdcdfa74e'
                    }
                    'ih-009-gs-sql-usage': {
                        table: 'scan_column_type_check'
                        id: 'c316279c67df4578ac56f1b7a19ecb6f'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '3375b34e79e4474bb7a9d8011059829a'
                    }
                }
            }
        }
    }
}
