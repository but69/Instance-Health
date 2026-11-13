import {
    Acl,
    BooleanColumn,
    ChoiceColumn,
    DateTimeColumn,
    DecimalColumn,
    IntegerColumn,
    MultiLineTextColumn,
    ReferenceColumn,
    ScheduledScript,
    ScriptInclude,
    StringColumn,
    Table,
} from '@servicenow/sdk/core'

// Health score of the instance per run of the scan suite "BiHa-Instance health" (user decision 2026-11-06,
// see docs/check-catalogue.md "Health score"). One record per scan result.
export const x_bits2_inst_hlth_health_score = Table({
    name: 'x_bits2_inst_hlth_health_score',
    label: 'BiHa-Instance Health Score',
    display: 'scan_result',
    schema: {
        scan_result: ReferenceColumn({ label: 'Scan result', referenceTable: 'scan_result', mandatory: true }),
        scan_date: DateTimeColumn({ label: 'Scan date' }),
        health_score: DecimalColumn({ label: 'Health score' }),
        score_uncapped: DecimalColumn({ label: 'Score without knock-out cap' }),
        knock_out: BooleanColumn({ label: 'Knock-out cap applied' }),
        knock_out_checks: StringColumn({ label: 'Knock-out checks', maxLength: 1000 }),
        score_priority_1: DecimalColumn({ label: 'Score priority 1' }),
        score_priority_2: DecimalColumn({ label: 'Score priority 2' }),
        score_priority_3: DecimalColumn({ label: 'Score priority 3' }),
        score_security: DecimalColumn({ label: 'Score security' }),
        score_performance: DecimalColumn({ label: 'Score performance' }),
        score_manageability: DecimalColumn({ label: 'Score manageability' }),
        score_upgradability: DecimalColumn({ label: 'Score upgradability' }),
        checks_evaluated: IntegerColumn({ label: 'Checks evaluated' }),
        findings: IntegerColumn({ label: 'Findings' }),
        checks_failed: StringColumn({ label: 'Checks failed (not counted)', maxLength: 1000 }),
        details: MultiLineTextColumn({ label: 'Deductions per check', maxLength: 8000 }),
    },
})

// One row per health score and dimension (health score and the four category scores), so a dashboard
// filter can choose which trend lines are shown (user request 2026-11-06). Filled by IHHealthScore.
export const x_bits2_inst_hlth_health_score_value = Table({
    name: 'x_bits2_inst_hlth_health_score_value',
    label: 'BiHa-Instance Health Score Value',
    display: 'health_score',
    schema: {
        health_score: ReferenceColumn({ label: 'Health score record', referenceTable: 'x_bits2_inst_hlth_health_score', mandatory: true }),
        scan_date: DateTimeColumn({ label: 'Scan date' }),
        dimension: ChoiceColumn({
            label: 'Trend line',
            choices: {
                health_score: 'Health score',
                security: 'Security',
                performance: 'Performance',
                manageability: 'Manageability',
                upgradability: 'Upgradability',
            },
            dropdown: 'dropdown_with_none',
        }),
        score: DecimalColumn({ label: 'Score' }),
    },
})

// Access only for admin (readRoles etc. on Table do not generate ACLs in SDK 4.14.0, checked in the build)
Acl({
    $id: Now.ID['ih-health-score-value-acl-read'],
    type: 'record',
    table: 'x_bits2_inst_hlth_health_score_value',
    operation: 'read',
    roles: ['admin'],
    description: 'Instance Health: read access to health score values for admin',
})
Acl({
    $id: Now.ID['ih-health-score-value-acl-write'],
    type: 'record',
    table: 'x_bits2_inst_hlth_health_score_value',
    operation: 'write',
    roles: ['admin'],
    description: 'Instance Health: write access to health score values for admin',
})
Acl({
    $id: Now.ID['ih-health-score-value-acl-create'],
    type: 'record',
    table: 'x_bits2_inst_hlth_health_score_value',
    operation: 'create',
    roles: ['admin'],
    description: 'Instance Health: create access to health score values for admin',
})
Acl({
    $id: Now.ID['ih-health-score-value-acl-delete'],
    type: 'record',
    table: 'x_bits2_inst_hlth_health_score_value',
    operation: 'delete',
    roles: ['admin'],
    description: 'Instance Health: delete access to health score values for admin',
})
Acl({
    $id: Now.ID['ih-health-score-acl-read'],
    type: 'record',
    table: 'x_bits2_inst_hlth_health_score',
    operation: 'read',
    roles: ['admin'],
    description: 'Instance Health: read access to health scores for admin',
})
Acl({
    $id: Now.ID['ih-health-score-acl-write'],
    type: 'record',
    table: 'x_bits2_inst_hlth_health_score',
    operation: 'write',
    roles: ['admin'],
    description: 'Instance Health: write access to health scores for admin',
})
Acl({
    $id: Now.ID['ih-health-score-acl-create'],
    type: 'record',
    table: 'x_bits2_inst_hlth_health_score',
    operation: 'create',
    roles: ['admin'],
    description: 'Instance Health: create access to health scores for admin',
})
Acl({
    $id: Now.ID['ih-health-score-acl-delete'],
    type: 'record',
    table: 'x_bits2_inst_hlth_health_score',
    operation: 'delete',
    roles: ['admin'],
    description: 'Instance Health: delete access to health scores for admin',
})

