# Instance Health: Check Catalogue

Dropped: IH-006 Java package collection mode (2026-11-05), IH-045 priority 1 skipped upgrade items (2026-11-06).

## Open items (as of 2026-11-06)

- IH-001 to IH-009 are deployed to bithawkdemo1. The user ran them; results look fine, but the demo instance has few findings.
- Batch 2 (IH-010 to IH-016, IH-018, IH-019) and the helper `IHScanUtil` are built and deployed to bithawkdemo1 (2026-11-06). IH-003 now uses the helper. IH-017 was built afterwards (option 1, reduced check) and deployed the same day.
- Batches 3, 4 and 5 (IH-020 to IH-059, IH-045 dropped) are built and deployed to bithawkdemo1 (2026-11-06).
- Test data refreshed on 2026-11-06 for batches 1 to 5: 115 records (test users `ih.test.active` / `ih.test.inactive`, view `ih_test`, test REST API included), no warnings. Next: the user runs all checks (IH-001 to IH-059) and sends the findings for comparison.
- Test data refreshed on 2026-11-06 for batches 1 to 3: 68 records, all in global, no warnings. A dry run of the batch 3 checks against it (built scripts, stub engine, no findings written) finds every positive case once and no negative one. Next: the user runs all checks (IH-001 to IH-031) and sends the findings for comparison.
- Test record names must fit the field length: `sys_script.name` holds 40 characters including the `IH-TEST ` prefix (a longer name was truncated on 2026-11-06 and its lookup failed). Next: the user runs all checks and sends the findings for comparison.
- `remove-test-data.js` ends with the error `"g_tableName" is not defined` when it restores the user's app after deleting the test update set (2026-11-06). The deletion itself is complete and the app is restored; cause not yet investigated.
- Test data is on bithawkdemo1 (created 2026-11-06 with `now-sdk exec --file test-data/create-test-data.js --scope global --auth but-o`, update set "Instance Health - Test Data", global, 31 updates). Next: run the checks, compare with the expected findings, then run `remove-test-data.js`. Mark checks `validated` afterwards.
- Lessons from the first test data run (2026-11-06): records and update sets follow the user's current application, not the script scope, so the first run landed in the Instance Health app scope (cleaned up). Both scripts now switch to global and restore the app. `GlideUpdateSet.create()` returns nothing, so the update set is inserted directly. A report counts as published only if `roles` contains `public` (OOB rule "Report roles updated - is_publish field" overwrites `is_published`). `now-sdk exec` sometimes reports "not authorized" or a connection reset although the script ran: check the instance before running it again.
- Proposed, not yet agreed: make thresholds (IH-002 5 s, IH-003 10 scripts, IH-008 5 million rows) configurable as system properties. This would also allow testing IH-008 with a low threshold.
- Proposed, not yet agreed: IH-004 should also flag active jobs whose latest run is older than 7 days (seen on bithawkdemo1: latest run 2026-06-12).
- Proposed, not yet agreed: group all checks in an "Instance Health" suite (needs a `Record()` on the suite table, verify first).
- Later: run the checks on a real instance with real data (needs customer approval).

Status values: `idea` → `specified` → `built` → `validated`.
Field and table names marked ✔ were verified on bithawkdemo1 (2026-11-05).

