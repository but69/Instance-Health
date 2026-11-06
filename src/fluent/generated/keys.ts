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
                    'ih-032-create-asset-rules': {
                        table: 'scan_script_only_check'
                        id: 'c66f6db2c6fc4f748c8b3aed9982feac'
                    }
                    'ih-033-invalid-discovery-source': {
                        table: 'scan_script_only_check'
                        id: '5cd1b5e8b2594c9bb105229605a172b1'
                    }
                    'ih-034-impersonation-in-production': {
                        table: 'scan_script_only_check'
                        id: '4a6de08673c14e4bb3f7ff09366cea74'
                    }
                    'ih-035-duplicate-update-set-names': {
                        table: 'scan_script_only_check'
                        id: '6c46c7dfd39445608528c142620a04b7'
                    }
                    'ih-036-knowledge-base-retire-workflow': {
                        table: 'scan_table_check'
                        id: '07fabbb7c7744d54be8685c0d6bdec71'
                    }
                    'ih-037-business-rule-callstack': {
                        table: 'scan_table_check'
                        id: '96eb4e3ca6d54786be9bc20019c3dd45'
                    }
                    'ih-038-indirect-current-update': {
                        table: 'scan_table_check'
                        id: '3c19da8d722e4e249147e118d5529dd2'
                    }
                    'ih-039-complex-conditions': {
                        table: 'scan_table_check'
                        id: '73cdb483780546a69197ef370d06ee78'
                    }
                    'ih-040-inactive-group-members': {
                        table: 'scan_table_check'
                        id: '94eb01012dfa446ca1896b1b733850e3'
                    }
                    'ih-041-inactive-group-manager': {
                        table: 'scan_table_check'
                        id: '83f6c05000644a0580d58462f69b165f'
                    }
                    'ih-042-groups-without-members': {
                        table: 'scan_table_check'
                        id: 'ecc7d9f404844f698cc64fadfb51557d'
                    }
                    'ih-043-direct-role-assignments': {
                        table: 'scan_table_check'
                        id: '066f561c35274b5b86c4c7b06f9bfef9'
                    }
                    'ih-044-role-groups-without-type': {
                        table: 'scan_table_check'
                        id: '4e10ab8932cd4daa814430039b278589'
                    }
                    'ih-046-orphaned-dictionary-entries': {
                        table: 'scan_script_only_check'
                        id: '98395f89c5624e52a55424c63b30babd'
                    }
                    'ih-047-list-layout-duplicate-positions': {
                        table: 'scan_script_only_check'
                        id: 'e661823cf07c40749225ec27eeecfc49'
                    }
                    'ih-048-orphaned-catalog-tasks': {
                        table: 'scan_table_check'
                        id: '8ad8b8186fd84ae19fb9bcdbfdd4e00e'
                    }
                    'ih-049-jobs-run-as-deleted-user': {
                        table: 'scan_table_check'
                        id: '4c6694d3dd4147f4a09e3d5a7ef0d034'
                    }
                    'ih-050-jobs-run-as-inactive-user': {
                        table: 'scan_table_check'
                        id: 'fdd2043e3c0d473c874a7dc3892be6c1'
                    }
                    'ih-051-tasks-opened-by-inactive-user': {
                        table: 'scan_table_check'
                        id: '384a104d89d94bb38737e3962e849b3f'
                    }
                    'ih-052-system-locale': {
                        table: 'scan_script_only_check'
                        id: '43df7a0132844609a7475d27fdb37159'
                    }
                    'ih-053-single-currency-mode': {
                        table: 'scan_script_only_check'
                        id: '8a82f15a7f0148128fcc7b062219ebd6'
                    }
                    'ih-054-mark-resolved': {
                        table: 'scan_script_only_check'
                        id: 'a3584b0344de49bb81edddfa240661c7'
                    }
                    'ih-055-problem-closed-fields': {
                        table: 'scan_script_only_check'
                        id: '49c5600595bf4583b9bb4d12aeb75f07'
                    }
                    'ih-056-active-tasks-with-closed-date': {
                        table: 'scan_table_check'
                        id: '00e7564d189c4f91939994bd4baf34f6'
                    }
                    'ih-057-update-set-without-description': {
                        table: 'scan_table_check'
                        id: 'f4b961349cd946b0bc45bbaf88f11476'
                    }
                    'ih-058-stale-configuration-items': {
                        table: 'scan_script_only_check'
                        id: 'd826f51e328947a197dcffe7574951a4'
                    }
                    'ih-059-unsecured-scripted-rest': {
                        table: 'scan_table_check'
                        id: '2f73f6bfa42f425c992763e6a57f575b'
                    }
                    'ih-060-security-ui-filter': {
                        table: 'scan_table_check'
                        id: '7556cfd143c4448998989ba126952231'
                    }
                    'ih-061-ui-action-complex-conditions': {
                        table: 'scan_table_check'
                        id: 'e035070d1e67466db10aaf6f65610850'
                    }
                    'ih-062-large-remote-tables': {
                        table: 'scan_table_check'
                        id: '624c1a1bbe0e48b5ab28ea1bd8c63044'
                    }
                    'ih-063-jobs-longer-than-interval': {
                        table: 'scan_script_only_check'
                        id: '4924bbc8f46f4ec2b76cab48207ba558'
                    }
                    'ih-064-scheduled-job-errors': {
                        table: 'scan_table_check'
                        id: '748555f1bec5479e8ee2b530b6a63ce6'
                    }
                    'ih-065-cache-flush': {
                        table: 'scan_column_type_check'
                        id: '3199c6083c784e0f8c205bd35d45b751'
                    }
                    'ih-067-users-without-login': {
                        table: 'scan_table_check'
                        id: 'd7a1f52f123541df9d1574a4ef043c15'
                    }
                    'ih-068-slow-grouped-list-reports': {
                        table: 'scan_table_check'
                        id: 'bd8a15523cd64e0a814c90bdaba62a6a'
                    }
                    'ih-069-changed-dictionary-entries': {
                        table: 'scan_script_only_check'
                        id: '981ed83f449f4038af5ce7a8adc51ecc'
                    }
                    'ih-070-update-set-audit': {
                        table: 'scan_script_only_check'
                        id: 'a7a313ed934c424b889a728ed564695a'
                    }
                    'ih-071-ci-classes-with-custom-fields': {
                        table: 'scan_script_only_check'
                        id: '2a909c2435c9410b8feefe2e940f5afd'
                    }
                    'ih-072-current-update-in-business-rules': {
                        table: 'scan_table_check'
                        id: '9c7d9ed06334473a82467215739f138b'
                    }
                    'ih-073-unique-location-names': {
                        table: 'scan_script_only_check'
                        id: 'bdfafd8e22724b0fbff4cabe70f60849'
                    }
                    'ih-074-cis-without-name': {
                        table: 'scan_table_check'
                        id: 'aa6cbebd5b2f4a6b84eda663aa7fc1d9'
                    }
                    'ih-075-concurrent-scheduled-imports': {
                        table: 'scan_script_only_check'
                        id: '6ef7d7ea72744c04bb1557e949406fd4'
                    }
                    'ih-076-ui-action-outbound-calls': {
                        table: 'scan_table_check'
                        id: '67735ffe5c2a453a88b996afe10cbb03'
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
