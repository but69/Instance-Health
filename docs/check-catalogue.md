# Instance Health: Check Catalogue

Dropped (without number since the renumbering on 2026-11-06): Java package collection mode (2026-11-05), priority 1 skipped upgrade items (2026-11-06), scheduled reports run as invalid or inactive user (2026-11-06, covered by IH-047/IH-048).

## Open items (as of 2026-11-06)

- **First suite run (SR00014613, 2026-11-06):** 770 findings; 66 of 73 checks as expected (all positive test records found, no negative one, real findings as in the dry runs). Deviations and fixes, deployed the same day:
  - IH-017 aborted: `addActiveQuery()` is not allowed on `GlideAggregate` in the app scope → `addQuery('active', true)`. Dry run afterwards: 167 findings.
  - IH-049, IH-054: the engine skips the base table `task` ("exclusion list or too large to scan") and only scans child tables, so the test records of class `task` were missed → `ScriptOnlyCheck` (new keys 079, 080).
  - IH-016, IH-037: the suite scan did not evaluate the 6 ServiceNow transform maps and the custom rule "AMAG - Vehicle Registration - Create CI", although point scans on these records produced the findings; no log entry explains it → `ScriptOnlyCheck` (new keys 077, 078). The old TableChecks (keys 017, 038, 051, 056) were deleted by the build.
  - IH-029 test data: a platform job (runs as `admin`, seen at 12:30) creates "Unknown" model assets for computers without asset, including virtual ones, which is what IH-029 reports. The negative case is now a physical computer; the remove script also deletes these automatically created assets.
  - IH-035: 11 instead of 8; 3 knowledge bases are not readable for the admin user (user criteria) but are seen by the scan engine. Real findings.
  - Noted for review: IH-012 has 24 real findings in generated configuration records (`sys_one_extend_resource_mapping`), IH-009 2 in generated GAF jobs; they count as custom.
- **Second suite run (SR00014619, 2026-11-06):** completed without failed checks, 946 findings, 1 warning. All deviations of the first run are fixed (IH-016 7, IH-017 167, IH-029 1, IH-037 2, IH-049 1, IH-054 16); every positive test record is found, no negative one, real findings as expected.
- **Test data removed (2026-11-06)** after the validation, at the user's request: no IH-TEST record left on bithawkdemo1 (checked across all test tables). Deleting the test assets also deleted their computers (the platform deletes the linked CI), and each on-demand test job had its own `sys_trigger`. Create it again with `test-data/create-test-data.js` when needed.
- **Validation (2026-11-06):** 60 checks are `validated` (confirmed by a test record or real findings and no wrong finding). 13 checks stay `built`: they found nothing on bithawkdemo1 and have no test data, because a test would need instance-wide settings, a platform upgrade or 5 million rows; the scan only showed that they produce no false findings: IH-007, IH-019, IH-022, IH-031, IH-036, IH-050, IH-051, IH-056, IH-058, IH-060, IH-061, IH-067, IH-068. They can be validated on a customer instance or with a temporary setting change on a test instance.
- **Generated records excluded (user decision 2026-11-06):** IH-012 reported 24 hard-coded sys_ids in generated records (15 in `sn_gaf_sysauto_script`, GAF scheduled scripts created by `system` in the Global package; 9 in `sys_one_extend_resource_mapping`, OneExtend mappings), IH-009 2 dot-walks in `sn_gaf_sysauto_script`. `IHScanUtil.isCustom()` now treats records of these tables (`GENERATED_TABLES`) as never custom, for all checks that use the custom rule. Deployed and verified the same day with point scans: the two GAF scripts and the OneExtend mapping that had findings now have none; the test script includes `IHTestSysIdHardCoded` (IH-012) and `IHTestDotWalkUsed` (IH-009) are still found. Expected in the next suite run: IH-012 1, IH-009 1 (the test records).

- IH-001 to IH-008 are deployed to bithawkdemo1. The user ran them; results look fine, but the demo instance has few findings.
- Batch 2 (IH-009 to IH-015, IH-017, IH-018) and the helper `IHScanUtil` are built and deployed to bithawkdemo1 (2026-11-06). IH-003 now uses the helper. IH-016 was built afterwards (option 1, reduced check) and deployed the same day.
- Batches 3 to 6 (IH-019 to IH-073) are built and deployed to bithawkdemo1 (2026-11-06).
- Test data refreshed on 2026-11-06 for batches 1 to 6: 132 records (test users `ih.test.*`, view `ih_test`, test REST API, imports scheduled for 2099, disabled test trigger included), no warnings. Next: the user runs all checks (IH-001 to IH-073) and sends the findings for comparison.
- Test data refreshed on 2026-11-06 for batches 1 to 3: 68 records, all in global, no warnings. A dry run of the batch 3 checks against it (built scripts, stub engine, no findings written) finds every positive case once and no negative one. Next: the user runs all checks (IH-001 to IH-030) and sends the findings for comparison.
- Test record names must fit the field length: `sys_script.name` holds 40 characters including the `IH-TEST ` prefix (a longer name was truncated on 2026-11-06 and its lookup failed). Next: the user runs all checks and sends the findings for comparison.
- `remove-test-data.js` ends with the error `"g_tableName" is not defined` when it restores the user's app after deleting the test update set (2026-11-06). The deletion itself is complete and the app is restored; cause not yet investigated.
- Test data is on bithawkdemo1 (created 2026-11-06 with `now-sdk exec --file test-data/create-test-data.js --scope global --auth but-o`, update set "Instance Health - Test Data", global, 31 updates). Next: run the checks, compare with the expected findings, then run `remove-test-data.js`. Mark checks `validated` afterwards.
- Lessons from the first test data run (2026-11-06): records and update sets follow the user's current application, not the script scope, so the first run landed in the Instance Health app scope (cleaned up). Both scripts now switch to global and restore the app. `GlideUpdateSet.create()` returns nothing, so the update set is inserted directly. A report counts as published only if `roles` contains `public` (OOB rule "Report roles updated - is_publish field" overwrites `is_published`). `now-sdk exec` sometimes reports "not authorized" or a connection reset although the script ran: check the instance before running it again.
- Proposed, not yet agreed: make thresholds (IH-002 5 s, IH-003 10 scripts, IH-007 5 million rows) configurable as system properties. This would also allow testing IH-007 with a low threshold.
- Proposed, not yet agreed: IH-004 should also flag active jobs whose latest run is older than 7 days (seen on bithawkdemo1: latest run 2026-06-12).
- Scan suite "Instance health" created and deployed (2026-11-06, user request): `Record()` on `scan_check_suite` ✔ plus one `scan_check_suite_check` ✔ (`suite`, `check`, `score_weight` 1) per check, in `src/fluent/scan-checks/suite.now.ts`, generated by `tools/generate-suite.js`. Verified on bithawkdemo1: 73 checks linked (IH-001 to IH-073).
- Later: run the checks on a real instance with real data (needs customer approval).

Status values: `idea` → `specified` → `built` → `validated`.
Field and table names marked ✔ were verified on bithawkdemo1 (2026-11-05).

## Health score

Agreed with the user on 2026-11-06 (proposal accepted, knock-out cap at 60 added). 100 = completely healthy.

- **Score per check (0 to 100):** 100 − findings × points per finding, at least 0. Points per finding by priority: P1 20 (0 after 5 findings), P2 5 (after 20), P3 2 (after 50). Setting checks (one finding means a setting or limit is wrong: IH-007, IH-019, IH-021, IH-022, IH-031, IH-033, IH-036, IH-050, IH-051, IH-058, IH-067): 0 with the first finding. Share checks use the share from the finding details: IH-070 score = share of unique location names, IH-056 score = 100 − share of stale CIs. The points per finding are also set as `scoreScale` on each check, so Instance Scan shows the same per-check score (share checks excepted).
- **Health score:** weighted average of the check scores, weight 5 for P1, 3 for P2, 1 for P3.
- **Knock-out cap:** if a P1 check scores 0, the health score is at most 60 (`score_uncapped` keeps the value without cap).
- **Sub-scores:** per priority and per category (security, performance, manageability, upgradability), same weighting.
- **Not counted:** checks that did not run or failed in the scan (the platform gives a failed check score 100); they are listed in `checks_failed`.
- **Implementation:** table `x_bits2_inst_hlth_health_score` (one record per scan result, ACLs read/write/create/delete for admin), script include `x_bits2_inst_hlth.IHHealthScore` (`calculate(resultId)`, `calculatePending()`), scheduled job "Instance Health - calculate health score" every 15 minutes for finished runs of the suite without score. A business rule on `scan_result` is not possible: the table does not allow configuration from other scopes (`configuration_access=0`). Runs are linked to the suite through `scan_suite_execution` (`result`, `suite`).
- **First value (dry run, SR00014619, 2026-11-06):** 60 (uncapped 80.7; knock-out IH-017, IH-021, IH-033). Priority 1/2/3: 76.9 / 81.3 / 87.5; security 53.1, performance 93.1, manageability 89.8, upgradability 67.8. Contains the 26 findings in generated records that are excluded since.
- **Deployed 2026-11-06**, calculation triggered by hand (`calculatePending()`): SR00014613 health 60 (uncapped 82.9, knock-out IH-021, IH-033; 68 of 73 checks counted: IH-017 failed in that run, and IH-016, IH-037, IH-049, IH-054 were replaced by new check records afterwards, so the old run has no execution for them); SR00014619 health 60 (uncapped 80.7, as in the dry run). Job active (every 15 minutes), 4 ACLs on the table.
- **Later step:** for checks with large populations (IH-017, IH-030, IH-042, IH-064) base the score on the share instead of the absolute count, so instance size does not distort it.