| ID | Check | Area | Category | Type | Status |
|----|-------|------|----------|------|--------|
| IH-001 | Reports published to public | Administration | security | TableCheck | built |
| IH-002 | Slow reports (> 5 s) | Performance | performance | TableCheck (advanced) | built |
| IH-003 | Tables with > 10 custom client scripts | Maintenance | manageability | ScriptOnlyCheck | built |
| IH-004 | Data collector jobs with errors or warnings | Maintenance | manageability | TableCheck (advanced) | built |
| IH-005 | Global UI scripts | Performance | performance | TableCheck | built |
| IH-007 | Global client scripts | Performance | performance | TableCheck | built |
| IH-008 | Import set rows > 5 million | Maintenance | performance | ScriptOnlyCheck | built |
| IH-009 | Scripts using gs.sql | Maintenance | upgradability | ColumnTypeCheck | built |
| IH-010 | Unnecessary dot-walk to sys_id | Performance | performance | ColumnTypeCheck | built |
| IH-011 | Synchronous AJAX in client code | Performance | performance | ColumnTypeCheck | built |
| IH-012 | Hard-coded instance URL | Maintenance | manageability | ColumnTypeCheck | built |
| IH-013 | Hard-coded sys_ids in scripts | Maintenance | manageability | ColumnTypeCheck | built |
| IH-014 | Before business rules that update or insert other records | Maintenance | manageability | TableCheck (advanced) | built |
| IH-015 | Global business rules | Performance | performance | TableCheck (advanced) | built |
| IH-016 | Script includes with duplicate names | Maintenance | manageability | ScriptOnlyCheck | built |
| IH-017 | Transform map coalesces on non-indexed fields | Performance | performance | TableCheck (advanced) | built |
| IH-018 | Tables without ACLs | Administration | security | ScriptOnlyCheck | built |
| IH-019 | Read ACLs with GlideRecord / GlideAggregate | Performance | performance | TableCheck (advanced) | built |
| IH-020 | SLA engine runs synchronously | Performance | performance | ScriptOnlyCheck | built |
| IH-021 | Business rules with outbound REST/SOAP must be async | Performance | performance | TableCheck (advanced) | built |
| IH-022 | Skipped items in the last upgrade | Maintenance | upgradability | ScriptOnlyCheck | specified (blocked) |
| IH-023 | Default rows per page at most 50 | Performance | performance | TableCheck (advanced) | built |
| IH-024 | Long running (slow) scripts | Performance | performance | TableCheck (advanced) | built |
| IH-025 | Differs from baseline: business rules | Maintenance | upgradability | ScriptOnlyCheck | built |
| IH-026 | Differs from baseline: script includes | Maintenance | upgradability | ScriptOnlyCheck | built |
| IH-027 | Differs from baseline: client scripts and UI scripts | Maintenance | upgradability | ScriptOnlyCheck | built |
| IH-028 | Differs from baseline: UI macros and UI pages | Maintenance | upgradability | ScriptOnlyCheck | built |
| IH-029 | Differs from baseline: UI actions | Maintenance | upgradability | ScriptOnlyCheck | built |
| IH-030 | Virtual CIs with assets | Administration | manageability | ScriptOnlyCheck | built |
| IH-031 | Computers and network gear without serial number | Administration | manageability | TableCheck | built |
| IH-032 | Create Asset business rules active | Administration | manageability | ScriptOnlyCheck | built |
| IH-033 | CIs with an invalid discovery source | Administration | manageability | TableCheck (advanced) | built |
| IH-034 | Impersonation in production | Administration | security | ScriptOnlyCheck | built |
| IH-035 | Update sets with duplicate names | Maintenance | manageability | ScriptOnlyCheck | built |
| IH-036 | Knowledge bases without retire workflow | Administration | manageability | TableCheck (advanced) | built |
| IH-037 | Business rule call stack logging enabled | Performance | performance | TableCheck | built |
| IH-038 | Script includes that update current | Maintenance | manageability | TableCheck (advanced) | built |
| IH-039 | Business rules with complex script conditions | Maintenance | manageability | TableCheck (advanced) | built |
| IH-040 | Inactive users in groups | Administration | security | TableCheck | built |
| IH-041 | Groups with an inactive manager | Administration | manageability | TableCheck | built |
| IH-042 | Groups without members | Administration | manageability | TableCheck (advanced) | built |
| IH-043 | Roles assigned directly to users | Administration | security | TableCheck | built |
| IH-044 | Groups with roles without a group type | Administration | security | TableCheck (advanced) | built |
| IH-045 | Priority 1 items skipped in the last upgrade | Maintenance | upgradability | ScriptOnlyCheck | dropped |
| IH-046 | Dictionary entries for tables that do not exist | Maintenance | manageability | ScriptOnlyCheck | built |
| IH-047 | List layouts with duplicate positions | Maintenance | manageability | ScriptOnlyCheck | built |
| IH-048 | Catalog tasks without requested item or request | Administration | manageability | TableCheck | built |
| IH-049 | Active scheduled jobs run as a deleted user | Administration | manageability | TableCheck (advanced) | built |
| IH-050 | Active scheduled jobs run as an inactive user | Administration | security | TableCheck (advanced) | built |
| IH-051 | Active tasks opened by an inactive user | Administration | manageability | TableCheck | built |
| IH-052 | System locale is valid | Administration | manageability | ScriptOnlyCheck | built |
| IH-053 | Single currency mode configured correctly | Administration | manageability | ScriptOnlyCheck | built |
| IH-054 | Resolved fields set by mark_resolved | Administration | manageability | ScriptOnlyCheck | built |
| IH-055 | Closed fields set on problems | Administration | manageability | ScriptOnlyCheck | built |
| IH-056 | Active tasks with a closed date | Administration | manageability | TableCheck | built |
| IH-057 | Update sets without description | Maintenance | manageability | TableCheck | built |
| IH-058 | Share of active CIs not discovered or updated for 60 days | Administration | manageability | ScriptOnlyCheck | built |
| IH-059 | Scripted REST resources without security | Administration | security | TableCheck (advanced) | built |

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

## IH-007 Global client scripts

- **Ideal:** No client scripts run on `global`.
- **Logic:** `sys_script_client` where `table=global^active=true`.
- **Resolution:** Move the logic to the specific table or into a UI script that is loaded on demand.

## IH-008 Import set rows over 5 million

- **Ideal:** Import set rows stay below 5 million.
- **Logic:** Count all rows in `sys_import_set_row` (all staging tables extend it). If the count is over 5,000,000, report the top 10 import runs (`sys_import_set`) by row count, one finding each with the count.
- **Decision:** The limit applies to all import set rows together (agreed 2026-11-05).
- **Resolution:** Check the Import Set Deleter / cleanup job and its retention period, and clean up the big runs.

## IH-009 Scripts using gs.sql

- **Ideal:** No script uses `gs.sql`.
- **Logic:** ColumnTypeCheck on all `script` columns: regex `\bgs\s*\.\s*sql\s*\(` after stripping comments, so commented-out calls are ignored. Changed from LinterCheck (2026-11-05): the documented AST API cannot reliably tell `gs.sql` apart from other `.sql()` calls.
- **Resolution:** Replace with GlideRecord / GlideAggregate. `gs.sql` is undocumented, bypasses ACLs and can lock tables.

---

## Batch 2: drafts received 2026-11-06

Drafts from the user, specified 2026-11-06.
Measured on bithawkdemo1 (2026-11-06): no OOB Instance Scan check covers these topics (402 checks reviewed; `sn_vsc` covers empty ACLs and client-callable script includes only).

**Common rules for the code checks (IH-010 to IH-016, IH-019):**
- **Decision:** custom records only, using the same rule as IH-003 (customer scoped app, or global with a customer update in `sys_update_xml`). ServiceNow code is not reported (agreed 2026-11-06).
- **Decision:** every regex-based check (IH-010 to IH-014, IH-019) lists each matching line as `line N: <code>` in `finding_details` (agreed 2026-11-06).
- Comments are stripped before matching (as IH-009). Each finding links to the script record.
- **Built 2026-11-06:** shared helper script include `x_bits2_inst_hlth.IHScanUtil` (`src/fluent/script-includes/ih-scan-util.now.ts`): `isCustom(gr)`, `checkScript()` for ColumnTypeChecks, `matchingLines()` / `reportLines()` (max. 20 lines of 200 characters, then "... and N more line(s)"). IH-003 uses it too. The Instance Health app itself never counts as custom. Regexes and line logic tested locally with positive and negative samples.
- **Verified 2026-11-06:** ColumnTypeCheck `columnType: 'script'` (the SDK only allows `script`, `xml`, `html`) also covers `script_plain` columns (script includes, client scripts, ACL and UI policy scripts): existing findings of OOB `script` checks come from `sys_script_include`. The app scope can read `sys_update_xml`, `sys_security_acl`, `sys_db_object`, `sys_script*`.

## IH-010 Unnecessary dot-walk to sys_id

