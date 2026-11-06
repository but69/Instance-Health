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
                        deleted: true
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
                        deleted: true
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
                        deleted: true
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
                        deleted: true
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
                    'ih-077-coalesce-without-index': {
                        table: 'scan_script_only_check'
                        id: 'b91f93e329ca4e95abefb4fc6ce7e296'
                    }
                    'ih-078-indirect-current-update': {
                        table: 'scan_script_only_check'
                        id: 'c133cb1e0721498f814cea60ad295ee5'
                    }
                    'ih-079-tasks-opened-by-inactive-user': {
                        table: 'scan_script_only_check'
                        id: '56b2f0e5f263468280b8ed26a4bc421b'
                    }
                    'ih-080-active-tasks-with-closed-date': {
                        table: 'scan_script_only_check'
                        id: '9439518029594f8b9ac2ddf66a3f148f'
                    }
                    'ih-health-score': {
                        table: 'sys_script_include'
                        id: '69e8c8bfb88847528cfbc953d47a4c9e'
                    }
                    'ih-health-score-acl-create': {
                        table: 'sys_security_acl'
                        id: '76cd94979d784a22a84542e82fe5616a'
                    }
                    'ih-health-score-acl-delete': {
                        table: 'sys_security_acl'
                        id: '96fa41417e914456907d613bc32ede39'
                    }
                    'ih-health-score-acl-read': {
                        table: 'sys_security_acl'
                        id: '1849a511d3bd4fe996c9c871bec9fa4f'
                    }
                    'ih-health-score-acl-write': {
                        table: 'sys_security_acl'
                        id: 'c1dba7281e2d4d09a72dd30f9827f6ee'
                    }
                    'ih-health-score-job': {
                        table: 'sysauto_script'
                        id: '5a84bf997e7f427ba5d787d95595d2e6'
                    }
                    'ih-list-control-health-score': {
                        table: 'sys_ui_list_control'
                        id: '3fd79b40b5ef4ed7a0096e395ab36d3a'
                    }
                    'ih-menu': {
                        table: 'sys_app_application'
                        id: '7ab5623b683c478dbaa6d49be3ee7611'
                    }
                    'ih-module-health-score-trend': {
                        table: 'sys_app_module'
                        id: '47c35ef5cee843768c1166d989aa636a'
                    }
                    'ih-module-health-scores': {
                        table: 'sys_app_module'
                        id: '98f7c6e7cd014fdf87f5e28ec8181530'
                    }
                    'ih-report-health-score-trend': {
                        table: 'sys_report'
                        id: 'a8e15075f41f4ff9a1c5a979b5f74f86'
                    }
                    'ih-scan-util': {
                        table: 'sys_script_include'
                        id: 'ab660315d1c14bb184dc5c20bc21f75c'
                    }
                    'ih-suite-check-001': {
                        table: 'scan_check_suite_check'
                        id: '258a69455edc4d888e9a6e2829142418'
                    }
                    'ih-suite-check-002': {
                        table: 'scan_check_suite_check'
                        id: '627644e2e3e14c768b8b8f202196a007'
                    }
                    'ih-suite-check-003': {
                        table: 'scan_check_suite_check'
                        id: '469301738e1e48f1aae7c9a984ab7813'
                    }
                    'ih-suite-check-004': {
                        table: 'scan_check_suite_check'
                        id: 'a1c37b97b69c42b2b94fc38c0585ea42'
                    }
                    'ih-suite-check-005': {
                        table: 'scan_check_suite_check'
                        id: '264e5964d8d140f6a0b7db70cd84f713'
                    }
                    'ih-suite-check-007': {
                        table: 'scan_check_suite_check'
                        id: '30ce1696435845bcb509be8d972a7128'
                    }
                    'ih-suite-check-008': {
                        table: 'scan_check_suite_check'
                        id: '0499d175c20b4bd5a6151bea854314d2'
                    }
                    'ih-suite-check-009': {
                        table: 'scan_check_suite_check'
                        id: '952dc9c334124312834d72f599066b57'
                    }
                    'ih-suite-check-010': {
                        table: 'scan_check_suite_check'
                        id: 'f18f82f9d93344588e48a82cadbc7aad'
                    }
                    'ih-suite-check-011': {
                        table: 'scan_check_suite_check'
                        id: '91fb3e35925b4ab6a59611e31661573a'
                    }
                    'ih-suite-check-012': {
                        table: 'scan_check_suite_check'
                        id: '2145858a2b7c4e3bb052b376f6154a6c'
                    }
                    'ih-suite-check-013': {
                        table: 'scan_check_suite_check'
                        id: '6970035219de46c7b136f013dcb36d6f'
                    }
                    'ih-suite-check-014': {
                        table: 'scan_check_suite_check'
                        id: '5747d8cbe8194594a5698c4815094c31'
                    }
                    'ih-suite-check-015': {
                        table: 'scan_check_suite_check'
                        id: '07a1aa3792f04f17b9cbd85df8bb451e'
                    }
                    'ih-suite-check-016': {
                        table: 'scan_check_suite_check'
                        id: '9201f16cbf5f40278b2254853b95fa0f'
                    }
                    'ih-suite-check-017': {
                        table: 'scan_check_suite_check'
                        id: '18285963b66e4d739ec0362c7f4ad8a0'
                        deleted: true
                    }
                    'ih-suite-check-018': {
                        table: 'scan_check_suite_check'
                        id: 'b687338157714732a6392b42653d6c4b'
                    }
                    'ih-suite-check-019': {
                        table: 'scan_check_suite_check'
                        id: 'f167c428f9394407a8b228ac7de3f748'
                    }
                    'ih-suite-check-020': {
                        table: 'scan_check_suite_check'
                        id: '21cbcd88194c4595a0b633f656aca8d3'
                    }
                    'ih-suite-check-021': {
                        table: 'scan_check_suite_check'
                        id: '7d0989ab47d34b6c82d0e1e92f0d1887'
                    }
                    'ih-suite-check-022': {
                        table: 'scan_check_suite_check'
                        id: '1946f4f5dcc5426f8a7677da0dbe6fe7'
                    }
                    'ih-suite-check-023': {
                        table: 'scan_check_suite_check'
                        id: 'eecf919ef4064c54b25d35a47baeb4f2'
                    }
                    'ih-suite-check-024': {
                        table: 'scan_check_suite_check'
                        id: 'b7b956658b584277a91007dbd507d05a'
                    }
                    'ih-suite-check-025': {
                        table: 'scan_check_suite_check'
                        id: 'bf39c8ebab1b472a8751f1b756d7d563'
                    }
                    'ih-suite-check-026': {
                        table: 'scan_check_suite_check'
                        id: 'f1d6f25e84f642338607d402702ccfd0'
                    }
                    'ih-suite-check-027': {
                        table: 'scan_check_suite_check'
                        id: '5483ce132f4849d5995102eefbfc45ec'
                    }
                    'ih-suite-check-028': {
                        table: 'scan_check_suite_check'
                        id: '8027e63c3ba5493d91a6be7646677a97'
                    }
                    'ih-suite-check-029': {
                        table: 'scan_check_suite_check'
                        id: '0092b784243643cf806b9e0732894752'
                    }
                    'ih-suite-check-030': {
                        table: 'scan_check_suite_check'
                        id: '586e36b83b504c0faa632ed0bbd87bab'
                    }
                    'ih-suite-check-031': {
                        table: 'scan_check_suite_check'
                        id: 'f90d4eedb93b4828b3b91ae121a6390c'
                    }
                    'ih-suite-check-032': {
                        table: 'scan_check_suite_check'
                        id: '4bb818d8dba449ff9edc11a0a3e2996e'
                    }
                    'ih-suite-check-033': {
                        table: 'scan_check_suite_check'
                        id: '1f1a14b283894fd0b6d35bb0c62ca771'
                    }
                    'ih-suite-check-034': {
                        table: 'scan_check_suite_check'
                        id: '6a22fe18e6bb4e3f9f44bba76d8a8b52'
                    }
                    'ih-suite-check-035': {
                        table: 'scan_check_suite_check'
                        id: 'b06f3ae0dccb41e8bcd510e1c0c274ee'
                    }
                    'ih-suite-check-036': {
                        table: 'scan_check_suite_check'
                        id: '4f81905982f34081bcd36626064bfc36'
                    }
                    'ih-suite-check-037': {
                        table: 'scan_check_suite_check'
                        id: 'b51fb1816b944b7cb9c15de65a42d3ab'
                    }
                    'ih-suite-check-038': {
                        table: 'scan_check_suite_check'
                        id: '83bee4a717314a2394dcee01bf47dbf2'
                        deleted: true
                    }
                    'ih-suite-check-039': {
                        table: 'scan_check_suite_check'
                        id: 'faf9e7871a064bd49ac03c5ebd6781f0'
                    }
                    'ih-suite-check-040': {
                        table: 'scan_check_suite_check'
                        id: '661bbfcd1183451fbcd3be83b99346c6'
                    }
                    'ih-suite-check-041': {
                        table: 'scan_check_suite_check'
                        id: 'f6457a3bc73d479e8e99940a94ce4c62'
                    }
                    'ih-suite-check-042': {
                        table: 'scan_check_suite_check'
                        id: '1ba56fdfcb9241cc9e67967539752933'
                    }
                    'ih-suite-check-043': {
                        table: 'scan_check_suite_check'
                        id: 'd62071be3f044177a6393789099b82b7'
                    }
                    'ih-suite-check-044': {
                        table: 'scan_check_suite_check'
                        id: 'c00520773bbd4131aa79fa1241952e12'
                    }
                    'ih-suite-check-046': {
                        table: 'scan_check_suite_check'
                        id: '1a1400a718eb46dd99a73edec7a54bf7'
                    }
                    'ih-suite-check-047': {
                        table: 'scan_check_suite_check'
                        id: '649caabe18a44a86a3b201d29e3c2ac9'
                    }
                    'ih-suite-check-048': {
                        table: 'scan_check_suite_check'
                        id: '3be5de1725cb44c594563ca11c02f5c6'
                    }
                    'ih-suite-check-049': {
                        table: 'scan_check_suite_check'
                        id: 'f3339fd51a4c48c082fa277fe2a623de'
                    }
                    'ih-suite-check-050': {
                        table: 'scan_check_suite_check'
                        id: 'cee2623636904baab20fbb1e678cc41c'
                    }
                    'ih-suite-check-051': {
                        table: 'scan_check_suite_check'
                        id: 'abe07c7b59a0447f8d3d62d8e191eb33'
                        deleted: true
                    }
                    'ih-suite-check-052': {
                        table: 'scan_check_suite_check'
                        id: 'ba44ebbbdb514c64b46004f62bc0836e'
                    }
                    'ih-suite-check-053': {
                        table: 'scan_check_suite_check'
                        id: '933331abdc984fd7bb305c7b76da4cbb'
                    }
                    'ih-suite-check-054': {
                        table: 'scan_check_suite_check'
                        id: '3e2aaeedd3ba4e10b1bbbf89200cd0f4'
                    }
                    'ih-suite-check-055': {
                        table: 'scan_check_suite_check'
                        id: '5ec0f273f605498c9765518b91842b82'
                    }
                    'ih-suite-check-056': {
                        table: 'scan_check_suite_check'
                        id: '44410019ddce4ce6b5e26d80c78dadff'
                        deleted: true
                    }
                    'ih-suite-check-057': {
                        table: 'scan_check_suite_check'
                        id: '9947995500f44252bcdab65382fa8a5a'
                    }
                    'ih-suite-check-058': {
                        table: 'scan_check_suite_check'
                        id: 'fca19e7bccab4918a0a48e5d551e3f64'
                    }
                    'ih-suite-check-059': {
                        table: 'scan_check_suite_check'
                        id: 'f38329f4f7de42aa85891dac21cf9e85'
                    }
                    'ih-suite-check-060': {
                        table: 'scan_check_suite_check'
                        id: '25095d2928c84245b8dd613564aed89c'
                    }
                    'ih-suite-check-061': {
                        table: 'scan_check_suite_check'
                        id: 'eb834d54d8c24c6cac3dddcac63fe484'
                    }
                    'ih-suite-check-062': {
                        table: 'scan_check_suite_check'
                        id: 'ae5d1ef8384c4d368528b772b31f2cc7'
                    }
                    'ih-suite-check-063': {
                        table: 'scan_check_suite_check'
                        id: '4ce324560a454d4ea133541eec90b155'
                    }
                    'ih-suite-check-064': {
                        table: 'scan_check_suite_check'
                        id: '405a3caea2b54752a877ef300f6e9fa9'
                    }
                    'ih-suite-check-065': {
                        table: 'scan_check_suite_check'
                        id: 'd23df7d1ecfe4d47a05b5ed934f1274a'
                    }
                    'ih-suite-check-067': {
                        table: 'scan_check_suite_check'
                        id: '07d4be15efcf4a4ab8d12efc094452c0'
                    }
                    'ih-suite-check-068': {
                        table: 'scan_check_suite_check'
                        id: 'df365acba9af46679991ae9afb747635'
                    }
                    'ih-suite-check-069': {
                        table: 'scan_check_suite_check'
                        id: '6f1a07d39fc24fa2959574e2af443a76'
                    }
                    'ih-suite-check-070': {
                        table: 'scan_check_suite_check'
                        id: '67e87380e8b4412aba26cfe21f449c3d'
                    }
                    'ih-suite-check-071': {
                        table: 'scan_check_suite_check'
                        id: '60b93dfa1d34419f9b574761ac593623'
                    }
                    'ih-suite-check-072': {
                        table: 'scan_check_suite_check'
                        id: '235c4c8cf7fa42fd83c20fc5d5a5f45c'
                    }
                    'ih-suite-check-073': {
                        table: 'scan_check_suite_check'
                        id: '73f0df8e79db4e0194cd624ab7228f71'
                    }
                    'ih-suite-check-074': {
                        table: 'scan_check_suite_check'
                        id: '1572cf4aefde41b4a9f4106b6c8cf098'
                    }
                    'ih-suite-check-075': {
                        table: 'scan_check_suite_check'
                        id: 'fd67ec946045416a8f6463ccd6216dfe'
                    }
                    'ih-suite-check-076': {
                        table: 'scan_check_suite_check'
                        id: '646a222dcc754acd91cf0f0c42a668f0'
                    }
                    'ih-suite-check-077': {
                        table: 'scan_check_suite_check'
                        id: '402b9f2b5c0943309e2d2c98e523b25a'
                    }
                    'ih-suite-check-078': {
                        table: 'scan_check_suite_check'
                        id: 'b996c4d6bb8b4aaa97407d922283f79a'
                    }
                    'ih-suite-check-079': {
                        table: 'scan_check_suite_check'
                        id: '180a40e04cda417f80d8f63c8ccb7a1a'
                    }
                    'ih-suite-check-080': {
                        table: 'scan_check_suite_check'
                        id: 'f3809cd44d3046e8b21c8d4ae796cc48'
                    }
                    'ih-suite-instance-health': {
                        table: 'scan_check_suite'
                        id: 'b152ddddafa943f0accb08142b5b42d6'
                    }
                    'ih-ui-action-run-suite': {
                        table: 'sys_ui_action'
                        id: 'c63380c520d6419e8825bde3f82efaf9'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '3375b34e79e4474bb7a9d8011059829a'
                    }
                }
                composite: [
                    {
                        table: 'sys_dictionary'
                        id: '01dd88296d2347a2916ca99783d25e85'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'score_manageability'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '1388052f1a3b4cbb9cab72fc8212b1cf'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'details'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '144584842d4d441fa1bbfe0ebf2bac27'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'score_priority_3'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '165321f5a48f4b0a9b138d8c8accca8a'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'findings'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '173c232a57e24ed3bfbd65386dd4f364'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'score_priority_2'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '20c1128fca454d98ac4085bbc36365cc'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'score_uncapped'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '226d60a105944248a24adcddb4bb5d87'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'score_security'
                        }
                    },
                    {
                        table: 'sys_db_object'
                        id: '22e638eb578d4ea99bdc7b74211e52e9'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '254757cc0d1b4c79bb6bae478ed12029'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'score_security'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '270a8a0a816540d991b31e9e1c8c4e7e'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'checks_evaluated'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '2e6e669c318843ae9f32e33d95b717a1'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'checks_failed'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '484a632a92fe4fbfb9f52edf40bdf06b'
                        key: {
                            sys_security_acl: '96fa41417e914456907d613bc32ede39'
                            sys_user_role: {
                                id: 'd7c37c23f2d14a3babfcfec3ba912af8'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: '4c90c0696edb4a449df207c2f86d5c05'
                        key: {
                            sys_security_acl: 'c1dba7281e2d4d09a72dd30f9827f6ee'
                            sys_user_role: {
                                id: 'd7c37c23f2d14a3babfcfec3ba912af8'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '51ce925d696f4c619319f8bd781245e5'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'details'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '5359b170d95647088dadb3d768b82e38'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'health_score'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_ui_action_role'
                        id: '605eb3c46b2a48d9a3295e2a92a4bdc9'
                        key: {
                            sys_ui_action: 'c63380c520d6419e8825bde3f82efaf9'
                            sys_user_role: {
                                id: 'd7c37c23f2d14a3babfcfec3ba912af8'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '663725fd989542cba138c6cf4eb11dd5'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'scan_result'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '7a29fa470e0f49f5816dc8d14c6eddf1'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'score_manageability'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8a0899695efe404f89798fd075bb1c9d'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'scan_result'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '8c865c2ede9041bc8614fe1443bc80f3'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'score_priority_3'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: '925399cbc78b4ef4b1b1df070d5f73c4'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'score_performance'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '94e7601b5b7b40f5be0861104c18886c'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'score_performance'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '987ceec633d14b5fa944da8f18c96254'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'NULL'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9a96856f3cf040dd977b8a4cb39a8d71'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'score_upgradability'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: '9ae59427908441c1904c7bcceb02dcf4'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'score_priority_1'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'a40c6982c98e49f0ad2e3f04a4d3b9c1'
                        key: {
                            sys_security_acl: '1849a511d3bd4fe996c9c871bec9fa4f'
                            sys_user_role: {
                                id: 'd7c37c23f2d14a3babfcfec3ba912af8'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'a55dff5565eb49cdb4a379a70f3dfe6d'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'score_upgradability'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b35c902a711d4e7ebf61549c9a4daeba'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'score_priority_2'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'b5af168fb7a243f4a1822c8eb2d777f4'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'knock_out_checks'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'b90254e92d2a4182977d08fb3cd1c633'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'NULL'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ba582a247b95404d985691b657f51fe4'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'score_uncapped'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'bcbaef6bde124d57b55ff55d9feab7b8'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'checks_evaluated'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'bf5afa6c5ff54d4c87e558ded7313c5d'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'knock_out_checks'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'c2c2d123d9144559bfa605840978fca7'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'scan_date'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c6b8a0fbe40d416b98bf17fd3fb5d027'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'scan_date'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'c8418f8eaec7404fb7f0a98fb20d2f6b'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'knock_out'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_security_acl_role'
                        id: 'd2dd0e606baa40d99cc75de7b683710f'
                        key: {
                            sys_security_acl: '76cd94979d784a22a84542e82fe5616a'
                            sys_user_role: {
                                id: 'd7c37c23f2d14a3babfcfec3ba912af8'
                                key: {
                                    name: 'admin'
                                }
                            }
                        }
                    },
                    {
                        table: 'sys_documentation'
                        id: 'd3f1a0f0d28d4370ba657bb6db50f7f5'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'findings'
                            language: 'en'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'd75cc304fd1e455781bd95fd587fe74e'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'checks_failed'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'de1a901c5cf745cfa54daeae32a55fe4'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'score_priority_1'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'ea18dce066ae47e6b37e6e552b39e28f'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'health_score'
                        }
                    },
                    {
                        table: 'ua_table_licensing_config'
                        id: 'f5aebb93cc80415ba84dc07f148020bc'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                        }
                    },
                    {
                        table: 'sys_dictionary'
                        id: 'fa10147e6b814704843e4419900db550'
                        key: {
                            name: 'x_bits2_inst_hlth_health_score'
                            element: 'knock_out'
                        }
                    },
                ]
            }
        }
    }
}
