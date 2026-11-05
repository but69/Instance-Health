# Instance Health: Check Catalogue

Dropped: IH-006 Java package collection mode (2026-11-05).

Status values: `idea` → `specified` → `built` → `validated`.
Field and table names marked ✔ were verified on bithawkdemo1 (2026-11-05).

| ID | Check | Area | Category | Type | Status |
|----|-------|------|----------|------|--------|
| IH-001 | Reports published to public | Administration | security | TableCheck | built |
| IH-002 | Slow reports (> 5 s) | Performance | performance | TableCheck (advanced) | built |
| IH-003 | Tables with > 10 custom client scripts | Maintenance | manageability | ScriptOnlyCheck | specified |
| IH-004 | Data collector jobs with errors or warnings | Maintenance | manageability | TableCheck (advanced) | built |
| IH-005 | Global UI scripts | Performance | performance | TableCheck | built |
| IH-007 | Global client scripts | Performance | performance | TableCheck | built |
| IH-008 | Import set rows > 5 million | Maintenance | performance | ScriptOnlyCheck | specified |
| IH-009 | Scripts using gs.sql | Maintenance | upgradability | ColumnTypeCheck | built |

---

## IH-001 Reports published to public

- **Ideal:** No report is published to public.
- **Logic:** `sys_report` where `is_published=true` ✔. Each match is a finding.
- **Resolution:** Unpublish the report or restrict it with roles or groups. Public reports can be viewed without logging in.
- **Note:** The instance also has a `sys_report_public` table. Check whether it adds anything beyond `is_published`.

## IH-002 Slow reports

- **Ideal:** Reports load in under 5 s.
- **Logic:** `report_stats` where `recent_avg_execution_duration > 5000` and `recent_number_executions > 0` ✔. Reports that have not run recently are ignored. Unit is ms ✔ (largest run on bithawkdemo1: 210216 = 3.5 min). The finding details show the average in seconds.
- **Note:** `report_stats` also holds stats for Platform Analytics visualizations (`par_visualization`), so these are reported as well. The finding points to the `report_stats` record, which references the report via `report_sys_id`.
- **Decision:** Recent average, recently run reports only (agreed 2026-11-05).
- **Resolution:** Add filters, indexes or a smaller date range; avoid dot-walked group-bys on large tables.

## IH-003 Tables with more than 10 custom client scripts

- **Ideal:** At most 10 custom client scripts per table.
- **Logic:** GlideAggregate on `sys_script_client`, grouped by `table`, filtered to active custom scripts. One finding per table with count > 10, showing the count in `finding_details`.
- **Custom:** a script not delivered by a ServiceNow plugin or store app (agreed 2026-11-05). Exact detection to be confirmed during build.
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