**Priorities (2026-11-06, user request):** by impact on instance health instead of by category. 1 = largest impact (instance-wide or all users, data exposure without login or ACL, breaks upgrades), 2 = noticeable impact (single processes, users or areas), 3 = everything else (data quality, housekeeping, maintainability). Priority 1: IH-001 public reports, IH-005 global UI scripts, IH-006 global client scripts, IH-008 gs.sql, IH-014 global business rules, IH-017 tables without ACLs, IH-018 read ACLs with queries, IH-021 skipped upgrade items, IH-033 impersonation in production, IH-036 call stack logging, IH-057 unsecured scripted REST, IH-061 jobs longer than their interval, IH-063 cache flush. The column `Prio` holds the value per check (13 × 1, 31 × 2, 29 × 3); `tools/set-priorities.js` holds the same list with a short reason for each priority 1 and applies it to the code. This replaces the earlier rule "2 for security and upgrade risks, 3 for the rest"; the priorities named in the check sections below are from before. Deployed and verified on bithawkdemo1 the same day (13 / 31 / 29).

**Renumbering (2026-11-06, user request):** the visible numbers were made consecutive (no gaps for dropped checks). Only the names changed; `$id` keys (`ih-NNN-…`) and export names (`ihNNN…`) keep the original number, so the records kept their sys_ids, findings and suite links. Visible number → key number: IH-001 to IH-005 unchanged; IH-006 to IH-043 = key number + 1 (e.g. IH-006 = `ih-007-global-client-scripts`); IH-044 to IH-063 = + 2 (e.g. IH-044 = `ih-046-…`); IH-064 to IH-073 = + 3 (e.g. IH-073 = `ih-076-…`). Texts in this catalogue use the new numbers, also for decisions made before; git history and commit messages before 2026-11-06 use the old ones. Done with `tools/renumber-checks.js`. Deployed and verified on bithawkdemo1 the same day: 73 checks IH-001 to IH-073 without gaps, sys_ids unchanged (e.g. key `ih-001` still `1887f48f…`), suite still 73 checks; test data recreated with the new numbers (132 records).

| ID | Check | Area | Category | Type | Prio | Status |
|----|-------|------|----------|------|------|--------|
| IH-001 | Reports published to public | Administration | security | TableCheck | 1 | validated |
| IH-002 | Slow reports (> 5 s) | Performance | performance | TableCheck (advanced) | 2 | validated |
| IH-003 | Tables with > 10 custom client scripts | Maintenance | manageability | ScriptOnlyCheck | 3 | validated |
| IH-004 | Data collector jobs with errors or warnings | Maintenance | manageability | TableCheck (advanced) | 3 | validated |
| IH-005 | Global UI scripts | Performance | performance | TableCheck | 1 | validated |
| IH-006 | Global client scripts | Performance | performance | TableCheck | 1 | validated |
| IH-007 | Import set rows > 5 million | Maintenance | performance | ScriptOnlyCheck | 2 | built |
| IH-008 | Scripts using gs.sql | Maintenance | upgradability | ColumnTypeCheck | 1 | validated |
| IH-009 | Unnecessary dot-walk to sys_id | Performance | performance | ColumnTypeCheck | 3 | validated |
| IH-010 | Synchronous AJAX in client code | Performance | performance | ColumnTypeCheck | 2 | validated |
| IH-011 | Hard-coded instance URL | Maintenance | manageability | ColumnTypeCheck | 3 | validated |
| IH-012 | Hard-coded sys_ids in scripts | Maintenance | manageability | ColumnTypeCheck | 3 | validated |
| IH-013 | Before business rules that update or insert other records | Maintenance | manageability | TableCheck (advanced) | 2 | validated |
| IH-014 | Global business rules | Performance | performance | TableCheck (advanced) | 1 | validated |
| IH-015 | Script includes with duplicate names | Maintenance | manageability | ScriptOnlyCheck | 2 | validated |
| IH-016 | Transform map coalesces on non-indexed fields | Performance | performance | ScriptOnlyCheck | 2 | validated |
| IH-017 | Tables without ACLs | Administration | security | ScriptOnlyCheck | 1 | validated |
| IH-018 | Read ACLs with GlideRecord / GlideAggregate | Performance | performance | TableCheck (advanced) | 1 | validated |
| IH-019 | SLA engine runs synchronously | Performance | performance | ScriptOnlyCheck | 2 | built |
| IH-020 | Business rules with outbound REST/SOAP must be async | Performance | performance | TableCheck (advanced) | 2 | validated |
| IH-021 | Skipped items in the last upgrade | Maintenance | upgradability | ScriptOnlyCheck | 1 | validated |
| IH-022 | Default rows per page at most 50 | Performance | performance | TableCheck (advanced) | 2 | built |
| IH-023 | Long running (slow) scripts | Performance | performance | TableCheck (advanced) | 2 | validated |
| IH-024 | Differs from baseline: business rules | Maintenance | upgradability | ScriptOnlyCheck | 2 | validated |
| IH-025 | Differs from baseline: script includes | Maintenance | upgradability | ScriptOnlyCheck | 2 | validated |
| IH-026 | Differs from baseline: client scripts and UI scripts | Maintenance | upgradability | ScriptOnlyCheck | 2 | validated |
| IH-027 | Differs from baseline: UI macros and UI pages | Maintenance | upgradability | ScriptOnlyCheck | 2 | validated |
| IH-028 | Differs from baseline: UI actions | Maintenance | upgradability | ScriptOnlyCheck | 2 | validated |
| IH-029 | Virtual CIs with assets | Administration | manageability | ScriptOnlyCheck | 3 | validated |
| IH-030 | Computers and network gear without serial number | Administration | manageability | TableCheck | 3 | validated |
| IH-031 | Create Asset business rules active | Administration | manageability | ScriptOnlyCheck | 2 | built |
| IH-032 | CIs with an invalid discovery source | Administration | manageability | TableCheck (advanced) | 3 | validated |
| IH-033 | Impersonation in production | Administration | security | ScriptOnlyCheck | 1 | validated |
| IH-034 | Update sets with duplicate names | Maintenance | manageability | ScriptOnlyCheck | 3 | validated |
| IH-035 | Knowledge bases without retire workflow | Administration | manageability | TableCheck (advanced) | 3 | validated |
| IH-036 | Business rule call stack logging enabled | Performance | performance | TableCheck | 1 | built |
| IH-037 | Script includes that update current | Maintenance | manageability | ScriptOnlyCheck | 2 | validated |
| IH-038 | Business rules with complex script conditions | Maintenance | manageability | TableCheck (advanced) | 3 | validated |
| IH-039 | Inactive users in groups | Administration | security | TableCheck | 3 | validated |
| IH-040 | Groups with an inactive manager | Administration | manageability | TableCheck | 3 | validated |
| IH-041 | Groups without members | Administration | manageability | TableCheck (advanced) | 3 | validated |
| IH-042 | Roles assigned directly to users | Administration | security | TableCheck | 2 | validated |
| IH-043 | Groups with roles without a group type | Administration | security | TableCheck (advanced) | 3 | validated |
| IH-044 | Dictionary entries for tables that do not exist | Maintenance | manageability | ScriptOnlyCheck | 3 | validated |
| IH-045 | List layouts with duplicate positions | Maintenance | manageability | ScriptOnlyCheck | 3 | validated |
| IH-046 | Catalog tasks without requested item or request | Administration | manageability | TableCheck | 3 | validated |
| IH-047 | Active scheduled jobs run as a deleted user | Administration | manageability | TableCheck (advanced) | 2 | validated |
| IH-048 | Active scheduled jobs run as an inactive user | Administration | security | TableCheck (advanced) | 2 | validated |
| IH-049 | Active tasks opened by an inactive user | Administration | manageability | ScriptOnlyCheck | 3 | validated |
| IH-050 | System locale is valid | Administration | manageability | ScriptOnlyCheck | 2 | built |
| IH-051 | Single currency mode configured correctly | Administration | manageability | ScriptOnlyCheck | 2 | built |
| IH-052 | Resolved fields set by mark_resolved | Administration | manageability | ScriptOnlyCheck | 2 | validated |
| IH-053 | Closed fields set on problems | Administration | manageability | ScriptOnlyCheck | 2 | validated |
| IH-054 | Active tasks with a closed date | Administration | manageability | ScriptOnlyCheck | 3 | validated |
| IH-055 | Update sets without description | Maintenance | manageability | TableCheck | 3 | validated |
| IH-056 | Share of active CIs not discovered or updated for 60 days | Administration | manageability | ScriptOnlyCheck | 3 | built |
| IH-057 | Scripted REST resources without security | Administration | security | TableCheck (advanced) | 1 | validated |
| IH-058 | Property glide.security.ui.filter set to true | Administration | security | TableCheck | 2 | built |
| IH-059 | UI actions with complex conditions | Maintenance | manageability | TableCheck (advanced) | 3 | validated |
| IH-060 | Remote tables with 1000 rows or more | Performance | performance | TableCheck (advanced) | 3 | built |
| IH-061 | Scheduled jobs running longer than their interval | Performance | performance | ScriptOnlyCheck | 1 | built |
| IH-062 | Scheduled jobs with errors | Maintenance | manageability | TableCheck (advanced) | 2 | validated |
| IH-063 | Scripts that flush the cache | Performance | performance | ColumnTypeCheck | 1 | validated |
| IH-064 | Active user accounts without login | Administration | security | TableCheck (advanced) | 2 | validated |
| IH-065 | Slow list reports with group by | Performance | performance | TableCheck (advanced) | 2 | validated |
| IH-066 | Changed ServiceNow dictionary entries | Maintenance | upgradability | ScriptOnlyCheck | 2 | validated |
| IH-067 | Update set table not audited | Administration | security | ScriptOnlyCheck | 3 | built |
| IH-068 | ServiceNow CI classes with more than 10 custom fields | Maintenance | upgradability | ScriptOnlyCheck | 3 | built |
| IH-069 | current.update() in business rules | Maintenance | manageability | TableCheck (advanced) | 2 | validated |
| IH-070 | Share of unique location names | Administration | manageability | ScriptOnlyCheck | 3 | validated |
| IH-071 | Hardware, application and VM instance CIs without name | Administration | manageability | TableCheck | 3 | validated |
| IH-072 | Scheduled imports at the same time | Performance | performance | ScriptOnlyCheck | 3 | validated |
| IH-073 | UI actions with synchronous outbound calls | Performance | performance | TableCheck (advanced) | 2 | validated |