- **Ideal:** Reference values are read with `getValue('field')` or `field.toString()`, not `field.sys_id`.
- **Logic:** ColumnTypeCheck on `script` columns, regex for `<identifier>.<field>.sys_id` (e.g. `current.caller_id.sys_id`, `gr.assigned_to.sys_id`). Not a finding: `current.sys_id`, `gr.sys_id` (no dot-walk). Each matching line goes into `finding_details`.
- **Heuristic (built):** skipped to avoid false positives: `this.x.sys_id` and `<var>.<name>.sys_id` where `<name>` is `data`, `options`, `input`, `params`, `body`, `request`, `response`, `result`, `answer` (widget and helper objects, not reference fields).
- **Resolution:** Use `gr.getValue('field')` (or `gr.field + ''`); the reference field already holds the sys_id.

## IH-011 Synchronous AJAX in client code

- **Ideal:** Client code uses asynchronous calls only.
- **Logic:** Client script columns (`sys_script_client`, `catalog_script_client`, client UI actions, UI policy scripts). Patterns: `getXMLWait(`, `g_form.getReference(<field>)` without callback, client `GlideRecord.query()` without callback, `async: false` / `async:false`.
- **Measured:** 294 active client scripts match a raw LIKE on these patterns, mostly OOB; plain matching is not enough for `getReference` (async with callback).
- **Built:** client columns only: `sys_script_client` / `catalog_script_client.script`, `sys_ui_policy` / `catalog_ui_policy.script_true|script_false`, `sys_ui_script.script`, `sys_ui_page.client_script`, `sp_widget.client_script`, `sys_ui_action.script` when `client=true`. Regex: `getXMLWait(`, `.getReference(<one argument>)`, `.query()` without argument, `async: false`.
- **Resolution:** Use `getXMLAnswer` / `getXML` with a callback, `getReference(field, callback)`, or a GlideAjax call.

## IH-012 Hard-coded instance URL

- **Ideal:** No script contains an instance URL; use `gs.getProperty('glide.servlet.uri')`.
- **Logic:** ColumnTypeCheck on `script` columns, regex `https?://[a-z0-9-]+\.(service-now|servicenowservices)\.com`, case-insensitive (any instance, also other ones, e.g. a dev URL in production code). URLs in comments are ignored.
- **Resolution:** Build URLs from `glide.servlet.uri` or `instance_name`; hard-coded URLs break after clones.

## IH-013 Hard-coded sys_ids in scripts

- **Ideal:** No script contains a literal sys_id.
- **Logic:** ColumnTypeCheck on `script` columns, regex for a quoted 32-character hex string `['"][0-9a-f]{32}['"]`.
- **Resolution:** Use a system property, a lookup by a stable key (name, number) or a reference in configuration.

## IH-014 Before business rules that update or insert other records

- **Ideal:** Before business rules only change `current`; changes to other records happen in after or async rules.
- **Logic:** `sys_script` where `when=before^active=true^scriptLIKEupdate^ORscriptLIKEinsert`, then every line with `.update(` or `.insert(` after stripping comments. `current.update()` is reported too (it is worse in a before rule). `updateMultiple()` is not reported.
- **Measured:** 269 active before rules contain `.update(` or `.insert(`, mostly OOB.
- **Resolution:** Move the logic to an after or async business rule.

## IH-015 Global business rules

- **Ideal:** No business rule runs on table `global`.
- **Logic:** `sys_script` where `collection=global^active=true`.
- **Measured:** 94 active rules on global, all from plugins or the base system, none custom.
- **Resolution:** Move functions to script includes; global rules are loaded on every transaction.

## IH-016 Script includes with duplicate names

- **Ideal:** Each script include name is unique within its scope.
- **Logic:** GlideAggregate on `sys_script_include` grouped by `api_name`, count > 1, empty `api_name` ignored (337 old script includes on bithawkdemo1 have none). One finding per script include in a duplicate group; `finding_details` names the API name, group size, package and active state.
- **Measured:** 113 names occur more than once, but almost all in different scopes (legal: `x_a.Util` and `x_b.Util` are distinct). Same scope: 6 names; duplicate `api_name`: 8. All OOB.
- **Decision:** only duplicates within the same scope (same `api_name`) count; a group is reported if at least one member is custom (agreed 2026-11-06).
- **Resolution:** Rename or remove one; with duplicate names it is undefined which class is loaded.

## IH-017 Transform map coalesces on non-indexed fields

- **Ideal:** Every active transform map coalesces on at least one indexed field.
- **Logic (built 2026-11-06, option 1 "reduced check"):** TableCheck on `sys_transform_map` where `active=true` ✔. For each coalesce entry (`sys_transform_entry`, `coalesce=true` ✔): find the table that defines the field (`sys_dictionary`, up the `super_class` chain), then the first table from there upwards with physical indexes in `v_db_index` ✔ (`table_name`, `column_names` like `[name;sys_id]`). Field is indexed if it is the first column of an index; `sys_id` always is. If that table is not the defining table, the field is stored under an unknown physical column name and counts as unknown (e.g. `cmdb_ci_computer.serial_number` stored in `cmdb`). The map is a finding only if no coalesce field is indexed and none is unknown (no finding when unsure). One finding per map, linked to the transform map, listing the unindexed fields.
- **Changed from per field to per map (2026-11-06):** the coalesce lookup uses all coalesce fields together, so one indexed field is enough. Per field, maps like the `sys_choice` translation map were reported for `element`, `value`, `dependent_value` although `name` is indexed.
- **Option 2 rejected (2026-11-06):** a cross-scope privilege for `sys_storage_alias` cannot work: the table has "Can read" from other scopes switched off (`read_access=0`), which a privilege cannot override; access tracking created no privilege record for it, unlike for all other tables the app reads. Agreed fallback: option 1.
- **Prototype on bithawkdemo1 (2026-11-06):** 37 maps with coalesce: 30 covered, 6 findings (HR Profile, HR Job Profile, Notification → `incident.correlation_id`, Rate Model Line, HR Location, HR Department), 1 unknown (Computer → CMDB).
- **Measured:** 70 coalesce entries.
- **Was on hold (2026-11-06): no reliable index source from the app scope.** `sys_index` holds only the 37 custom-created indexes (0 for `task`, `incident`, `sys_user`), so every OOB field would be reported. `v_db_index` (query by `table_name`) lists all physical indexes, but with physical column names: fields of extended tables are stored as `a_ref_N` / `a_str_N` in the base table (`task`), and the mapping `sys_storage_alias` (222,212 rows in global) returns no rows from the app scope. CMDB tables return no indexes at all (partitioned storage). Options to discuss: a global helper outside the app, a cross-scope privilege for `sys_storage_alias`, or a reduced check (only fields stored under their own name, CMDB excluded).
- **Resolution:** Add an index on the coalesce field(s), or a composite index for multiple coalesce fields.

