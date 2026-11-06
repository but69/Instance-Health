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
                    'ih-010-dot-walk-to-sys-id': {
                        table: 'scan_column_type_check'
                        id: '610520f596ee4ac39df3e85c503556d2'
                    }
                    'ih-011-synchronous-ajax': {
                        table: 'scan_column_type_check'
                        id: '99489ffde60a4d6b8eb0ae2f51bb6501'
                    }
                    'ih-012-hard-coded-instance-url': {
                        table: 'scan_column_type_check'
                        id: 'af5180f6ab8f424aa61365c8a918faf3'
                    }
                    'ih-013-hard-coded-sys-ids': {
                        table: 'scan_column_type_check'
                        id: 'e3f86c2f6b2a42f292d71219e6cfefa9'
                    }
                    'ih-014-before-rule-updates': {
                        table: 'scan_table_check'
                        id: 'b6c88e436ed04168a5f615469d9e831b'
                    }
                    'ih-015-global-business-rules': {
                        table: 'scan_table_check'
                        id: 'd801d7870fbd4269bfda794dd19572c6'
                    }
                    'ih-016-duplicate-script-includes': {
                        table: 'scan_script_only_check'
                        id: 'dd3ba9ade9c647dab478a72dfee30da8'
                    }
                    'ih-017-coalesce-without-index': {
                        table: 'scan_table_check'
                        id: 'c70b096611cd4d2baef46640278e9175'
                    }
                    'ih-018-tables-without-acls': {
                        table: 'scan_script_only_check'
                        id: 'dcf915e944484e419a958babd6601b8b'
                    }
                    'ih-019-read-acl-queries': {
                        table: 'scan_table_check'
                        id: '1fe0320e5d6f4643a25db36324796e37'
                    }
                    'ih-020-sla-engine-synchronous': {
                        table: 'scan_script_only_check'
                        id: '32e2cea0e924405287e6b36c2a58eb77'
                    }
                    'ih-021-sync-outbound-calls': {
                        table: 'scan_table_check'
                        id: '6cf35a4d3be14a6b8fab4a60407207d3'
                    }
                    'ih-022-upgrade-skipped-items': {
                        table: 'scan_script_only_check'
                        id: 'ddfdd37d084c4c308a5eca6d4df10909'
                    }
                    'ih-023-default-rows-per-page': {
                        table: 'scan_table_check'
                        id: 'd7766e499d2a4c2d930e2133f8cf4a86'
                    }
                    'ih-024-slow-scripts': {
                        table: 'scan_table_check'
                        id: 'bdf8a7203bad4b7192298d56989ea72b'
                    }
                    'ih-025-baseline-business-rules': {
                        table: 'scan_script_only_check'
                        id: 'e71ca4694f3542fb8e8a8a191d802ffe'
                    }
                    'ih-026-baseline-script-includes': {
                        table: 'scan_script_only_check'
                        id: 'ad663c8dcc964673bd654d3d5de80f48'
                    }
                    'ih-027-baseline-client-scripts': {
                        table: 'scan_script_only_check'
                        id: 'f556fc2d081842bbac83b2b7c2684830'
                    }
                    'ih-028-baseline-ui-macros-pages': {
                        table: 'scan_script_only_check'
                        id: '7c730cd335324536937a50ae355580a9'
                    }
                    'ih-029-baseline-ui-actions': {
                        table: 'scan_script_only_check'
                        id: '67ea8fe67c2b4507ba6cafbfbec92718'
                    }
                    'ih-030-virtual-cis-with-assets': {
                        table: 'scan_script_only_check'
                        id: '0f542a026d914d2e98503509659db4e9'
                    }
                    'ih-031-missing-serial-numbers': {
                        table: 'scan_table_check'
                        id: '9e08d231115c43dc8e924363997021ab'
                    }
                    'ih-scan-util': {
                        table: 'sys_script_include'
                        id: 'ab660315d1c14bb184dc5c20bc21f75c'
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