---

## IH-001 Reports published to public

- **Ideal:** No report is published to public.
- **Logic:** `sys_report` where `is_published=true` ✔. Each match is a finding.
- **Resolution:** Unpublish the report or restrict it with roles or groups. Public reports can be viewed without logging in.
- **Note:** The instance also has a `sys_report_public` table. Check whether it adds anything beyond `is_published`.

## IH-002 Slow reports

- **Ideal:** Reports load in under 5 s.
- **Logic:** `report_stats` where `recent_avg_execution_duration > 5000` and `recent_number_executions > 0` ✔. Reports that have not run recently are ignored. Unit is ms ✔ (largest run on bithawkdemo1: 210216 = 3.5 min). The finding details show the average in seconds.
- **Note:** `report_stats` also holds stats for Platform Analytics visualizations (`par_visualization`), so these are reported as well.
- **Link:** each finding links to the report itself: `report_table` holds the report's table (`sys_report` or `par_visualization`) and `report_sys_id` its sys_id ✔. If the report no longer exists, the finding falls back to the `report_stats` record (changed 2026-11-05 at user request).
- **Decision:** Recent average, recently run reports only (agreed 2026-11-05).
- **Resolution:** Add filters, indexes or a smaller date range; avoid dot-walked group-bys on large tables.

## IH-003 Tables with more than 10 custom client scripts

- **Ideal:** At most 10 custom client scripts per table.
- **Logic:** GlideAggregate on `sys_script_client`, grouped by `table`, filtered to active custom scripts. One finding per table with count > 10, showing the count in `finding_details`.
- **Custom:** a script not delivered by a ServiceNow plugin or store app (agreed 2026-11-05).
- **Detection (built 2026-11-05):** custom if `sys_package` is a customer scoped app (`sys_app`), or if `sys_package=global` and a customer update (`sys_update_xml`, application global) exists for the script. Plugins (`sys_plugins`), store apps (`sys_store_app`) and the base system package never count. Catalog client scripts (`catalog_script_client`) are excluded.
- **Known limits:** global rule not yet validated, because bithawkdemo1 has no global client scripts created by named users and `sys_metadata_customization` holds only one client script record. It counts customized ServiceNow scripts in global as custom, and misses global custom scripts whose update sets were deleted.
- **Decision:** Active scripts only; inactive scripts do not count (agreed 2026-11-05).
- **Resolution:** Consolidate client scripts, move logic to UI policies where possible, remove obsolete scripts.

## IH-004 Data collector jobs with errors or warnings

- **Ideal:** No PA data collector job ends with errors or warnings.
- **Logic:** `sysauto_pa` where `active=true`, in advanced mode: read the latest finished `pa_job_logs` record for the job (state not `collecting`) ✔ (`job`, `errors`, `warnings`, `completed`, `state`). Finding if `errors > 0`, `warnings > 0`, or state is `collected_error` / `collected_warning`. Only the latest run counts, so a job that has since been fixed is not reported.
- **Resolution:** Open the job log rows (`pa_job_log_rows`) and fix the failing indicators or breakdowns.

## IH-005 Global UI scripts

- **Ideal:** No global UI scripts.
- **Logic:** `sys_ui_script` where `global=true^active=true` ✔.
- **Resolution:** Load the script only where needed (on demand via `g_ui_scripts` / `ScriptLoader`) instead of on every page.

## IH-006 Global client scripts

- **Ideal:** No client scripts run on `global`.
- **Logic:** `sys_script_client` where `table=global^active=true`.
- **Resolution:** Move the logic to the specific table or into a UI script that is loaded on demand.

## IH-007 Import set rows over 5 million

- **Ideal:** Import set rows stay below 5 million.
- **Logic:** Count all rows in `sys_import_set_row` (all staging tables extend it). If the count is over 5,000,000, report the top 10 import runs (`sys_import_set`) by row count, one finding each with the count.
- **Decision:** The limit applies to all import set rows together (agreed 2026-11-05).
- **Resolution:** Check the Import Set Deleter / cleanup job and its retention period, and clean up the big runs.

## IH-008 Scripts using gs.sql

- **Ideal:** No script uses `gs.sql`.
- **Logic:** ColumnTypeCheck on all `script` columns: regex `\bgs\s*\.\s*sql\s*\(` after stripping comments, so commented-out calls are ignored. Changed from LinterCheck (2026-11-05): the documented AST API cannot reliably tell `gs.sql` apart from other `.sql()` calls.
- **Resolution:** Replace with GlideRecord / GlideAggregate. `gs.sql` is undocumented, bypasses ACLs and can lock tables.

---

## Batch 2: drafts received 2026-11-06

Drafts from the user, specified 2026-11-06.
Measured on bithawkdemo1 (2026-11-06): no OOB Instance Scan check covers these topics (402 checks reviewed; `sn_vsc` covers empty ACLs and client-callable script includes only).

**Common rules for the code checks (IH-009 to IH-015, IH-018):**
- **Decision:** custom records only, using the same rule as IH-003 (customer scoped app, or global with a customer update in `sys_update_xml`). ServiceNow code is not reported (agreed 2026-11-06).
- **Decision:** every regex-based check (IH-009 to IH-013, IH-018) lists each matching line as `line N: <code>` in `finding_details` (agreed 2026-11-06).
- Comments are stripped before matching (as IH-008). Each finding links to the script record.
- **Built 2026-11-06:** shared helper script include `x_bits2_inst_hlth.IHScanUtil` (`src/fluent/script-includes/ih-scan-util.now.ts`): `isCustom(gr)`, `checkScript()` for ColumnTypeChecks, `matchingLines()` / `reportLines()` (max. 20 lines of 200 characters, then "... and N more line(s)"). IH-003 uses it too. The Instance Health app itself never counts as custom. Regexes and line logic tested locally with positive and negative samples.
- **Verified 2026-11-06:** ColumnTypeCheck `columnType: 'script'` (the SDK only allows `script`, `xml`, `html`) also covers `script_plain` columns (script includes, client scripts, ACL and UI policy scripts): existing findings of OOB `script` checks come from `sys_script_include`. The app scope can read `sys_update_xml`, `sys_security_acl`, `sys_db_object`, `sys_script*`.

## IH-009 Unnecessary dot-walk to sys_id

- **Ideal:** Reference values are read with `getValue('field')` or `field.toString()`, not `field.sys_id`.
- **Logic:** ColumnTypeCheck on `script` columns, regex for `<identifier>.<field>.sys_id` (e.g. `current.caller_id.sys_id`, `gr.assigned_to.sys_id`). Not a finding: `current.sys_id`, `gr.sys_id` (no dot-walk). Each matching line goes into `finding_details`.
- **Heuristic (built):** skipped to avoid false positives: `this.x.sys_id` and `<var>.<name>.sys_id` where `<name>` is `data`, `options`, `input`, `params`, `body`, `request`, `response`, `result`, `answer` (widget and helper objects, not reference fields).
- **Resolution:** Use `gr.getValue('field')` (or `gr.field + ''`); the reference field already holds the sys_id.

## IH-010 Synchronous AJAX in client code