## IH-018 Tables without ACLs

- **Ideal:** Every table is secured by ACLs, its own or inherited from a parent table.
- **Logic:** All tables in `sys_db_object`. Finding if no active record ACL (`sys_security_acl`, `type=record`) has `name` = the table or `<table>.<field>`, on the table itself or on any parent table (`super_class` chain). Table rotation shards (name ends in 4 digits, e.g. `syslog0001`) are excluded. Wildcard `*` ACLs do not count. Link to the `sys_db_object` record.
- **Decision:** all tables, not only custom ones; inherited ACLs count as protection (agreed 2026-11-06).
- **Measured:** 10,010 tables; 2,358 without own ACL; 167 without own or inherited ACL after excluding 520 rotation shards (3 custom), e.g. `cmn_building`, `sys_phone_territory`, `x_bits2_quackology_family`.
- **Resolution:** Create table ACLs (at least read, write, create, delete) for the required roles.

## IH-019 Read ACLs with GlideRecord / GlideAggregate

- **Ideal:** Read ACL scripts do not query the database; they run for every record and field.
- **Logic:** `sys_security_acl` where `operation=read^active=true^advanced=true` ✔, script contains `GlideRecord` or `GlideAggregate` (after stripping comments).
- **Measured:** 174 active read ACLs match, mostly OOB.
- **Built:** conditions `operation.name=read^active=true^advanced=true^scriptLIKEGlide`, then every line with `new GlideRecord(`, `new GlideRecordSecure(` or `new GlideAggregate(` (GlideRecordSecure added: it queries as well). Queries hidden in called script includes are not detected.
- **Resolution:** Use conditions or roles, cache results, or move the logic into a role or a scratchpad value.

---

## Batch 3: drafts received 2026-11-06

Drafts from the user ("outcome: list of findings"), specified 2026-11-06. IH-021 follows the batch 2 code check rules (custom only, matching lines listed).

