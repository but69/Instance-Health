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