- **Ideal:** Client code uses asynchronous calls only.
- **Logic:** Client script columns (`sys_script_client`, `catalog_script_client`, client UI actions, UI policy scripts). Patterns: `getXMLWait(`, `g_form.getReference(<field>)` without callback, client `GlideRecord.query()` without callback, `async: false` / `async:false`.
- **Measured:** 294 active client scripts match a raw LIKE on these patterns, mostly OOB; plain matching is not enough for `getReference` (async with callback).
- **Built:** client columns only: `sys_script_client` / `catalog_script_client.script`, `sys_ui_policy` / `catalog_ui_policy.script_true|script_false`, `sys_ui_script.script`, `sys_ui_page.client_script`, `sp_widget.client_script`, `sys_ui_action.script` when `client=true`. Regex: `getXMLWait(`, `.getReference(<one argument>)`, `.query()` without argument, `async: false`.
- **Resolution:** Use `getXMLAnswer` / `getXML` with a callback, `getReference(field, callback)`, or a GlideAjax call.

## IH-011 Hard-coded instance URL

- **Ideal:** No script contains an instance URL; use `gs.getProperty('glide.servlet.uri')`.
- **Logic:** ColumnTypeCheck on `script` columns, regex `https?://[a-z0-9-]+\.(service-now|servicenowservices)\.com`, case-insensitive (any instance, also other ones, e.g. a dev URL in production code). URLs in comments are ignored.
- **Resolution:** Build URLs from `glide.servlet.uri` or `instance_name`; hard-coded URLs break after clones.

## IH-012 Hard-coded sys_ids in scripts

- **Ideal:** No script contains a literal sys_id.
- **Logic:** ColumnTypeCheck on `script` columns, regex for a quoted 32-character hex string `['"][0-9a-f]{32}['"]`.
- **Resolution:** Use a system property, a lookup by a stable key (name, number) or a reference in configuration.

## IH-013 Before business rules that update or insert other records

- **Ideal:** Before business rules only change `current`; changes to other records happen in after or async rules.
- **Logic:** `sys_script` where `when=before^active=true^scriptLIKEupdate^ORscriptLIKEinsert`, then every line with `.update(` or `.insert(` after stripping comments. `current.update()` is reported too (it is worse in a before rule). `updateMultiple()` is not reported.
- **Measured:** 269 active before rules contain `.update(` or `.insert(`, mostly OOB.
- **Resolution:** Move the logic to an after or async business rule.

## IH-014 Global business rules

- **Ideal:** No business rule runs on table `global`.
- **Logic:** `sys_script` where `collection=global^active=true`.
- **Measured:** 94 active rules on global, all from plugins or the base system, none custom.
- **Resolution:** Move functions to script includes; global rules are loaded on every transaction.

## IH-015 Script includes with duplicate names

- **Ideal:** Each script include name is unique within its scope.
- **Logic:** GlideAggregate on `sys_script_include` grouped by `api_name`, count > 1, empty `api_name` ignored (337 old script includes on bithawkdemo1 have none). One finding per script include in a duplicate group; `finding_details` names the API name, group size, package and active state.
- **Measured:** 113 names occur more than once, but almost all in different scopes (legal: `x_a.Util` and `x_b.Util` are distinct). Same scope: 6 names; duplicate `api_name`: 8. All OOB.
- **Decision:** only duplicates within the same scope (same `api_name`) count; a group is reported if at least one member is custom (agreed 2026-11-06).
- **Resolution:** Rename or remove one; with duplicate names it is undefined which class is loaded.

## IH-016 Transform map coalesces on non-indexed fields

- **Ideal:** Every active transform map coalesces on at least one indexed field.
- **Logic (built 2026-11-06, option 1 "reduced check"):** TableCheck on `sys_transform_map` where `active=true` ✔. For each coalesce entry (`sys_transform_entry`, `coalesce=true` ✔): find the table that defines the field (`sys_dictionary`, up the `super_class` chain), then the first table from there upwards with physical indexes in `v_db_index` ✔ (`table_name`, `column_names` like `[name;sys_id]`). Field is indexed if it is the first column of an index; `sys_id` always is. If that table is not the defining table, the field is stored under an unknown physical column name and counts as unknown (e.g. `cmdb_ci_computer.serial_number` stored in `cmdb`). The map is a finding only if no coalesce field is indexed and none is unknown (no finding when unsure). One finding per map, linked to the transform map, listing the unindexed fields.
- **Changed from per field to per map (2026-11-06):** the coalesce lookup uses all coalesce fields together, so one indexed field is enough. Per field, maps like the `sys_choice` translation map were reported for `element`, `value`, `dependent_value` although `name` is indexed.
- **Option 2 rejected (2026-11-06):** a cross-scope privilege for `sys_storage_alias` cannot work: the table has "Can read" from other scopes switched off (`read_access=0`), which a privilege cannot override; access tracking created no privilege record for it, unlike for all other tables the app reads. Agreed fallback: option 1.
- **Prototype on bithawkdemo1 (2026-11-06):** 37 maps with coalesce: 30 covered, 6 findings (HR Profile, HR Job Profile, Notification → `incident.correlation_id`, Rate Model Line, HR Location, HR Department), 1 unknown (Computer → CMDB).
- **Measured:** 70 coalesce entries.
- **Was on hold (2026-11-06): no reliable index source from the app scope.** `sys_index` holds only the 37 custom-created indexes (0 for `task`, `incident`, `sys_user`), so every OOB field would be reported. `v_db_index` (query by `table_name`) lists all physical indexes, but with physical column names: fields of extended tables are stored as `a_ref_N` / `a_str_N` in the base table (`task`), and the mapping `sys_storage_alias` (222,212 rows in global) returns no rows from the app scope. CMDB tables return no indexes at all (partitioned storage). Options to discuss: a global helper outside the app, a cross-scope privilege for `sys_storage_alias`, or a reduced check (only fields stored under their own name, CMDB excluded).
- **Resolution:** Add an index on the coalesce field(s), or a composite index for multiple coalesce fields.

## IH-017 Tables without ACLs

- **Ideal:** Every table is secured by ACLs, its own or inherited from a parent table.
- **Logic:** All tables in `sys_db_object`. Finding if no active record ACL (`sys_security_acl`, `type=record`) has `name` = the table or `<table>.<field>`, on the table itself or on any parent table (`super_class` chain). Table rotation shards (name ends in 4 digits, e.g. `syslog0001`) are excluded. Wildcard `*` ACLs do not count. Link to the `sys_db_object` record.
- **Decision:** all tables, not only custom ones; inherited ACLs count as protection (agreed 2026-11-06).
- **Measured:** 10,010 tables; 2,358 without own ACL; 167 without own or inherited ACL after excluding 520 rotation shards (3 custom), e.g. `cmn_building`, `sys_phone_territory`, `x_bits2_quackology_family`.
- **Resolution:** Create table ACLs (at least read, write, create, delete) for the required roles.

## IH-018 Read ACLs with GlideRecord / GlideAggregate

- **Ideal:** Read ACL scripts do not query the database; they run for every record and field.
- **Logic:** `sys_security_acl` where `operation=read^active=true^advanced=true` ✔, script contains `GlideRecord` or `GlideAggregate` (after stripping comments).
- **Measured:** 174 active read ACLs match, mostly OOB.
- **Built:** conditions `operation.name=read^active=true^advanced=true^scriptLIKEGlide`, then every line with `new GlideRecord(`, `new GlideRecordSecure(` or `new GlideAggregate(` (GlideRecordSecure added: it queries as well). Queries hidden in called script includes are not detected.
- **Resolution:** Use conditions or roles, cache results, or move the logic into a role or a scratchpad value.

---

## Batch 3: drafts received 2026-11-06

Drafts from the user ("outcome: list of findings"), specified 2026-11-06. IH-020 follows the batch 2 code check rules (custom only, matching lines listed).