**Built and deployed 2026-11-06** (IH-022 after the user's decision, see there). Dry run in the app scope with the built scripts and a stub engine (no findings written) on bithawkdemo1: IH-020 0, IH-021 0, IH-023 0, IH-024 20, IH-025 26, IH-026 to IH-029 0, IH-030 0, IH-031 104 (95 computers + 9 network gear). All 26 IH-025 records also have a customer update in `sys_update_xml`, which confirms the `sys_metadata_customization` list. The baseline checks use the helper method `IHScanUtil.reportBaselineChanges()`. Test data: synthetic `sys_script_pattern` rows (IH-024), customization rows with `author_type=ServiceNow` for test records (IH-025 to IH-029), test computers and one asset (IH-030, IH-031).
Measured on bithawkdemo1 (2026-11-06): no OOB Instance Scan check covers these topics.

## IH-020 SLA engine runs synchronously

- **Ideal:** SLAs are processed synchronously (SLA engine 2011, business rule "Run SLAs"), not by the async "Process SLAs" rule.
- **Logic:** property `com.snc.sla.engine.version` ✔ decides which task rule runs: "Process SLAs" (async, condition `== '2010'`, also the default when the property is missing) or "Run SLAs" (after, condition `== '2011'`) ✔. Finding if the value is not `2011`; link to the `sys_properties` record, or to the "Process SLAs" business rule if the property does not exist.
- **Measured:** bithawkdemo1 has `2011`, so no finding. No test data: changing the property would switch the SLA engine of the demo instance.
- **Resolution:** Set `com.snc.sla.engine.version` to `2011` after checking custom SLA logic that relies on the async engine.

## IH-021 Business rules with outbound REST/SOAP must be async

- **Ideal:** Business rules that call external systems run async, so the user does not wait for the remote system.
- **Logic:** `sys_script` where `active=true` and `when` is not `async` / `async_always` ✔ (values on the instance: before, after, before_display, display, async, async_always, ...), script contains `RESTMessageV2`, `SOAPMessageV2`, `RESTMessage(`, `SOAPMessage(` or `GlideHTTPRequest` (after stripping comments). Lines listed as in batch 2.
- **Measured:** 1 active non-async rule uses RESTMessageV2/SOAPMessageV2.
- **Resolution:** Change the rule to async, or move the call to an event / script action or a flow.

## IH-022 Skipped items in the last upgrade

- **Ideal:** Every item skipped in the last platform upgrade has been reviewed.
- **Logic:** latest `sys_upgrade_history` record with `to_version` starting with `glide-` ✔ (app installs also create history records). Its `sys_upgrade_history_log` rows ✔ with `disposition` 4 (Skipped), 9 (Skipped Error) or 10 (Skipped Manual Merge) ✔ and `resolution_status` empty or `not_reviewed` ✔. Link to the log row (it shows the diff and the merge options).
- **Measured:** last upgrade 2026-10-31 (patch 5aw44): 311 skipped, 2 skipped with error, none reviewed.
- **Decision:** one finding per unreviewed item (agreed 2026-11-06).
- **Blocked (2026-11-06):** `sys_upgrade_history_log` has "Can read" from other scopes switched off (`read_access=0`, as `sys_storage_alias` for IH-017); the app scope gets no rows, so per-item findings are not possible. `sys_upgrade_history` is readable and holds summary counts per upgrade ✔: `skipped`, `skipped_and_different`, `skipped_and_not_different`, `skipped_error`, `skipped_manual_merge`, `changes_skipped`. Last upgrade on bithawkdemo1: skipped 311, of which **311 not different** (the customized record already matches the new version, no review needed) and 0 different; skipped_error 2; skipped_manual_merge 0. Proposal: one finding per upgrade (latest platform upgrade) when `skipped_and_different + skipped_error + skipped_manual_merge > 0`, linked to the upgrade history record, counts in the details.
- **Decision (2026-11-06):** one summary finding as proposed, replacing "one finding per item". Skipped items that already match the new version are only mentioned in the details. Built and deployed the same day; dry run on bithawkdemo1: 1 finding (2 skipped with error).
- **Resolution:** Review each skipped item in the upgrade history: revert to the base system, merge, or keep the customization and mark it reviewed.

## IH-023 Default rows per page at most 50

- **Ideal:** The system default for rows per page (`sys_user_preference` `rowcount`, `system=true`, no user) is 50 or less.
- **Logic:** `sys_user_preference` where `name=rowcount^system=true^userISEMPTY` ✔, advanced: finding if `parseInt(value) > 50`.
- **Measured:** value 20, no finding.
- **Resolution:** Set the system preference `rowcount` to 50 or less; large pages slow down every list.

## IH-024 Long running (slow) scripts

- **Ideal:** No script runs longer than the threshold on average.
- **Logic:** `sys_script_pattern` ✔ (Slow Scripts: `average` in ms, `count`, `last`, `label`, `script_source_table`, `script_source`) where `average > threshold` and `last` within the period. Link to the script record (`script_source_table` + `script_source`), falling back to the pattern record (as IH-002).
- **Measured:** average > 5 s: 49 overall, 20 seen in the last 30 days; > 10 s: 26 / 15. Mostly OOB: script actions 18, scripted REST 11, scheduled jobs 4, script includes 3, our own scan checks 3.
- **Decision:** average > 5 s, last seen within 30 days, all scripts including ServiceNow code (agreed 2026-11-06).
- **Resolution:** Optimize the script (queries, loops, indexes) or move it to an async context.

## IH-025 to IH-029 Differs from baseline

- **Ideal:** ServiceNow records are not modified; customizations are made by copying or extending.
- **Logic:** `sys_metadata_customization` ✔ (`sys_metadata`, `author_type`) is the platform's own list of customized records. `author_type=ServiceNow` ✔ means a ServiceNow record that was changed (values: ServiceNow 1123, Custom 540, ToBeDetermined 308, Unknown 11). One finding per changed record, linked to it. Split by `sys_metadata.sys_class_name`:
  - IH-025 `sys_script`, IH-026 `sys_script_include`, IH-027 `sys_script_client` + `sys_ui_script`, IH-028 `sys_ui_macro` + `sys_ui_page`, IH-029 `sys_ui_action`.
- **Measured (all author types):** sys_script 33, sys_script_include 16, sys_script_client 27, sys_ui_script 2, sys_ui_macro 0, sys_ui_page 0, sys_ui_action 0.
- **Note:** this table could also improve the IH-003 "custom" rule (known limit: customized ServiceNow scripts in global count as custom).
- **Observed (2026-11-06):** the platform creates a row for every new record and deletes it with the record. For new code records (business rules, script includes, client scripts, UI pages, UI actions) `author_type` is `Custom`, as expected. New reports (`sys_report`) got `ServiceNow` although the customer created them, so `author_type` is not reliable for every table; the baseline checks only use code tables.
- **Resolution:** Revert to the base system where possible, or document why the change is needed; changed records are skipped in upgrades.

## IH-030 Virtual CIs with assets

- **Ideal:** CIs flagged as virtual do not have an asset.
- **Logic:** the `virtual` flag is not on `cmdb_ci`, but on about 200 classes (e.g. `cmdb_ci_computer`, `cmdb_ci_netgear`, `cmdb_ci_ot`, `cmdb_ci_nic`) ✔. ScriptOnlyCheck: find the top-most tables that define `virtual` (`sys_dictionary`), query each for `virtual=true^assetISNOTEMPTY`. Link to the CI.
- **Measured:** 0 virtual CIs on bithawkdemo1.
- **Resolution:** Remove the asset (retire or delete it) and check the model category, so virtual CIs do not create assets.

## IH-031 Computers and network gear without serial number

- **Ideal:** Every computer and network gear CI (all subclasses, discovered or not) has a serial number.
- **Logic:** TableCheck on `cmdb_ci_hardware` with `sys_class_nameINSTANCEOFcmdb_ci_computer^ORsys_class_nameINSTANCEOFcmdb_ci_netgear^serial_numberISEMPTY^install_status!=7`. Link to the CI.
- **Measured:** computers 107 of 855 without serial (95 not retired), network gear 9 of 9.
- **Decision:** retired CIs (`install_status=7`) are excluded (agreed 2026-11-06).
- **Resolution:** Populate the serial number (Discovery, import or manually); it is the main identification attribute for hardware.

---

## Batch 4: drafts received 2026-11-06

Drafts from the user ("same setup as the previous checks": catalogue first, custom-only for code checks with matching lines, link to the record to act on, test data, dry run before deploy), specified 2026-11-06. IH-032, IH-034 to IH-038 and IH-040 to IH-042 follow the proposals below without an explicit decision; the user can still change them.

**Built and deployed 2026-11-06.** Dry run in the app scope (built scripts, stub engine, no findings written) on bithawkdemo1, without test data: IH-032 0, IH-033 0, IH-034 1, IH-035 9, IH-036 7, IH-037 0, IH-038 1, IH-039 0, IH-040 2, IH-041 0, IH-042 30, IH-043 256 (after the fix, see there), IH-044 18. With test data every positive case is found once and no negative one. Test data: test users `ih.test.active` (locked out) and `ih.test.inactive`, test groups, memberships, a direct role (`personalize_choices`), knowledge bases, update sets, computers with discovery sources, and business rules / script includes for IH-038 and IH-039. No test data for IH-032, IH-034, IH-037 (instance-wide settings).
Overlap with OOB checks (bithawkdemo1, 2026-11-06): `sn_access_analyzer` "Users with Direct Role Assignments (Bypassing Groups)" (active) covers IH-043; `sn_vsc` "Restrict Impersonation to Admin" and "Log User Impersonation" cover other impersonation aspects than IH-034.

## IH-032 Create Asset business rules active

- **Ideal:** The Asset Management rules that create assets for CIs are active.
- **Logic:** `sys_script` on `cmdb_ci` named "Create Asset on insert" and "Create asset on model change" ✔ (both before, package Asset Management). One finding per rule that is inactive, linked to the rule. No finding if Asset Management is not installed (rules missing).
- **Measured:** both active.
- **Resolution:** Activate the rule; without it, new CIs get no asset and asset and CMDB data drift apart.

## IH-033 CIs with an invalid discovery source

- **Ideal:** Every discovery source set on a CI is a value from the `discovery_source` choice list.
- **Logic:** `cmdb_ci` where `discovery_source` is not empty and not an active choice (`sys_choice` `cmdb_ci.discovery_source`, 42 values ✔). Retired CIs excluded (as IH-031). One finding per CI, linked to the CI.
- **Decision:** CIs without a discovery source are not a finding (user, 2026-11-06).
- **Measured:** 2,823 CIs empty (not reported), all non-empty values valid (ServiceNow 319, Other Automated 50, AutoDev 1, ServiceWatch 1), so no finding.
- **Rename:** title changed to "CIs with an invalid discovery source".
- **Resolution:** Set the discovery source in every import, integration and manual process (e.g. `ImportSet`, `Manual Entry`); it tells which source owns the CI.

## IH-034 Impersonation in production

- **Ideal:** Impersonation is switched off on production instances.
- **Logic:** if `glide.installation.production` ✔ is `true` and `glide.ui.impersonate_button.enable` ✔ is not `false`: finding linked to the property `glide.ui.impersonate_button.enable`. Details list the users with the `impersonator` role.
- **Measured:** bithawkdemo1 is flagged production (`glide.installation.production=true`), impersonate button enabled, 2 `impersonator` role entries (Nextwave Service User, one inherited).
- **Note:** the property hides the impersonate button; admins can still impersonate by other means. The role holders are the second lever.
- **Resolution:** Set `glide.ui.impersonate_button.enable` to `false` on production and remove the `impersonator` role where it is not needed.

## IH-035 Update sets with duplicate names

- **Ideal:** Every update set has a unique name.
- **Logic:** GlideAggregate on `sys_update_set` grouped by `name`, count > 1, name `Default` excluded (every application has one). One finding per update set in a duplicate group, linked to the update set.
- **Measured:** 30 update sets (without Default), 2 duplicate names: "Checkpoint" ×7 (complete, app `x_bits2_quackology`, created by a user), "System Administrator" ×2 (in progress, global and `x_bits2_pcp_demo`).
- **Resolution:** Rename the update sets with a unique, meaningful name (e.g. story number and short title).

## IH-036 Knowledge bases without retire workflow

- **Ideal:** Every active knowledge base has a retire workflow.
- **Logic:** `kb_knowledge_base` where `active=true` ✔, advanced: finding if `retire_workflow` is empty or references a `wf_workflow` record that does not exist. (No flow fields on this instance: `retire_flow` does not exist.)
- **Measured:** 7 of 7 active knowledge bases: 1 empty, 6 reference a deleted workflow (`3d18ef12…` 5×, `3bf3fb92…` 1×; the display value is empty, the record is missing in `wf_workflow`).
- **Changed while building (2026-11-06):** the condition-only version (`retire_workflowISEMPTY`) found only 1; broken references are reported as well, with the reason in the details.
- **Resolution:** Assign a retire workflow (e.g. "Knowledge - Instant Retire" or an approval workflow).

## IH-037 Business rule call stack logging enabled

- **Ideal:** `glide.businessrule.callstack` is `false` (default when not set).
- **Logic:** `sys_properties` where `name=glide.businessrule.callstack^value=true`.
- **Measured:** property not set, no finding.
- **Resolution:** Set the property to `false` (or delete it); call stack logging is for debugging only and slows down every transaction.

## IH-038 Script includes that update current

- **Ideal:** Business rules do not update `current` indirectly through a script include (this escapes the `current.update()` check IH-014).
- **Logic (heuristic):** custom active business rules whose script passes `current` to a script include (`new X(...current...)`, `new X().m(...current...)`, `X.m(...current...)`). The script include `X` is looked up by name; finding if its script calls `.update(` on one of its function parameters (`function(a, b) { ... a.update() ... }`). Finding on the business rule, details: BR line and script include name. Custom only, lines listed.
- **Limits:** misses updates through `this.<field>.update()` and nested calls.
- **Built:** heuristic in `IHScanUtil.findIndirectCurrentUpdates()`, tested locally with stubbed script includes (positive: `new X().m(current)`, `X.m(current)`, `new global.X().m(current)`; negative: include updates another record, `current.field` passed, commented code, unknown include).
- **Real hit on bithawkdemo1:** async rule "AMAG - Vehicle Registration - Create CI" on `sc_req_item` passes `current` to `c_VehicleRegistration.registerFromRequestItem()`, which updates its parameter.
- **Resolution:** Set values on `current` in the business rule (before rule) instead of calling `update()` in the script include, or pass a copy.

## IH-039 Business rules with complex script conditions

- **Ideal:** Business rule conditions are short expressions; logic belongs in the script.
- **Logic:** custom active `sys_script` with a non-empty `condition` that is complex. Proposed: longer than 200 characters, or contains a query (`GlideRecord` / `GlideAggregate`), a statement separator `;` or a `function`.
- **Measured:** 6 custom conditions on bithawkdemo1, none complex (all business rules: 2,527 with condition, 66 longer than 200, 7 with GlideRecord, 114 with `;`).
- **Decision:** complex = longer than 200 characters, or contains `GlideRecord` / `GlideAggregate`, `;` or `function` (agreed 2026-11-06).
- **Resolution:** Use the condition builder or a short expression; move complex logic into the script or a script include.

## IH-040 Inactive users in groups

- **Ideal:** Active groups have no inactive members.
- **Logic:** `sys_user_grmember` where `user.active=false^group.active=true`. One finding per membership, linked to the membership record.
- **Measured:** 2.
- **Resolution:** Remove the membership; inactive members distort assignment and approval lists.

## IH-041 Groups with an inactive manager

- **Ideal:** Every active group has an active manager.
- **Logic:** `sys_user_group` where `active=true^manager.active=false`. Link to the group.
- **Measured:** 0.
- **Resolution:** Assign an active manager.

## IH-042 Groups without members

- **Ideal:** Every active group has at least one member.
- **Logic:** `sys_user_group` where `active=true`, advanced: finding if no `sys_user_grmember` exists for the group.
- **Measured:** 30 of 79 active groups.
- **Resolution:** Add members or deactivate the group.

## IH-043 Roles assigned directly to users

- **Ideal:** Users get roles only through groups.
- **Logic:** `sys_user_has_role` where `inherited=false^user.active=true`, excluding `snc_internal` / `snc_external` (assigned by the platform to every user). Link to the role assignment.
- **Measured (corrected 2026-11-06):** 257 direct assignments on active users (e.g. `itil` 37, `sn_hr_core.hrsm_employee` 27, `admin` 22, `security_admin` 2). The first measurement ("646, all `snc_internal`, 0 after the exclusion") was wrong: `granted_by` defaults to `not-applicable`, so `granted_byISEMPTY` only matched the platform's own `snc_internal` assignments. Found by the test data dry run (the test user's direct role was missing), fixed and redeployed the same day.
- **Decision:** build it although the OOB Access Analyzer check covers the topic, so all health checks are in one place (agreed 2026-11-06).
- **Resolution:** Remove the direct role and add the user to a group that has the role.

