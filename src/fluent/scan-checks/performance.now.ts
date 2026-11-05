import { TableCheck } from '@servicenow/sdk/core'

// IH-005: global UI scripts are loaded on every page
export const ih005GlobalUiScripts = TableCheck({
    $id: Now.ID['ih-005-global-ui-scripts'],
    name: 'IH-005 Global UI scripts',
    active: true,
    category: 'performance',
    priority: '3',
    shortDescription: 'Finds active UI scripts that run globally',
    description:
        'Global UI scripts are loaded on every page and slow down page load for all users. Ideal state: no global UI scripts.',
    table: 'sys_ui_script',
    conditions: 'global=true^active=true',
    resolutionDetails:
        'Load the UI script only where it is needed (on demand via g_ui_scripts or ScriptLoader) and set Global to false.',
})

// IH-007: client scripts on table "global" run on every form and list
export const ih007GlobalClientScripts = TableCheck({
    $id: Now.ID['ih-007-global-client-scripts'],
    name: 'IH-007 Global client scripts',
    active: true,
    category: 'performance',
    priority: '3',
    shortDescription: 'Finds active client scripts that run on table global',
    description:
        'Client scripts on table global run on every form of every table. Ideal state: no client scripts on global.',
    table: 'sys_script_client',
    conditions: 'table=global^active=true',
    resolutionDetails:
        'Move the logic to a client script on the specific table, or into a UI script that is loaded on demand.',
})