**Built and deployed 2026-11-06** (IH-021 after the user's decision, see there). Dry run in the app scope with the built scripts and a stub engine (no findings written) on bithawkdemo1: IH-019 0, IH-020 0, IH-022 0, IH-023 20, IH-024 26, IH-025 to IH-028 0, IH-029 0, IH-030 104 (95 computers + 9 network gear). All 26 IH-024 records also have a customer update in `sys_update_xml`, which confirms the `sys_metadata_customization` list. The baseline checks use the helper method `IHScanUtil.reportBaselineChanges()`. Test data: synthetic `sys_script_pattern` rows (IH-023), customization rows with `author_type=ServiceNow` for test records (IH-024 to IH-028), test computers and one asset (IH-029, IH-030).
Measured on bithawkdemo1 (2026-11-06): no OOB Instance Scan check covers these topics.

## IH-019 SLA engine runs synchronously

- **Ideal:** SLAs are processed synchronously (SLA engine 2011, business rule "Run SLAs"), not by the async "Process SLAs" rule.
- **Logic:** property `com.snc.sla.engine.version` ✔ decides which task rule runs: "Process SLAs" (async, condition `== '2010'`, also the default when the property is missing) or "Run SLAs" (after, condition `== '2011'`) ✔. Finding if the value is not `2011`; link to the `sys_properties` record, or to the "Process SLAs" business rule if the property does not exist.
- **Measured:** bithawkdemo1 has `2011`, so no finding. No test data: changing the property would switch the SLA engine of the demo instance.
- **Resolution:** Set `com.snc.sla.engine.version` to `2011` after checking custom SLA logic that relies on the async engine.

## IH-020 Business rules with outbound REST/SOAP must be async

- **Ideal:** Business rules that call external systems run async, so the user does not wait for the remote system.
- **Logic:** `sys_script` where `active=true` and `when` is not `async` / `async_always` ✔ (values on the instance: before, after, before_display, display, async, async_always, ...), script contains `RESTMessageV2`, `SOAPMessageV2`, `RESTMessage(`, `SOAPMessage(` or `GlideHTTPRequest` (after stripping comments). Lines listed as in batch 2.
- **Measured:** 1 active non-async rule uses RESTMessageV2/SOAPMessageV2.
- **Resolution:** Change the rule to async, or move the call to an event / script action or a flow.

## IH-021 Skipped items in the last upgrade

- **Ideal:** Every item skipped in the last platform upgrade has been reviewed.
- **Logic:** latest `sys_upgrade_history` record with `to_version` starting with `glide-` ✔ (app installs also create history records). Its `sys_upgrade_history_log` rows ✔ with `disposition` 4 (Skipped), 9 (Skipped Error) or 10 (Skipped Manual Merge) ✔ and `resolution_status` empty or `not_reviewed` ✔. Link to the log row (it shows the diff and the merge options).
- **Measured:** last upgrade 2026-10-31 (patch 5aw44): 311 skipped, 2 skipped with error, none reviewed.
- **Decision:** one finding per unreviewed item (agreed 2026-11-06).
- **Blocked (2026-11-06):** `sys_upgrade_history_log` has "Can read" from other scopes switched off (`read_access=0`, as `sys_storage_alias` for IH-016); the app scope gets no rows, so per-item findings are not possible. `sys_upgrade_history` is readable and holds summary counts per upgrade ✔: `skipped`, `skipped_and_different`, `skipped_and_not_different`, `skipped_error`, `skipped_manual_merge`, `changes_skipped`. Last upgrade on bithawkdemo1: skipped 311, of which **311 not different** (the customized record already matches the new version, no review needed) and 0 different; skipped_error 2; skipped_manual_merge 0. Proposal: one finding per upgrade (latest platform upgrade) when `skipped_and_different + skipped_error + skipped_manual_merge > 0`, linked to the upgrade history record, counts in the details.
- **Decision (2026-11-06):** one summary finding as proposed, replacing "one finding per item". Skipped items that already match the new version are only mentioned in the details. Built and deployed the same day; dry run on bithawkdemo1: 1 finding (2 skipped with error).
- **Resolution:** Review each skipped item in the upgrade history: revert to the base system, merge, or keep the customization and mark it reviewed.

## IH-022 Default rows per page at most 50

- **Ideal:** The system default for rows per page (`sys_user_preference` `rowcount`, `system=true`, no user) is 50 or less.
- **Logic:** `sys_user_preference` where `name=rowcount^system=true^userISEMPTY` ✔, advanced: finding if `parseInt(value) > 50`.
- **Measured:** value 20, no finding.
- **Resolution:** Set the system preference `rowcount` to 50 or less; large pages slow down every list.

## IH-023 Long running (slow) scripts

- **Ideal:** No script runs longer than the threshold on average.
- **Logic:** `sys_script_pattern` ✔ (Slow Scripts: `average` in ms, `count`, `last`, `label`, `script_source_table`, `script_source`) where `average > threshold` and `last` within the period. Link to the script record (`script_source_table` + `script_source`), falling back to the pattern record (as IH-002).
- **Measured:** average > 5 s: 49 overall, 20 seen in the last 30 days; > 10 s: 26 / 15. Mostly OOB: script actions 18, scripted REST 11, scheduled jobs 4, script includes 3, our own scan checks 3.
- **Decision:** average > 5 s, last seen within 30 days, all scripts including ServiceNow code (agreed 2026-11-06).
- **Resolution:** Optimize the script (queries, loops, indexes) or move it to an async context.

## IH-024 to IH-028 Differs from baseline

- **Ideal:** ServiceNow records are not modified; customizations are made by copying or extending.
- **Logic:** `sys_metadata_customization` ✔ (`sys_metadata`, `author_type`) is the platform's own list of customized records. `author_type=ServiceNow` ✔ means a ServiceNow record that was changed (values: ServiceNow 1123, Custom 540, ToBeDetermined 308, Unknown 11). One finding per changed record, linked to it. Split by `sys_metadata.sys_class_name`:
  - IH-024 `sys_script`, IH-025 `sys_script_include`, IH-026 `sys_script_client` + `sys_ui_script`, IH-027 `sys_ui_macro` + `sys_ui_page`, IH-028 `sys_ui_action`.
- **Measured (all author types):** sys_script 33, sys_script_include 16, sys_script_client 27, sys_ui_script 2, sys_ui_macro 0, sys_ui_page 0, sys_ui_action 0.
- **Note:** this table could also improve the IH-003 "custom" rule (known limit: customized ServiceNow scripts in global count as custom).
- **Observed (2026-11-06):** the platform creates a row for every new record and deletes it with the record. For new code records (business rules, script includes, client scripts, UI pages, UI actions) `author_type` is `Custom`, as expected. New reports (`sys_report`) got `ServiceNow` although the customer created them, so `author_type` is not reliable for every table; the baseline checks only use code tables.
- **Resolution:** Revert to the base system where possible, or document why the change is needed; changed records are skipped in upgrades.

## IH-029 Virtual CIs with assets

- **Ideal:** CIs flagged as virtual do not have an asset.
- **Logic:** the `virtual` flag is not on `cmdb_ci`, but on about 200 classes (e.g. `cmdb_ci_computer`, `cmdb_ci_netgear`, `cmdb_ci_ot`, `cmdb_ci_nic`) ✔. ScriptOnlyCheck: find the top-most tables that define `virtual` (`sys_dictionary`), query each for `virtual=true^assetISNOTEMPTY`. Link to the CI.
- **Measured:** 0 virtual CIs on bithawkdemo1.
- **Resolution:** Remove the asset (retire or delete it) and check the model category, so virtual CIs do not create assets.

## IH-030 Computers and network gear without serial number

- **Ideal:** Every computer and network gear CI (all subclasses, discovered or not) has a serial number.
- **Logic:** TableCheck on `cmdb_ci_hardware` with `sys_class_nameINSTANCEOFcmdb_ci_computer^ORsys_class_nameINSTANCEOFcmdb_ci_netgear^serial_numberISEMPTY^install_status!=7`. Link to the CI.
- **Measured:** computers 107 of 855 without serial (95 not retired), network gear 9 of 9.
- **Decision:** retired CIs (`install_status=7`) are excluded (agreed 2026-11-06).
- **Resolution:** Populate the serial number (Discovery, import or manually); it is the main identification attribute for hardware.

---

## Batch 4: drafts received 2026-11-06

Drafts from the user ("same setup as the previous checks": catalogue first, custom-only for code checks with matching lines, link to the record to act on, test data, dry run before deploy), specified 2026-11-06. IH-031, IH-033 to IH-037 and IH-039 to IH-041 follow the proposals below without an explicit decision; the user can still change them.

**Built and deployed 2026-11-06.** Dry run in the app scope (built scripts, stub engine, no findings written) on bithawkdemo1, without test data: IH-031 0, IH-032 0, IH-033 1, IH-034 9, IH-035 7, IH-036 0, IH-037 1, IH-038 0, IH-039 2, IH-040 0, IH-041 30, IH-042 256 (after the fix, see there), IH-043 18. With test data every positive case is found once and no negative one. Test data: test users `ih.test.active` (locked out) and `ih.test.inactive`, test groups, memberships, a direct role (`personalize_choices`), knowledge bases, update sets, computers with discovery sources, and business rules / script includes for IH-037 and IH-038. No test data for IH-031, IH-033, IH-036 (instance-wide settings).
Overlap with OOB checks (bithawkdemo1, 2026-11-06): `sn_access_analyzer` "Users with Direct Role Assignments (Bypassing Groups)" (active) covers IH-042; `sn_vsc` "Restrict Impersonation to Admin" and "Log User Impersonation" cover other impersonation aspects than IH-033.

## IH-031 Create Asset business rules active

- **Ideal:** The Asset Management rules that create assets for CIs are active.
- **Logic:** `sys_script` on `cmdb_ci` named "Create Asset on insert" and "Create asset on model change" ✔ (both before, package Asset Management). One finding per rule that is inactive, linked to the rule. No finding if Asset Management is not installed (rules missing).
- **Measured:** both active.
- **Resolution:** Activate the rule; without it, new CIs get no asset and asset and CMDB data drift apart.

## IH-032 CIs with an invalid discovery source

- **Ideal:** Every discovery source set on a CI is a value from the `discovery_source` choice list.
- **Logic:** `cmdb_ci` where `discovery_source` is not empty and not an active choice (`sys_choice` `cmdb_ci.discovery_source`, 42 values ✔). Retired CIs excluded (as IH-030). One finding per CI, linked to the CI.
- **Decision:** CIs without a discovery source are not a finding (user, 2026-11-06).
- **Measured:** 2,823 CIs empty (not reported), all non-empty values valid (ServiceNow 319, Other Automated 50, AutoDev 1, ServiceWatch 1), so no finding.
- **Rename:** title changed to "CIs with an invalid discovery source".
- **Resolution:** Set the discovery source in every import, integration and manual process (e.g. `ImportSet`, `Manual Entry`); it tells which source owns the CI.

## IH-033 Impersonation in production

- **Ideal:** Impersonation is switched off on production instances.
- **Logic:** if `glide.installation.production` ✔ is `true` and `glide.ui.impersonate_button.enable` ✔ is not `false`: finding linked to the property `glide.ui.impersonate_button.enable`. Details list the users with the `impersonator` role.
- **Measured:** bithawkdemo1 is flagged production (`glide.installation.production=true`), impersonate button enabled, 2 `impersonator` role entries (Nextwave Service User, one inherited).
- **Note:** the property hides the impersonate button; admins can still impersonate by other means. The role holders are the second lever.
- **Resolution:** Set `glide.ui.impersonate_button.enable` to `false` on production and remove the `impersonator` role where it is not needed.

## IH-034 Update sets with duplicate names

- **Ideal:** Every update set has a unique name.
- **Logic:** GlideAggregate on `sys_update_set` grouped by `name`, count > 1, name `Default` excluded (every application has one). One finding per update set in a duplicate group, linked to the update set.
- **Measured:** 30 update sets (without Default), 2 duplicate names: "Checkpoint" ×7 (complete, app `x_bits2_quackology`, created by a user), "System Administrator" ×2 (in progress, global and `x_bits2_pcp_demo`).
- **Resolution:** Rename the update sets with a unique, meaningful name (e.g. story number and short title).

## IH-035 Knowledge bases without retire workflow

- **Ideal:** Every active knowledge base has a retire workflow.
- **Logic:** `kb_knowledge_base` where `active=true` ✔, advanced: finding if `retire_workflow` is empty or references a `wf_workflow` record that does not exist. (No flow fields on this instance: `retire_flow` does not exist.)
- **Measured:** 7 of 7 active knowledge bases: 1 empty, 6 reference a deleted workflow (`3d18ef12…` 5×, `3bf3fb92…` 1×; the display value is empty, the record is missing in `wf_workflow`).
- **Changed while building (2026-11-06):** the condition-only version (`retire_workflowISEMPTY`) found only 1; broken references are reported as well, with the reason in the details.
- **Resolution:** Assign a retire workflow (e.g. "Knowledge - Instant Retire" or an approval workflow).

## IH-036 Business rule call stack logging enabled

- **Ideal:** `glide.businessrule.callstack` is `false` (default when not set).
- **Logic:** `sys_properties` where `name=glide.businessrule.callstack^value=true`.
- **Measured:** property not set, no finding.
- **Resolution:** Set the property to `false` (or delete it); call stack logging is for debugging only and slows down every transaction.

## IH-037 Script includes that update current

- **Ideal:** Business rules do not update `current` indirectly through a script include (this escapes the `current.update()` check IH-013).
- **Logic (heuristic):** custom active business rules whose script passes `current` to a script include (`new X(...current...)`, `new X().m(...current...)`, `X.m(...current...)`). The script include `X` is looked up by name; finding if its script calls `.update(` on one of its function parameters (`function(a, b) { ... a.update() ... }`). Finding on the business rule, details: BR line and script include name. Custom only, lines listed.
- **Limits:** misses updates through `this.<field>.update()` and nested calls.
- **Built:** heuristic in `IHScanUtil.findIndirectCurrentUpdates()`, tested locally with stubbed script includes (positive: `new X().m(current)`, `X.m(current)`, `new global.X().m(current)`; negative: include updates another record, `current.field` passed, commented code, unknown include).
- **Real hit on bithawkdemo1:** async rule "AMAG - Vehicle Registration - Create CI" on `sc_req_item` passes `current` to `c_VehicleRegistration.registerFromRequestItem()`, which updates its parameter.
- **Resolution:** Set values on `current` in the business rule (before rule) instead of calling `update()` in the script include, or pass a copy.

## IH-038 Business rules with complex script conditions

- **Ideal:** Business rule conditions are short expressions; logic belongs in the script.
- **Logic:** custom active `sys_script` with a non-empty `condition` that is complex. Proposed: longer than 200 characters, or contains a query (`GlideRecord` / `GlideAggregate`), a statement separator `;` or a `function`.
- **Measured:** 6 custom conditions on bithawkdemo1, none complex (all business rules: 2,527 with condition, 66 longer than 200, 7 with GlideRecord, 114 with `;`).
- **Decision:** complex = longer than 200 characters, or contains `GlideRecord` / `GlideAggregate`, `;` or `function` (agreed 2026-11-06).
- **Resolution:** Use the condition builder or a short expression; move complex logic into the script or a script include.

## IH-039 Inactive users in groups

- **Ideal:** Active groups have no inactive members.
- **Logic:** `sys_user_grmember` where `user.active=false^group.active=true`. One finding per membership, linked to the membership record.
- **Measured:** 2.
- **Resolution:** Remove the membership; inactive members distort assignment and approval lists.

## IH-040 Groups with an inactive manager

- **Ideal:** Every active group has an active manager.
- **Logic:** `sys_user_group` where `active=true^manager.active=false`. Link to the group.
- **Measured:** 0.
- **Resolution:** Assign an active manager.

## IH-041 Groups without members

- **Ideal:** Every active group has at least one member.
- **Logic:** `sys_user_group` where `active=true`, advanced: finding if no `sys_user_grmember` exists for the group.
- **Measured:** 30 of 79 active groups.
- **Resolution:** Add members or deactivate the group.

## IH-042 Roles assigned directly to users

- **Ideal:** Users get roles only through groups.
- **Logic:** `sys_user_has_role` where `inherited=false^user.active=true`, excluding `snc_internal` / `snc_external` (assigned by the platform to every user). Link to the role assignment.
- **Measured (corrected 2026-11-06):** 257 direct assignments on active users (e.g. `itil` 37, `sn_hr_core.hrsm_employee` 27, `admin` 22, `security_admin` 2). The first measurement ("646, all `snc_internal`, 0 after the exclusion") was wrong: `granted_by` defaults to `not-applicable`, so `granted_byISEMPTY` only matched the platform's own `snc_internal` assignments. Found by the test data dry run (the test user's direct role was missing), fixed and redeployed the same day.
- **Decision:** build it although the OOB Access Analyzer check covers the topic, so all health checks are in one place (agreed 2026-11-06).
- **Resolution:** Remove the direct role and add the user to a group that has the role.