## IH-044 Groups with roles without a group type

- **Ideal:** Groups that grant roles have a group type (e.g. "Authorization"), so role-granting groups are recognizable.
- **Logic:** active groups with at least one `sys_group_has_role` record and an empty `type`. Link to the group.
- **Decision:** any group type is enough; no specific type name is required (agreed 2026-11-06). Title changed to "Groups with roles without a group type".
- **Measured:** 30 active groups with roles: 12 have some type, 18 none. Existing types: Agile Team, itil, survey, Knowledge, catalog, human_resources, schedule_visible_externally, schedule_visible_internally, hr_vendors; no "Authorization" type.
- **Resolution:** Create the group type and set it on all role-granting groups; groups for assignment only should not hold roles.

---

## Batch 5: drafts received 2026-11-06

Drafts from the user ("same procedure as before"), specified 2026-11-06.

**Built and deployed 2026-11-06.** Test data refreshed (115 records, no warnings); the dry run against it finds every positive case once and no negative one. Test incidents and problems are inserted without business rules but data policies still apply: a resolved incident needs a resolution code and close notes, a closed problem needs Assigned to, Resolution code and Close notes. Dry run in the app scope (built scripts, stub engine, no findings written) on bithawkdemo1, with the batch 1 to 4 test data present: IH-046 3, IH-047 2, IH-048 0, IH-049 4, IH-050 0, IH-051 0, IH-052 0, IH-053 0, IH-054 0, IH-055 5, IH-056 15, IH-057 15 (including the 2 IH-035 test update sets), IH-058 0, IH-059 0. Shared helper `IHScanUtil.resolveRunAs()` for IH-049 and IH-050. Test data: list layout in view `ih_test`, on-demand jobs, plain tasks, an incident and a problem inserted without business rules, and a test REST API (authentication required). IH-046 to IH-048, IH-050 to IH-057 follow the proposals below without an explicit decision; the user can still change them. IH-045 was dropped.
Overlap with OOB checks (bithawkdemo1, 2026-11-06): `sn_vsc` "Review Public REST API Endpoints" (active) is close to IH-059; `sn_vsc` "Scheduled reports being emailed to external user run as inactive user" (inactive) is narrower than IH-050.

