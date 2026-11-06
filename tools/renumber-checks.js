// One-off renumbering of the visible check numbers (IH-NNN) without gaps (user request 2026-11-06).
// Only the visible numbers change: $id keys (ih-NNN-...) and export names (ihNNN...) keep the original
// number, so records keep their sys_ids. Dropped numbers become DROPPED-NNN placeholders for manual fixing.
// Usage (from the project root): node tools/renumber-checks.js [--write]
const fs = require('fs');
const path = require('path');

const checkDir = 'src/fluent/scan-checks';
const numbers = [];
for (const f of ['administration', 'maintenance', 'performance']) {
    const src = fs.readFileSync(path.join(checkDir, f + '.now.ts'), 'utf8');
    const re = /name: '(IH-(\d{3})) /g;
    let m;
    while ((m = re.exec(src)) !== null) numbers.push(m[2]);
}
numbers.sort();
const mapping = {};
numbers.forEach((n, i) => { mapping[n] = String(i + 1).padStart(3, '0'); });

const dropped = ['006', '045', '066'];
const files = [
    'src/fluent/scan-checks/administration.now.ts',
    'src/fluent/scan-checks/maintenance.now.ts',
    'src/fluent/scan-checks/performance.now.ts',
    'src/fluent/script-includes/ih-scan-util.now.ts',
    'test-data/create-test-data.js',
    'test-data/remove-test-data.js',
    'docs/check-catalogue.md',
];
const unknown = new Set();
for (const file of files) {
    const before = fs.readFileSync(file, 'utf8');
    let count = 0;
    const after = before.replace(/IH-(\d{3})/g, (all, n) => {
        if (mapping[n]) { count++; return 'IH-' + mapping[n]; }
        if (dropped.includes(n)) { count++; return 'DROPPED-' + n; }
        unknown.add(n);
        return all;
    });
    console.log(file + ': ' + count + ' replacement(s)');
    if (process.argv.includes('--write')) fs.writeFileSync(file, after);
}
if (unknown.size) console.log('UNKNOWN numbers (not changed): ' + [...unknown].join(', '));
console.log('checks: ' + numbers.length + ', renumbered: ' + Object.keys(mapping).filter(n => mapping[n] !== n).length);
console.log('MAPPING ' + JSON.stringify(mapping));