## IH-043 Groups with roles without a group type

- **Ideal:** Groups that grant roles have a group type (e.g. "Authorization"), so role-granting groups are recognizable.
- **Logic:** active groups with at least one `sys_group_has_role` record and an empty `type`. Link to the group.
- **Decision:** any group type is enough; no specific type name is required (agreed 2026-11-06). Title changed to "Groups with roles without a group type".
- **Measured:** 30 active groups with roles: 12 have some type, 18 none. Existing types: Agile Team, itil, survey, Knowledge, catalog, human_resources, schedule_visible_externally, schedule_visible_internally, hr_vendors; no "Authorization" type.
- **Resolution:** Create the group type and set it on all role-granting groups; groups for assignment only should not hold roles.

---

## Batch 5: drafts received 2026-11-06

Drafts from the user ("same procedure as before"), specified 2026-11-06.

**Built and deployed 2026-11-06.** Test data refreshed (115 records, no warnings); the dry run against it finds every positive case once and no negative one. Test incidents and problems are inserted without business rules but data policies still apply: a resolved incident needs a resolution code and close notes, a closed problem needs Assigned to, Resolution code and Close notes. Dry run in the app scope (built scripts, stub engine, no findings written) on bithawkdemo1, with the batch 1 to 4 test data present: IH-044 3, IH-045 2, IH-046 0, IH-047 4, IH-048 0, IH-049 0, IH-050 0, IH-051 0, IH-052 0, IH-053 5, IH-054 15, IH-055 15 (including the 2 IH-034 test update sets), IH-056 0, IH-057 0. Shared helper `IHScanUtil.resolveRunAs()` for IH-047 and IH-048. Test data: list layout in view `ih_test`, on-demand jobs, plain tasks, an incident and a problem inserted without business rules, and a test REST API (authentication required). IH-044 to IH-046, IH-048 to IH-055 follow the proposals below without an explicit decision; the user can still change them. "Priority 1 items skipped in the last upgrade" was dropped.
Overlap with OOB checks (bithawkdemo1, 2026-11-06): `sn_vsc` "Review Public REST API Endpoints" (active) is close to IH-057; `sn_vsc` "Scheduled reports being emailed to external user run as inactive user" (inactive) is narrower than IH-048.

## Dropped: Priority 1 items skipped in the last upgrade

- **Ideal:** No priority 1 item was skipped in the last upgrade.
- **Blocked:** the priority is only in `sys_upgrade_history_log.type_priority` ✔, which the app scope cannot read (`read_access=0`, see IH-021). The summary record `sys_upgrade_history` has no counts per priority.
- **Measured (from global):** last upgrade skipped items by priority: 0 with priority 1, 136 with 2, 1 with 3, 173 with 5, 3 without priority.
- **Decision: dropped (2026-11-06).** IH-021 already reports skipped items that need a review. Has no number since the renumbering.

## IH-044 Dictionary entries for tables that do not exist

