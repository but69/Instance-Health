# Instance Health

ServiceNow Fluent app (scope `x_bits2_inst_hlth`, SDK 4.14.0) that delivers Instance Scan checks evaluating instance health: administration, maintenance and performance.

- Dev instance: bithawkdemo1, auth alias `but-o`.
- Build: `npm run build`. Deploy: `npm run deploy`. Deploy only when the user asks.

## Check catalogue

`docs/check-catalogue.md` is the source of truth for what each check does. Update it whenever a check is added, changed, built or validated. Decisions agreed with the user are recorded there with their date.

## Conventions

- One file per area: `src/fluent/scan-checks/administration.now.ts`, `maintenance.now.ts`, `performance.now.ts`.
- Check IDs `IH-NNN` are consecutive without gaps (user decision 2026-11-06). A new check gets the next free number. If a check is dropped, renumber the later checks by name only (`tools/renumber-checks.js`); never change `$id` keys or export names, they keep the number the check was created with. The catalogue documents which visible number belongs to which key number.
- `$id`: `Now.ID['ih-KKK-kebab-name']`. Export name: `ihKKKCamelName`. `KKK` is a key number that is never reused: new checks take the next unused key number (081 as of 2026-11-06), which can differ from their visible number `IH-NNN`.
- `name`: `IH-NNN <short title>` so all checks group together in Instance Scan.
- Always set `description` (with the ideal state) and `resolutionDetails`.
- Every finding must link to the record the user has to act on, whenever such a record exists (user requirement, 2026-11-05). In scripts, call `engine.finding.setCurrentSource(<that record>)` before `increment()`. If the check scans a helper table (stats, logs), resolve and link the real record (report, job, script), falling back to the scanned record.
- Category: administration → `security` or `manageability`, maintenance → `manageability` or `upgradability`, performance → `performance`. The catalogue decides per check.
- Priority by impact on instance health (user decision 2026-11-06): 1 = largest impact (instance-wide or all users, data exposure without login or ACL, breaks upgrades), 2 = noticeable impact (single processes, users or areas), 3 = everything else (data quality, housekeeping, maintainability). The catalogue table holds the priority of every check; `tools/set-priorities.js` applies it to the code.
- Scripts are inline template strings, ES5 only (`var`, no arrow functions, no template literals inside the script). Escape backslashes in regexes (`\\s`) and check the built XML in `dist/app/update/` after a build.
- Prefer condition-only `TableCheck` when every matching record is a finding. Use scripts only when needed.
- Health score: `src/fluent/health-score/health-score.now.ts` (table `x_bits2_inst_hlth_health_score`, script include `IHHealthScore`, scheduled job every 15 minutes). Rules in the catalogue section "Health score". A new setting or share check must be added to `SETTING_CHECKS` / `SHARE_CHECKS` in `IHHealthScore` and to `settingChecks` in `tools/set-priorities.js`.
- Fluent files allow no loops; `Table` role properties (`readRoles` etc.) do not create ACLs in SDK 4.14.0, write `Acl()` records with role names (`roles: ['admin']`).
- Scan engine limits seen in the first suite run (SR00014613, 2026-11-06): the base table `task` is skipped ("exclusion list or too large to scan"), so a `TableCheck` on `task` only covers its child tables; and the suite scan did not evaluate some records of a `TableCheck` (ServiceNow transform maps, one custom business rule) that a point scan did. Use a `ScriptOnlyCheck` that queries the table itself when every record must be covered. `addActiveQuery()` is not allowed on `GlideAggregate` in the app scope; use `addQuery('active', true)`.
- Changing the type of a check (e.g. `TableCheck` to `ScriptOnlyCheck`) changes its table: give it a new key number and let the build delete the old record.
- Every check belongs to the scan suite "Instance health" (`src/fluent/scan-checks/suite.now.ts`). After adding a check, regenerate the suite file with `node tools/generate-suite.js src/fluent/scan-checks`.

## Test data

`test-data/create-test-data.js` and `remove-test-data.js` are background scripts (global scope) that create and remove positive and negative test records, all marked `IH-TEST` and captured in the update set "Instance Health - Test Data". They are not part of the app build. When a check is added or changed, extend both scripts with a matching test case.

## Workflow per batch

1. Specify in the catalogue → 2. build → 3. deploy (user approval) → 4. run the checks on bithawkdemo1 and review findings → 5. tune thresholds, mark `validated`.