## IH-045 Priority 1 items skipped in the last upgrade

- **Ideal:** No priority 1 item was skipped in the last upgrade.
- **Blocked:** the priority is only in `sys_upgrade_history_log.type_priority` ✔, which the app scope cannot read (`read_access=0`, see IH-022). The summary record `sys_upgrade_history` has no counts per priority.
- **Measured (from global):** last upgrade skipped items by priority: 0 with priority 1, 136 with 2, 1 with 3, 173 with 5, 3 without priority.
- **Decision: dropped (2026-11-06).** IH-022 already reports skipped items that need a review; the number IH-045 is not reused.

## IH-046 Dictionary entries for tables that do not exist

- **Ideal:** Every dictionary entry belongs to an existing table.
- **Logic:** `sys_dictionary` rows of class `sys_dictionary` only (subclasses such as flow and ATF variables use `name` for other purposes ✔) whose `name` is not in `sys_db_object`. Excluded: internal storage of list fields, named `<table><field>` with the elements `sys_id`, `parent_id`, `value`, `sequence` (e.g. `kb_knowledgeroles`). One finding per missing table name, linked to its first dictionary entry; details list the elements.
- **Measured:** 119 names without table; 116 are list field storage. Built (2026-11-06): 3 findings (`sa_performance_config`, `sn_cmp_rb_dc_capablity`, `sn_itsm_gen_ai_overdue_incident_sla`). No test data needed.
- **Resolution:** Delete the orphaned dictionary entries (or recreate the table if it was deleted by mistake).

## IH-047 List layouts with duplicate positions

- **Ideal:** Every element of a list layout has its own position.
- **Logic:** GlideAggregate on `sys_ui_list_element` ✔ grouped by `list_id` and `position`, count > 1, elements without a position ignored. One finding per list layout (`sys_ui_list`), details list the positions and elements.
- **Measured:** 6 list layouts in the first count; 4 of them only have empty rows (no element, no position, e.g. `dscy_router_interface` view "Switch with routing"), which is a broken layout but not a shared position. Built without them (2026-11-06): 2 findings (`sn_udc_developer_session_watch` and `sys_user_has_skill`, both with two elements at position 0).
- **Resolution:** Open the list layout and save it again (or fix the positions), so the column order is defined.

## IH-048 Catalog tasks without requested item or request

