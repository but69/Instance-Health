// Generates src/fluent/scan-checks/suite.now.ts with one Record per exported scan check
// Usage (from the project root): node tools/generate-suite.js src/fluent/scan-checks
// The $id of each suite check is derived from the check number (ih-suite-check-NNN), so
// regenerating keeps existing links and only adds new ones.
const fs = require('fs');
const path = require('path');
const dir = process.argv[2];
const files = ['administration', 'maintenance', 'performance'];
const checks = [];
for (const f of files) {
    const src = fs.readFileSync(path.join(dir, f + '.now.ts'), 'utf8');
    const re = /export const (ih(\d{3})\w*) = (TableCheck|ScriptOnlyCheck|ColumnTypeCheck|LinterCheck)\(/g;
    let m;
    while ((m = re.exec(src)) !== null) checks.push({ name: m[1], id: m[2], file: f });
}
checks.sort((a, b) => a.id.localeCompare(b.id));
const ids = checks.map(c => c.id);
const dup = ids.filter((v, i) => ids.indexOf(v) !== i);
if (dup.length) throw new Error('Duplicate check ids: ' + dup.join(', '));

let out = `import { Record } from '@servicenow/sdk/core'\n`;
for (const f of files) {
    const names = checks.filter(c => c.file === f).map(c => c.name);
    out += `import {\n${names.map(n => '    ' + n + ',').join('\n')}\n} from './${f}.now'\n`;
}
out += `
// Scan suite "Instance health" with all Instance Health checks (user request 2026-11-06).
// Generated from the exported checks; when a check is added, add its suite check record here too.
export const instanceHealthSuite = Record({
    $id: Now.ID['ih-suite-instance-health'],
    table: 'scan_check_suite',
    data: {
        name: 'Instance health',
        description: 'All Instance Health checks (IH-NNN): administration, maintenance and performance of the instance.',
        active: true,
        private: false,
        scorecard: false,
    },
})
`;
for (const c of checks) {
    out += `
Record({
    $id: Now.ID['ih-suite-check-${c.id}'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ${c.name}, score_weight: 1 },
})
`;
}
fs.writeFileSync(path.join(dir, 'suite.now.ts'), out);
console.log('checks in suite: ' + checks.length + ' (' + checks[0].id + ' to ' + checks[checks.length - 1].id + ')');