- **Ideal:** Every dictionary entry belongs to an existing table.
- **Logic:** `sys_dictionary` rows of class `sys_dictionary` only (subclasses such as flow and ATF variables use `name` for other purposes ✔) whose `name` is not in `sys_db_object`. Excluded: internal storage of list fields, named `<table><field>` with the elements `sys_id`, `parent_id`, `value`, `sequence` (e.g. `kb_knowledgeroles`). One finding per missing table name, linked to its first dictionary entry; details list the elements.
- **Measured:** 119 names without table; 116 are list field storage. Built (2026-11-06): 3 findings (`sa_performance_config`, `sn_cmp_rb_dc_capablity`, `sn_itsm_gen_ai_overdue_incident_sla`). No test data needed.
- **Resolution:** Delete the orphaned dictionary entries (or recreate the table if it was deleted by mistake).

## IH-045 List layouts with duplicate positions

- **Ideal:** Every element of a list layout has its own position.
- **Logic:** GlideAggregate on `sys_ui_list_element` ✔ grouped by `list_id` and `position`, count > 1, elements without a position ignored. One finding per list layout (`sys_ui_list`), details list the positions and elements.
- **Measured:** 6 list layouts in the first count; 4 of them only have empty rows (no element, no position, e.g. `dscy_router_interface` view "Switch with routing"), which is a broken layout but not a shared position. Built without them (2026-11-06): 2 findings (`sn_udc_developer_session_watch` and `sys_user_has_skill`, both with two elements at position 0).
- **Resolution:** Open the list layout and save it again (or fix the positions), so the column order is defined.

## IH-046 Catalog tasks without requested item or request

- **Ideal:** Every catalog task is linked to a requested item and a request.
- **Logic:** `sc_task` where `request_itemISEMPTY^ORrequestISEMPTY`.
- **Measured:** 0 of 9.
- **Resolution:** Link the task to its requested item; catalog tasks should only be created by the catalog fulfillment process.

## IH-047 Active scheduled jobs run as a deleted user

- **Ideal:** Every active scheduled job runs as an existing user.
- **Logic:** `sysauto` ✔ (all job types) where `active=true^run_asISNOTEMPTY`. `run_as` is a reference to `sys_user`, but holds user names on some jobs ✔ (`admin`, `gaf-svc-account`). Resolve by sys_id, then by `user_name`; `system` and `maint` are internal platform users and skipped. Finding if no user is found; linked to the job.
- **Measured:** 795 active jobs with `run_as`; 4 point to users that do not exist (`now.discovery_infra`, `syed.azam@snc`, `Tal.Kapon@snc`, `yair.leibkowiz@snc`), all ServiceNow jobs.
- **Decision:** all jobs, including ServiceNow ones (agreed 2026-11-06).
- **Resolution:** Set `run_as` to an existing (service) user.

## IH-048 Active scheduled jobs run as an inactive user

- **Ideal:** No active scheduled job runs as an inactive user.
- **Logic:** as IH-047, finding if the resolved user is inactive.
- **Measured:** 0.
- **Resolution:** Set `run_as` to an active service user.

## IH-049 Active tasks opened by an inactive user

- **Ideal:** Active tasks are not opened by inactive users.
- **Logic:** `task` where `active=true^opened_by.active=false`. Link to the task.
- **Measured:** 0 of 13,084 active tasks.
- **Resolution:** Check whether the task is still needed; follow-up questions go to the caller, not the inactive user.

## IH-050 System locale is valid

- **Ideal:** `glide.system.locale` is empty (default) or a valid locale.
- **Logic:** property value ✔ (record exists, value empty on bithawkdemo1). Finding if the value is set and not `<language>` or `<language>.<COUNTRY>` / `<language>_<COUNTRY>` with an ISO 639 language and an ISO 3166 country (`core_country` ✔, 232 rows). Java's own locale list cannot be read from a scoped script, so the check approximates it with the ISO codes.
- **Measured:** empty, no finding.
- **Resolution:** Set a valid locale such as `de.CH` or clear the property.

## IH-051 Single currency mode configured correctly

- **Ideal:** Single currency mode is either off, or on with an active currency code.
- **Logic:** `glide.i18n.single_currency` ✔ and `glide.i18n.single_currency.code` ✔. Finding if single currency is `true` and the code is empty or not an active `fx_currency` ✔; also if it is `false` while only one currency is active (single currency mode should be used).
- **Measured:** `false`, code USD, 5 active currencies (CHF, EUR, GBP, JPY, USD): no finding.
- **Resolution:** Set the code to an active currency, or switch single currency mode on when only one currency is used.

## IH-052 Resolved fields set by mark_resolved

- **Ideal:** The business rule `mark_resolved` on incident is active, so resolved incidents get "Resolved" and "Resolved by".
- **Logic:** finding if `mark_resolved` ✔ on `incident` is missing or inactive (linked to the rule), and one finding per resolved or closed incident (`stateIN6,7`) without `resolved_at` or `resolved_by`.
- **Measured:** rule active and unchanged; 0 of 3,406 resolved/closed incidents without the fields.
- **Resolution:** Activate the rule (revert customizations), then fill the fields for affected incidents.

## IH-053 Closed fields set on problems

- **Ideal:** Closed problems have "Closed" and "Closed by".
- **Logic:** there is no `mark_closed` rule on problem in this release ✔ (only on incident and change_request); "Update fields on Problem Closure" ✔ sets the fields. Finding if that rule is missing or inactive, and one finding per closed problem (`state=107`) without `closed_at` or `closed_by`.
- **Measured:** rule active; 5 of 7 closed problems without `closed_by` (1 also without `closed_at`), all demo data from March 2026.
- **Resolution:** Activate the rule and fill the fields for affected problems.

## IH-054 Active tasks with a closed date

- **Ideal:** Active tasks have no closed date.
- **Logic:** `task` where `active=true^closed_atISNOTEMPTY`. Link to the task.
- **Measured:** 15 (incident 8, change_request 4, HR cases 3).
- **Resolution:** Check the task state; reopened tasks should clear the closed date.

## IH-055 Update sets without description

- **Ideal:** Every update set has a description.
- **Logic:** `sys_update_set` where `descriptionISEMPTY^name!=Default`.
- **Measured:** 15 of 33.
- **Resolution:** Describe the content and purpose (e.g. story number and summary).

## IH-056 Share of active CIs not discovered or updated for 60 days

- **Ideal:** The share of active CIs that were neither discovered nor updated for 60 days stays below a threshold.
- **Logic:** active CIs = `cmdb_ci` where `install_status!=7^operational_status!=6`. Stale = (`last_discovered` empty or older than 60 days) and `sys_updated_on` older than 60 days. One summary finding linked to the `cmdb_ci` table when the share is over the threshold; details show count, total and share.
- **Measured:** 15 of 3,041 active CIs (0.5 %); 2,743 were never discovered but recently updated.
- **Decision:** threshold 5 % (agreed 2026-11-06).
- **Resolution:** Retire CIs that no longer exist, and bring the rest under Discovery or a regular import.

## IH-057 Scripted REST resources without security

- **Ideal:** Every active scripted REST resource requires authentication and ACL authorization.
- **Logic:** `sys_ws_operation` ✔ where `active=true^requires_authentication=false^ORrequires_acl_authorization=false`. Link to the resource, details name the missing setting.
- **Measured:** 2,538 active resources: 60 without authentication, 203 without ACL authorization, all ServiceNow; 0 custom.
- **Decision:** custom resources only (same rule as the code checks); ServiceNow endpoints are covered by the OOB check "Review Public REST API Endpoints" (agreed 2026-11-06).
- **Resolution:** Enable "Requires authentication" and "Requires ACL authorization", or document why the endpoint must be public.

---

## Batch 6: drafts received 2026-11-06

**Built and deployed 2026-11-06.** Test data refreshed (132 records, no warnings); the dry run against it finds every positive case once and no negative one (IH-063 can only be checked in a real scan run). Dry run in the app scope (built scripts, stub engine, no findings written) on bithawkdemo1: IH-058 0, IH-059 0, IH-060 0, IH-061 0, IH-062 6, IH-064 147, IH-065 0, IH-066 9, IH-067 0, IH-068 0, IH-069 0, IH-070 1 (98.8 %), IH-071 0, IH-072 0, IH-073 0. IH-063 (ColumnTypeCheck) tested locally (7 cases). Helper additions: `IHScanUtil.conditionComplexity()` (IH-038 now uses it too) and an exclusion callback for `reportBaselineChanges()`. Test data covers IH-059, IH-062, IH-063, IH-064, IH-065, IH-069 and IH-071 to IH-073; none for IH-058, IH-060, IH-061, IH-066 to IH-068 and IH-070 (instance settings, schema changes, or enough real findings).

Drafts from the user ("same procedure as before"), specified 2026-11-06. Code checks follow the batch 2 rules (custom only, matching lines listed). IH-058, IH-059, IH-061 to IH-063, IH-065, IH-066 and IH-068 to IH-073 follow the proposals below without an explicit decision; the user can still change them. "Scheduled reports run as an invalid or inactive user" was dropped.
Overlaps with own checks: IH-002 (slow reports > 5 s) vs IH-065, IH-013 (before rules with update/insert) vs IH-069, IH-020 (outbound calls in business rules) vs IH-073, IH-047/IH-048 vs the dropped scheduled report check. OOB: `sn_vsc` "Check UI Action Conditions Before Execution" and "UI Action visibility" concern UI action security, not condition complexity.