export const ihHealthScore = ScriptInclude({
    $id: Now.ID['ih-health-score'],
    name: 'IHHealthScore',
    apiName: 'x_bits2_inst_hlth.IHHealthScore',
    accessibleFrom: 'package_private',
    active: true,
    description:
        'Calculates the instance health score (0 to 100) from a run of the scan suite "BiHa-Instance health" and stores it in x_bits2_inst_hlth_health_score. calculatePending() handles all finished runs without score.',
    script: `var IHHealthScore = Class.create();
IHHealthScore.prototype = {
    SUITE_NAME: 'BiHa-Instance health',
    SCORE_TABLE: 'x_bits2_inst_hlth_health_score',
    VALUE_TABLE: 'x_bits2_inst_hlth_health_score_value',
    // Weight of a check in the health score and points per finding, by check priority
    WEIGHTS: { '1': 5, '2': 3, '3': 1 },
    DEDUCTIONS: { '1': 20, '2': 5, '3': 2 },
    // If a priority 1 check scores 0, the health score is at most this value (knock-out cap)
    KNOCK_OUT_CAP: 60,
    // A finding means a setting is wrong: score 0 with the first finding
    SETTING_CHECKS: ['IH-007', 'IH-019', 'IH-021', 'IH-022', 'IH-031', 'IH-033', 'IH-036', 'IH-050', 'IH-051', 'IH-058', 'IH-067'],
    // The finding carries a share in %: score = share ('value') or 100 - share ('inverse')
    SHARE_CHECKS: { 'IH-056': 'inverse', 'IH-070': 'value' },

    initialize: function() {},

    // Calculates the score for every finished run of the suite that has none yet. Returns the number calculated.
    calculatePending: function() {
        var suite = this._suite();
        if (!suite) return 0;
        var done = 0;
        var execution = new GlideRecord('scan_suite_execution');
        execution.addQuery('suite', suite.getUniqueValue());
        execution.addQuery('result.state', 'IN', 'complete,failed');
        // The job runs every minute: only look at recent runs to keep it cheap (older runs: call calculate() by hand)
        execution.addQuery('sys_created_on', '>', gs.daysAgo(30));
        execution.query();
        while (execution.next()) {
            var existing = new GlideRecord(this.SCORE_TABLE);
            existing.addQuery('scan_result', execution.getValue('result'));
            existing.setLimit(1);
            existing.query();
            if (existing.hasNext()) continue;
            if (this.calculate(execution.getValue('result'))) done++;
        }
        return done;
    },

    // Calculates and stores the health score of one scan result. Returns the score record or null.
    calculate: function(resultId) {
        var suite = this._suite();
        var result = new GlideRecord('scan_result');
        if (!suite || !result.get(resultId)) return null;

        var all = { sum: 0, weight: 0 };
        var byPriority = {};
        var byCategory = {};
        var deductions = [];
        var failed = [];
        var knockOut = [];
        var findings = 0;
        var evaluated = 0;

        var link = new GlideRecord('scan_check_suite_check');
        link.addQuery('suite', suite.getUniqueValue());
        link.query();
        while (link.next()) {
            var check = new GlideRecord('scan_check');
            if (!check.get(link.getValue('check')) || check.active != true) continue;
            var id = (check.getValue('name') || '').substring(0, 6);
            var priority = check.getValue('priority') || '3';

            // A check that did not run or failed is not counted (a failed run gets score 100 from the platform)
            var execution = new GlideRecord('scan_check_execution');
            execution.addQuery('result', resultId);
            execution.addQuery('check', check.getUniqueValue());
            execution.query();
            if (!execution.next() || execution.getValue('message')) {
                failed.push(id);
                continue;
            }

            var count = this._countFindings(resultId, check.getUniqueValue());
            var score = this._checkScore(id, priority, count, resultId, check.getUniqueValue());
            var weight = this.WEIGHTS[priority] || 1;
            evaluated++;
            findings += count;
            this._add(all, weight, score);
            this._add(this._bucket(byPriority, priority), weight, score);
            this._add(this._bucket(byCategory, check.getValue('category')), weight, score);
            if (score < 100)
                deductions.push(id + ' (P' + priority + ', ' + check.getValue('category') + '): ' + count + ' finding(s), score ' + this._round(score));
            if (priority == '1' && score == 0) knockOut.push(id);
        }
        if (all.weight == 0) return null;

        var uncapped = all.sum / all.weight;
        var capped = knockOut.length > 0 ? Math.min(uncapped, this.KNOCK_OUT_CAP) : uncapped;
        deductions.sort();

        var record = new GlideRecord(this.SCORE_TABLE);
        record.addQuery('scan_result', resultId);
        record.query();
        var isNew = !record.next();
        if (isNew) {
            record.initialize();
            record.setValue('scan_result', resultId);
        }
        record.setValue('scan_date', result.getValue('sys_created_on'));
        record.setValue('health_score', this._round(capped));
        record.setValue('score_uncapped', this._round(uncapped));
        record.setValue('knock_out', capped < uncapped);
        record.setValue('knock_out_checks', knockOut.join(', '));
        record.setValue('score_priority_1', this._average(byPriority['1']));
        record.setValue('score_priority_2', this._average(byPriority['2']));
        record.setValue('score_priority_3', this._average(byPriority['3']));
        record.setValue('score_security', this._average(byCategory.security));
        record.setValue('score_performance', this._average(byCategory.performance));
        record.setValue('score_manageability', this._average(byCategory.manageability));
        record.setValue('score_upgradability', this._average(byCategory.upgradability));
        record.setValue('checks_evaluated', evaluated);
        record.setValue('findings', findings);
        record.setValue('checks_failed', failed.join(', '));
        record.setValue('details', deductions.join('\\n').substring(0, 7900));
        if (isNew) record.insert(); else record.update();
        this._storeValues(record, {
            health_score: capped,
            security: byCategory.security,
            performance: byCategory.performance,
            manageability: byCategory.manageability,
            upgradability: byCategory.upgradability
        });
        return record;
    },

    // One row per dimension in VALUE_TABLE (trend lines of the dashboard); replaces existing rows
    _storeValues: function(record, values) {
        var old = new GlideRecord(this.VALUE_TABLE);
        old.addQuery('health_score', record.getUniqueValue());
        old.deleteMultiple();
        for (var dimension in values) {
            var value = values[dimension];
            if (value === undefined || value === null) continue;
            var score = typeof value == 'number' ? this._round(value) : this._average(value);
            if (score === '') continue;
            var row = new GlideRecord(this.VALUE_TABLE);
            row.initialize();
            row.setValue('health_score', record.getUniqueValue());
            row.setValue('scan_date', record.getValue('scan_date'));
            row.setValue('dimension', dimension);
            row.setValue('score', score);
            row.insert();
        }
    },

    _checkScore: function(id, priority, count, resultId, checkId) {
        if (count == 0) return 100;
        if (this.SETTING_CHECKS.indexOf(id) > -1) return 0;
        var mode = this.SHARE_CHECKS[id];
        if (mode) {
            var share = this._share(resultId, checkId);
            if (share !== null) return mode == 'value' ? share : Math.max(0, 100 - share);
        }
        return Math.max(0, 100 - count * (this.DEDUCTIONS[priority] || 2));
    },

    // First percentage in the details of the check's finding, e.g. "98.8% unique location names"
    _share: function(resultId, checkId) {
        var finding = new GlideRecord('scan_finding');
        finding.addQuery('result', resultId);
        finding.addQuery('check', checkId);
        finding.setLimit(1);
        finding.query();
        if (!finding.next()) return null;
        var match = /(\\d+(?:\\.\\d+)?)%/.exec(finding.getValue('finding_details') || '');
        return match ? parseFloat(match[1]) : null;
    },

    _countFindings: function(resultId, checkId) {
        var count = new GlideAggregate('scan_finding');
        count.addQuery('result', resultId);
        count.addQuery('check', checkId);
        count.addAggregate('COUNT');
        count.query();
        return count.next() ? parseInt(count.getAggregate('COUNT'), 10) : 0;
    },

    _suite: function() {
        var suite = new GlideRecord('scan_check_suite');
        return suite.get('name', this.SUITE_NAME) ? suite : null;
    },

    _bucket: function(map, key) {
        if (!map[key]) map[key] = { sum: 0, weight: 0 };
        return map[key];
    },

    _add: function(bucket, weight, score) {
        bucket.sum += weight * score;
        bucket.weight += weight;
    },

    _average: function(bucket) {
        return bucket && bucket.weight > 0 ? this._round(bucket.sum / bucket.weight) : '';
    },

    _round: function(value) {
        return Math.round(value * 10) / 10;
    },

    type: 'IHHealthScore'
};`,
})

// Calculates the health score of finished suite runs (a business rule on scan_result is not possible:
// the table does not allow configuration from other scopes)
export const ihHealthScoreJob = ScheduledScript({
    $id: Now.ID['ih-health-score-job'],
    name: 'BiHa-Instance Health - calculate health score',
    active: true,
    frequency: 'periodically',
    executionInterval: { minutes: 1 },
    script: `new x_bits2_inst_hlth.IHHealthScore().calculatePending();`,
})
