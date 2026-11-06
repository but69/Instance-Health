# Instance Health: Check Catalogue

Dropped: IH-006 Java package collection mode (2026-11-05).

## Open items (as of 2026-11-06)

- IH-001 to IH-009 are deployed to bithawkdemo1. The user ran them; results look fine, but the demo instance has few findings.
- Batch 2 (IH-010 to IH-016, IH-018, IH-019) and the helper `IHScanUtil` are built and deployed to bithawkdemo1 (2026-11-06). IH-003 now uses the helper. IH-017 was built afterwards (option 1, reduced check), not deployed yet; its test maps are in `create-test-data.js` but not yet on the instance.
- Test data refreshed on 2026-11-06 for batch 1 and 2: 51 records, all in global, including the 2 IH-019 ACLs and both IH-016 duplicates (no warnings). Next: the user runs all checks and sends the findings for comparison.
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