## IH-058 Property glide.security.ui.filter set to true

- **Ideal:** `glide.security.ui.filter` does not exist or is `false` (user's draft).
- **Logic:** `sys_properties` where `name=glide.security.ui.filter^value=true`.
- **Measured:** property does not exist, no finding.
- **Resolution:** Delete the property or set it to `false`.

## IH-059 UI actions with complex conditions

- **Ideal:** UI action conditions are short expressions.
- **Logic:** as IH-038 on `sys_ui_action` (`active=true^conditionISNOTEMPTY`): longer than 200 characters, or contains `GlideRecord` / `GlideAggregate`, `;` or `function`. Custom only.
- **Measured:** all UI actions: 3,195 with condition, 147 longer than 200, 126 with a query, 264 with `;`; custom: 0.
- **Resolution:** Move the logic into a script include function and call it from a short condition.

## IH-060 Remote tables with 1000 rows or more

- **Ideal:** Remote tables return fewer than 1000 rows.
- **Logic:** remote table definitions `sys_script_vtable` ✔ (82 active, all ServiceNow apps). Counting rows runs the remote table's script, which can call external systems. Proposal: custom remote tables only; query each with `setLimit(1000)` and report when 1000 rows come back.
- **Measured:** 0 custom remote tables.
- **Decision:** custom remote tables only, so ServiceNow remote table scripts (with external calls) are not run by the scan (agreed 2026-11-06).
- **Resolution:** Filter the remote table script (pagination, query conditions) so it returns only the rows needed.

## IH-061 Scheduled jobs running longer than their interval

- **Ideal:** A recurring job finishes before its next run is due.
- **Logic:** `sys_trigger` ✔ of type Repeat (1) or Interval (10) with a repeat interval (`repeat`, stored as a date-time from 1970-01-01 UTC, e.g. `1970-01-01 01:00:00` = 1 hour; for other trigger types it means something else). Average run time over the last 7 days from `sys_scheduler_job_history` ✔ (`job_classification` "Recurring.<trigger name>", sum of `total` / sum of `count`, ms; 546 of 1,013 history classes match a trigger name). Finding if the average is longer than the interval; details also show the longest run. Link to the job record (`document` / `document_key`), else the trigger.
- **Measured:** by last run 0, by longest run in 7 days 41 (mostly ServiceNow event handlers running every 2 s with spikes up to 6 s), by 7-day average 0.
- **Decision:** 7-day average, so short spikes are not reported (agreed 2026-11-06).
- **Resolution:** Optimize the job or increase its interval.

## IH-062 Scheduled jobs with errors

- **Ideal:** Scheduled jobs run without errors.
- **Logic:** `sys_trigger` ✔ where `last_errorISNOTEMPTY^ORerror_count>0`. Link to the job record, details show the error.
- **Measured:** 6 with a last error, 1 with an error count.
- **Resolution:** Fix the job script or its configuration; deactivate obsolete jobs.

## IH-063 Scripts that flush the cache

- **Ideal:** No script flushes the system cache.
- **Logic:** ColumnTypeCheck on `script` columns, regex `gs\.cacheFlush\s*\(` or `GlideCacheManager\.flush`. Custom only, lines listed.
- **Measured:** `cacheFlush` in 20 business rules and 5 script includes, all ServiceNow; custom 0.
- **Resolution:** Remove the call; a cache flush slows down all users until the cache is rebuilt.

## Dropped: Scheduled reports run as an invalid or inactive user

- **Observation:** scheduled reports are `sysauto_report` ✔, a subtable of `sysauto`. IH-047 (deleted user) and IH-048 (inactive user) query `sysauto` and therefore already include scheduled reports. bithawkdemo1 has no scheduled reports.
- **Decision: dropped (2026-11-06),** covered by IH-047 and IH-048. Has no number since the renumbering.

## IH-064 Active user accounts without login

- **Ideal:** Users who no longer log in are deactivated.
- **Logic:** `sys_user` where `active=true^web_service_access_only=false` and the last login is older than the limit, or never logged in and created before the limit. Link to the user.
- **Measured (90 days):** 27 with a last login older than 90 days, 120 never logged in and created more than 90 days ago (713 active users, 664 never logged in, many demo users).
- **Decision:** 90 days, users who never logged in included when created more than 90 days ago (agreed 2026-11-06).
- **Resolution:** Deactivate the account (and remove roles and group memberships through offboarding).

## IH-065 Slow list reports with group by

- **Ideal:** List reports with a group by run in under 15 seconds.
- **Logic:** as IH-002, `report_stats` where `recent_avg_execution_duration>=15000`, report table `sys_report` with `type=list` and a `group`, last run (stats `sys_updated_on`) within 60 days. Link to the report.
- **Measured:** 5 reports ≥ 15 s, none a list report with group by.
- **Resolution:** Remove the group by or limit the data set (filters, shorter period).

## IH-066 Changed ServiceNow dictionary entries

- **Ideal:** ServiceNow dictionary entries are not changed (use dictionary overrides instead).
- **Logic:** as IH-024 to IH-028 (`sys_metadata_customization`, `author_type=ServiceNow`) for `sys_dictionary`. Entries on `u_` tables or `u_` fields are skipped (seen: `u_sys_choice.u_table` marked as ServiceNow).
- **Measured:** 20, all with a customer update. Built (2026-11-06): 9 findings; the other 11 are `u_` fields added by the customer to ServiceNow tables, which the platform list also marks as ServiceNow.
- **Resolution:** Revert the change and use a dictionary override on the child table where possible.

## IH-067 Update set tables not audited

- **Ideal:** Changes to update sets are audited.
- **Logic:** collection entry of `sys_update_set` (`sys_dictionary`, empty element): finding if `audit` is false. Linked to the collection entry.
- **Decision:** only `sys_update_set` (agreed 2026-11-06).
- **Measured:** `sys_update_set` audited; `sys_remote_update_set`, `sys_update_xml`, `sys_update_version` not.
- **Resolution:** Enable auditing on the table (dictionary collection entry).

## IH-068 ServiceNow CI classes with more than 10 custom fields

- **Ideal:** ServiceNow CI classes carry few custom attributes.
- **Logic:** CI classes (`sys_db_object` named `cmdb_ci*`, not `u_` and not from a customer app) with more than 10 custom fields (`sys_dictionary` elements starting with `u_` or a customer scope prefix). One finding per class with the count and field names.
- **Measured:** 0 classes with custom fields.
- **Resolution:** Use existing attributes, a custom child class, or related tables instead of many custom fields.

## IH-069 current.update() in business rules

- **Ideal:** Business rules never call `current.update()`.
- **Logic:** custom active business rules that are not `before` (before rules are covered by IH-013), lines with `current.update(` after stripping comments.
- **Measured:** 109 active business rules use it (9 before), all ServiceNow; custom 0.
- **Resolution:** Use a before rule to set values on current, or `setWorkflow(false)` with care in after rules.

## IH-070 Share of unique location names

- **Ideal:** 100 % of location names are unique.
- **Logic:** `cmn_location` total vs. distinct names. One summary finding linked to the `cmn_location` table when below 100 %, details show the share and the duplicate names.
- **Measured:** 427 locations, 422 unique names (98.8 %), 5 names twice (e.g. "815 E Street, San Diego,CA").
- **Resolution:** Merge or rename the duplicate locations.

## IH-071 Hardware, application and VM instance CIs without name

- **Ideal:** Every hardware, application and VM instance CI has a name.
- **Logic:** `cmdb_ci` where `nameISEMPTY` and class is `cmdb_ci_hardware`, `cmdb_ci_appl` or `cmdb_ci_vm_instance` or below (`INSTANCEOF`).
- **Measured:** 0.
- **Resolution:** Name the CI (identification and reports depend on it).

## IH-072 Scheduled imports at the same time

- **Ideal:** Scheduled imports do not start at the same time.
- **Logic:** active `scheduled_import_set` ✔ without parent (child imports run after their parent): build a schedule key from `run_type`, time of day, day of week / month and period (`once`: start date and time; `on_demand` ignored). One finding per import that shares its key with another import.
- **Measured:** 4 active scheduled imports, all `once` (KG picker jobs) without a start date. The first build reported them as "same time" (all empty); one-time imports without start date have no schedule and are ignored since (2026-11-06): 0 findings.
- **Resolution:** Stagger the start times or chain the imports (parent / child).

## IH-073 UI actions with synchronous outbound calls

- **Ideal:** UI actions do not call external systems synchronously (business rules: IH-020).
- **Logic:** custom active server-side UI actions (`client=false`) whose script contains `RESTMessageV2`, `SOAPMessageV2`, `RESTMessage(`, `SOAPMessage(` or `GlideHTTPRequest` (lines listed), unless the call is `executeAsync()`.
- **Measured:** 3 such UI actions, all ServiceNow; custom 0.
- **Resolution:** Trigger the call asynchronously (event, flow or `executeAsync()`) and inform the user.
