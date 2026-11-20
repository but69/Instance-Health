// Sets the priority of every check by its impact on instance health (user request 2026-11-06):
// 1 = largest impact (instance-wide or all users, data exposure without login or ACL, breaks upgrades),
// 2 = noticeable impact (single processes, users or areas), 3 = data quality, housekeeping, maintainability.
// Usage (from the project root): node tools/set-priorities.js [--write]
// Keys are the visible check numbers (IH-NNN without prefix); update them by hand after tools/renumber-checks.js.
const fs = require('fs');
const path = require('path');

const priorities = {
    // 1: largest impact
    '001': 1, // reports published to public: data readable without login
    '005': 1, // global UI scripts: loaded on every page for every user
    '006': 1, // global client scripts: run on every form
    '008': 1, // gs.sql: bypasses ACLs, can lock tables, not supported in upgrades
    '014': 1, // global business rules: evaluated on every transaction
    '017': 1, // tables without ACLs: data only protected by wildcard rules
    '018': 1, // read ACLs with queries: run for every record and field read
    '036': 1, // business rule call stack logging: slows down every transaction
    '057': 1, // scripted REST without authentication or ACL: public or open API
    '061': 1, // jobs longer than their interval: block scheduler workers
    '063': 1, // cache flush in scripts: every user is slower until the cache is rebuilt
    // 2: noticeable impact
    '002': 2, '007': 2, '010': 2, '013': 2, '015': 2, '016': 2, '019': 2, '020': 2, '021': 2, '022': 2, '033': 2, '023': 2,
    '024': 2, '025': 2, '026': 2, '027': 2, '028': 2, '031': 2, '037': 2, '042': 2, '047': 2, '048': 2,
    '050': 2, '051': 2, '052': 2, '053': 2, '058': 2, '062': 2, '064': 2, '065': 2, '066': 2, '069': 2,
    '073': 2, '074': 2,
    // 3: everything else
    '003': 3, '004': 3, '009': 3, '011': 3, '012': 3, '029': 3, '030': 3, '032': 3, '034': 3, '035': 3,
    '038': 3, '039': 3, '040': 3, '041': 3, '043': 3, '044': 3, '045': 3, '046': 3, '049': 3, '054': 3,
    '055': 3, '056': 3, '059': 3, '060': 3, '067': 3, '068': 3, '070': 3, '071': 3, '072': 3,
};

// Points per finding for the per-check score (score = 100 - findings x scoreScale, at least 0),
// used by Instance Scan and by IHHealthScore. Setting checks: one finding means the setting is wrong.
// Information-only checks (INFO_CHECKS in IHHealthScore, e.g. IH-064) keep their priority and scoreScale but are not part of the health score.
// Keep SETTING_CHECKS in sync with IHHealthScore (src/fluent/health-score/health-score.now.ts).
const scaleByPriority = { 1: 20, 2: 5, 3: 2 };
const settingChecks = ['007', '019', '021', '022', '031', '033', '036', '050', '051', '058', '067'];
const scoreScale = id => (settingChecks.includes(id) ? 100 : scaleByPriority[priorities[id]]);

const dir = 'src/fluent/scan-checks';
const seen = new Set();
const changes = [];
for (const f of ['administration', 'maintenance', 'performance']) {
    const file = path.join(dir, f + '.now.ts');
    const before = fs.readFileSync(file, 'utf8');
    const after = before.replace(/(name: 'IH-(\d{3}) [^']*',\s*active: \w+,\s*category: '\w+',\s*priority: ')(\d)(',)(\r?\n\s*scoreScale: \d+,)?/g,
        (all, head, id, old, tail, oldScale) => {
            seen.add(id);
            if (!priorities[id]) throw new Error('No priority defined for IH-' + id);
            if (String(priorities[id]) !== old) changes.push('IH-' + id + ': ' + old + ' -> ' + priorities[id]);
            return head + priorities[id] + tail + '\n    scoreScale: ' + scoreScale(id) + ',';
        });
    if (process.argv.includes('--write')) fs.writeFileSync(file, after);
}
const missing = Object.keys(priorities).filter(id => !seen.has(id));
if (missing.length) throw new Error('Priority defined but check not found: ' + missing.join(', '));
const count = p => Object.values(priorities).filter(v => v === p).length;
console.log('checks: ' + seen.size + ' | priority 1: ' + count(1) + ', 2: ' + count(2) + ', 3: ' + count(3));
console.log('changed: ' + changes.length + '\n' + changes.join('\n'));
