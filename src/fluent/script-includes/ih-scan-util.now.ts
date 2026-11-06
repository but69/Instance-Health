import { ScriptInclude } from '@servicenow/sdk/core'

// Shared helper for the scan checks: the "custom" rule (IH-003, IH-010 to IH-016, IH-019, IH-021),
// the line-by-line reporting of regex matches in scripts, and the baseline checks (IH-025 to IH-029).
export const ihScanUtil = ScriptInclude({
    $id: Now.ID['ih-scan-util'],
    name: 'IHScanUtil',
    apiName: 'x_bits2_inst_hlth.IHScanUtil',
    accessibleFrom: 'package_private',
    active: true,
    description:
        'Helper for the Instance Health scan checks. isCustom() decides whether a record is customer code; checkScript() and reportLines() report every matching script line in finding_details.',
    script: `var IHScanUtil = Class.create();
IHScanUtil.prototype = {
    APP_SCOPE: 'x_bits2_inst_hlth',
    MAX_LINES: 20,
    MAX_LINE_LENGTH: 200,
    MAX_DETAILS: 7900,
    SKIP_TABLES: ['scan_column_type_check', 'scan_script_only_check', 'scan_table_check', 'scan_linter_check',
        'sys_script_execution_history', 'sys_update_xml', 'sys_update_version'],

    initialize: function() {
        this._updateCache = {};
        this._ownAppId = null;
    },

    // Custom = record from a customer scoped app (not this app), or a global record with a
    // customer update (sys_update_xml, application global). Plugins, store apps and the base
    // system never count. Agreed with the user 2026-11-05 (IH-003) and 2026-11-06 (batch 2).
    isCustom: function(gr) {
        if (!gr || !gr.isValidRecord() || !gr.isValidField('sys_package')) return false;
        var pkg = gr.getValue('sys_package');
        if (!pkg) return false;
        if (pkg == 'global') return this._hasGlobalCustomerUpdate(gr.getValue('sys_update_name'));
        if (pkg == this._getOwnAppId()) return false;
        return gr.sys_package.sys_class_name + '' == 'sys_app';
    },

    // ColumnTypeCheck helper: report all lines of columnValue that match regex, for custom records only
    checkScript: function(engine, current, columnValue, regex) {
        if (!columnValue || !this._test(regex, columnValue)) return;
        if (this.SKIP_TABLES.indexOf(current.getRecordClassName()) > -1) return;
        if (!this.isCustom(current)) return;
        var lines = this.matchingLines(columnValue, regex);
        if (lines.length > 0) this.reportLines(engine, current, lines, '');
    },

    // Every line that matches regex after comments are removed, as "line N: <code>"
    matchingLines: function(text, regex) {
        var original = (text + '').split('\\n');
        var clean = this.stripComments(text + '').split('\\n');
        var out = [];
        for (var i = 0; i < clean.length; i++) {
            if (!this._test(regex, clean[i])) continue;
            var code = (original[i] || '').replace(/^\\s+|\\s+$/g, '');
            if (code.length > this.MAX_LINE_LENGTH) code = code.substring(0, this.MAX_LINE_LENGTH) + '...';
            out.push('line ' + (i + 1) + ': ' + code);
        }
        return out;
    },

    // Remove block and line comments but keep the line breaks, so line numbers stay correct.
    // "//" after ":" is kept (URLs such as https://...).
    stripComments: function(text) {
        var noBlocks = text.replace(/\\/\\*[\\s\\S]*?\\*\\//g, function(match) {
            return match.replace(/[^\\n]/g, '');
        });
        return noBlocks.replace(/(^|[^:\\\\])\\/\\/.*$/gm, '$1');
    },

    reportLines: function(engine, record, lines, intro) {
        var shown = lines.slice(0, this.MAX_LINES);
        var details = (intro ? intro + '\\n' : '') + shown.join('\\n');
        if (lines.length > shown.length)
            details += '\\n... and ' + (lines.length - shown.length) + ' more line(s)';
        engine.finding.setCurrentSource(record);
        engine.finding.setValue('finding_details', details.substring(0, this.MAX_DETAILS));
        engine.finding.increment();
    },

    // IH-025 to IH-029: ServiceNow records that were changed, from the platform's own list
    // sys_metadata_customization (author_type ServiceNow = record shipped by ServiceNow)
    reportBaselineChanges: function(engine, classNames) {
        var changed = new GlideRecord('sys_metadata_customization');
        changed.addQuery('author_type', 'ServiceNow');
        changed.addQuery('sys_metadata.sys_class_name', 'IN', classNames.join(','));
        changed.query();
        while (changed.next()) {
            var className = changed.sys_metadata.sys_class_name + '';
            var record = new GlideRecord(className);
            if (!record.isValid() || !record.get(changed.getValue('sys_metadata'))) continue;
            engine.finding.setCurrentSource(record);
            engine.finding.setValue('finding_details', 'ServiceNow ' + record.getClassDisplayValue() + ' changed by the customer (package ' +
                record.sys_package.getDisplayValue() + ', last updated ' + record.getValue('sys_updated_on') + ' by ' + record.getValue('sys_updated_by') + ')');
            engine.finding.increment();
        }
    },

    _test: function(regex, text) {
        regex.lastIndex = 0;
        return regex.test(text);
    },

    _hasGlobalCustomerUpdate: function(updateName) {
        if (!updateName) return false;
        if (this._updateCache.hasOwnProperty(updateName)) return this._updateCache[updateName];
        var upd = new GlideRecord('sys_update_xml');
        upd.addQuery('name', updateName);
        upd.addQuery('application', 'global');
        upd.setLimit(1);
        upd.query();
        var found = upd.hasNext();
        this._updateCache[updateName] = found;
        return found;
    },

    _getOwnAppId: function() {
        if (this._ownAppId === null) {
            var app = new GlideRecord('sys_scope');
            this._ownAppId = app.get('scope', this.APP_SCOPE) ? app.getUniqueValue() : '';
        }
        return this._ownAppId;
    },

    type: 'IHScanUtil'
};`,
})
