# Instance Health

ServiceNow Fluent app (scope `x_bits2_inst_hlth`, SDK 4.14.0) that delivers Instance Scan checks evaluating instance health: administration, maintenance and performance.

- Dev instance: bithawkdemo1, auth alias `but-o`.
- Build: `npm run build`. Deploy: `npm run deploy`. Deploy only when the user asks.

## Check catalogue

`docs/check-catalogue.md` is the source of truth for what each check does. Update it whenever a check is added, changed, built or validated. Decisions agreed with the user are recorded there with their date.

## Conventions

- One file per area: `src/fluent/scan-checks/administration.now.ts`, `maintenance.now.ts`, `performance.now.ts`.
- Check IDs `IH-NNN` (never reuse a number, also not for dropped checks).
- `$id`: `Now.ID['ih-NNN-kebab-name']`. Export name: `ihNNNCamelName`.
- `name`: `IH-NNN <short title>` so all checks group together in Instance Scan.
- Always set `description` (with the ideal state) and `resolutionDetails`.
- Every finding must link to the record the user has to act on, whenever such a record exists (user requirement, 2026-11-05). In scripts, call `engine.finding.setCurrentSource(<that record>)` before `increment()`. If the check scans a helper table (stats, logs), resolve and link the real record (report, job, script), falling back to the scanned record.
- Category: administration → `security` or `manageability`, maintenance → `manageability` or `upgradability`, performance → `performance`. The catalogue decides per check.
- Priority: 2 for security and upgrade risks, 3 for performance and hygiene, unless the catalogue says otherwise.
- Scripts are inline template strings, ES5 only (`var`, no arrow functions, no template literals inside the script). Escape backslashes in regexes (`\\s`) and check the built XML in `dist/app/update/` after a build.
- Prefer condition-only `TableCheck` when every matching record is a finding. Use scripts only when needed.
- Every check belongs to the scan suite "Instance health" (`src/fluent/scan-checks/suite.now.ts`). After adding a check, regenerate the suite file with `node tools/generate-suite.js src/fluent/scan-checks`.

## Test data

`test-data/create-test-data.js` and `remove-test-data.js` are background scripts (global scope) that create and remove positive and negative test records, all marked `IH-TEST` and captured in the update set "Instance Health - Test Data". They are not part of the app build. When a check is added or changed, extend both scripts with a matching test case.

## Workflow per batch

1. Specify in the catalogue → 2. build → 3. deploy (user approval) → 4. run the checks on bithawkdemo1 and review findings → 5. tune thresholds, mark `validated`.