- **Ideal:** Every catalog task is linked to a requested item and a request.
- **Logic:** `sc_task` where `request_itemISEMPTY^ORrequestISEMPTY`.
- **Measured:** 0 of 9.
- **Resolution:** Link the task to its requested item; catalog tasks should only be created by the catalog fulfillment process.

## IH-049 Active scheduled jobs run as a deleted user

- **Ideal:** Every active scheduled job runs as an existing user.
- **Logic:** `sysauto` ✔ (all job types) where `active=true^run_asISNOTEMPTY`. `run_as` is a reference to `sys_user`, but holds user names on some jobs ✔ (`admin`, `gaf-svc-account`). Resolve by sys_id, then by `user_name`; `system` and `maint` are internal platform users and skipped. Finding if no user is found; linked to the job.
- **Measured:** 795 active jobs with `run_as`; 4 point to users that do not exist (`now.discovery_infra`, `syed.azam@snc`, `Tal.Kapon@snc`, `yair.leibkowiz@snc`), all ServiceNow jobs.
- **Decision:** all jobs, including ServiceNow ones (agreed 2026-11-06).
- **Resolution:** Set `run_as` to an existing (service) user.

## IH-050 Active scheduled jobs run as an inactive user

- **Ideal:** No active scheduled job runs as an inactive user.
- **Logic:** as IH-049, finding if the resolved user is inactive.
- **Measured:** 0.
- **Resolution:** Set `run_as` to an active service user.

## IH-051 Active tasks opened by an inactive user

- **Ideal:** Active tasks are not opened by inactive users.
- **Logic:** `task` where `active=true^opened_by.active=false`. Link to the task.
- **Measured:** 0 of 13,084 active tasks.
- **Resolution:** Check whether the task is still needed; follow-up questions go to the caller, not the inactive user.

## IH-052 System locale is valid

- **Ideal:** `glide.system.locale` is empty (default) or a valid locale.
- **Logic:** property value ✔ (record exists, value empty on bithawkdemo1). Finding if the value is set and not `<language>` or `<language>.<COUNTRY>` / `<language>_<COUNTRY>` with an ISO 639 language and an ISO 3166 country (`core_country` ✔, 232 rows). Java's own locale list cannot be read from a scoped script, so the check approximates it with the ISO codes.
- **Measured:** empty, no finding.
- **Resolution:** Set a valid locale such as `de.CH` or clear the property.

## IH-053 Single currency mode configured correctly

- **Ideal:** Single currency mode is either off, or on with an active currency code.
- **Logic:** `glide.i18n.single_currency` ✔ and `glide.i18n.single_currency.code` ✔. Finding if single currency is `true` and the code is empty or not an active `fx_currency` ✔; also if it is `false` while only one currency is active (single currency mode should be used).
- **Measured:** `false`, code USD, 5 active currencies (CHF, EUR, GBP, JPY, USD): no finding.
- **Resolution:** Set the code to an active currency, or switch single currency mode on when only one currency is used.

## IH-054 Resolved fields set by mark_resolved

- **Ideal:** The business rule `mark_resolved` on incident is active, so resolved incidents get "Resolved" and "Resolved by".
- **Logic:** finding if `mark_resolved` ✔ on `incident` is missing or inactive (linked to the rule), and one finding per resolved or closed incident (`stateIN6,7`) without `resolved_at` or `resolved_by`.
- **Measured:** rule active and unchanged; 0 of 3,406 resolved/closed incidents without the fields.
- **Resolution:** Activate the rule (revert customizations), then fill the fields for affected incidents.

## IH-055 Closed fields set on problems

- **Ideal:** Closed problems have "Closed" and "Closed by".
- **Logic:** there is no `mark_closed` rule on problem in this release ✔ (only on incident and change_request); "Update fields on Problem Closure" ✔ sets the fields. Finding if that rule is missing or inactive, and one finding per closed problem (`state=107`) without `closed_at` or `closed_by`.
- **Measured:** rule active; 5 of 7 closed problems without `closed_by` (1 also without `closed_at`), all demo data from March 2026.
- **Resolution:** Activate the rule and fill the fields for affected problems.

## IH-056 Active tasks with a closed date

- **Ideal:** Active tasks have no closed date.
- **Logic:** `task` where `active=true^closed_atISNOTEMPTY`. Link to the task.
- **Measured:** 15 (incident 8, change_request 4, HR cases 3).
- **Resolution:** Check the task state; reopened tasks should clear the closed date.

## IH-057 Update sets without description

- **Ideal:** Every update set has a description.
- **Logic:** `sys_update_set` where `descriptionISEMPTY^name!=Default`.
- **Measured:** 15 of 33.
- **Resolution:** Describe the content and purpose (e.g. story number and summary).

## IH-058 Share of active CIs not discovered or updated for 60 days

- **Ideal:** The share of active CIs that were neither discovered nor updated for 60 days stays below a threshold.
- **Logic:** active CIs = `cmdb_ci` where `install_status!=7^operational_status!=6`. Stale = (`last_discovered` empty or older than 60 days) and `sys_updated_on` older than 60 days. One summary finding linked to the `cmdb_ci` table when the share is over the threshold; details show count, total and share.
- **Measured:** 15 of 3,041 active CIs (0.5 %); 2,743 were never discovered but recently updated.
- **Decision:** threshold 5 % (agreed 2026-11-06).
- **Resolution:** Retire CIs that no longer exist, and bring the rest under Discovery or a regular import.

## IH-059 Scripted REST resources without security

- **Ideal:** Every active scripted REST resource requires authentication and ACL authorization.
- **Logic:** `sys_ws_operation` ✔ where `active=true^requires_authentication=false^ORrequires_acl_authorization=false`. Link to the resource, details name the missing setting.
- **Measured:** 2,538 active resources: 60 without authentication, 203 without ACL authorization, all ServiceNow; 0 custom.
- **Decision:** custom resources only (same rule as the code checks); ServiceNow endpoints are covered by the OOB check "Review Public REST API Endpoints" (agreed 2026-11-06).
- **Resolution:** Enable "Requires authentication" and "Requires ACL authorization", or document why the endpoint must be public.
