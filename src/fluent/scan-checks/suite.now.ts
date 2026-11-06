import { Record } from '@servicenow/sdk/core'
import {
    ih001PublicReports,
    ih018TablesWithoutAcls,
    ih030VirtualCisWithAssets,
    ih031MissingSerialNumbers,
    ih032CreateAssetRules,
    ih033InvalidDiscoverySource,
    ih034ImpersonationInProduction,
    ih036KnowledgeBaseRetireWorkflow,
    ih040InactiveGroupMembers,
    ih041InactiveGroupManager,
    ih042GroupsWithoutMembers,
    ih043DirectRoleAssignments,
    ih044RoleGroupsWithoutType,
    ih048OrphanedCatalogTasks,
    ih049JobsRunAsDeletedUser,
    ih050JobsRunAsInactiveUser,
    ih052SystemLocale,
    ih053SingleCurrencyMode,
    ih054MarkResolved,
    ih055ProblemClosedFields,
    ih058StaleConfigurationItems,
    ih059UnsecuredScriptedRest,
    ih060SecurityUiFilter,
    ih067UsersWithoutLogin,
    ih070UpdateSetAudit,
    ih073UniqueLocationNames,
    ih074CisWithoutName,
    ih079TasksOpenedByInactiveUser,
    ih080ActiveTasksWithClosedDate,
} from './administration.now'
import {
    ih003TooManyClientScripts,
    ih004DataCollectorJobIssues,
    ih008ImportSetRowGrowth,
    ih009GsSqlUsage,
    ih012HardCodedInstanceUrl,
    ih013HardCodedSysIds,
    ih014BeforeRuleUpdates,
    ih016DuplicateScriptIncludes,
    ih022UpgradeSkippedItems,
    ih025BaselineBusinessRules,
    ih026BaselineScriptIncludes,
    ih027BaselineClientScripts,
    ih028BaselineUiMacrosPages,
    ih029BaselineUiActions,
    ih035DuplicateUpdateSetNames,
    ih039ComplexConditions,
    ih046OrphanedDictionaryEntries,
    ih047ListLayoutDuplicatePositions,
    ih057UpdateSetWithoutDescription,
    ih061UiActionComplexConditions,
    ih064ScheduledJobErrors,
    ih069ChangedDictionaryEntries,
    ih071CiClassesWithCustomFields,
    ih072CurrentUpdateInBusinessRules,
    ih078IndirectCurrentUpdate,
} from './maintenance.now'
import {
    ih002SlowReports,
    ih005GlobalUiScripts,
    ih007GlobalClientScripts,
    ih010DotWalkToSysId,
    ih011SynchronousAjax,
    ih015GlobalBusinessRules,
    ih019ReadAclQueries,
    ih020SlaEngineSynchronous,
    ih021SyncOutboundCalls,
    ih023DefaultRowsPerPage,
    ih024SlowScripts,
    ih037BusinessRuleCallstack,
    ih062LargeRemoteTables,
    ih063JobsLongerThanInterval,
    ih065CacheFlush,
    ih068SlowGroupedListReports,
    ih075ConcurrentScheduledImports,
    ih076UiActionOutboundCalls,
    ih077CoalesceWithoutIndex,
} from './performance.now'

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

Record({
    $id: Now.ID['ih-suite-check-001'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih001PublicReports, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-002'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih002SlowReports, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-003'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih003TooManyClientScripts, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-004'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih004DataCollectorJobIssues, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-005'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih005GlobalUiScripts, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-007'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih007GlobalClientScripts, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-008'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih008ImportSetRowGrowth, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-009'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih009GsSqlUsage, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-010'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih010DotWalkToSysId, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-011'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih011SynchronousAjax, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-012'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih012HardCodedInstanceUrl, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-013'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih013HardCodedSysIds, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-014'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih014BeforeRuleUpdates, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-015'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih015GlobalBusinessRules, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-016'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih016DuplicateScriptIncludes, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-018'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih018TablesWithoutAcls, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-019'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih019ReadAclQueries, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-020'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih020SlaEngineSynchronous, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-021'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih021SyncOutboundCalls, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-022'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih022UpgradeSkippedItems, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-023'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih023DefaultRowsPerPage, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-024'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih024SlowScripts, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-025'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih025BaselineBusinessRules, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-026'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih026BaselineScriptIncludes, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-027'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih027BaselineClientScripts, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-028'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih028BaselineUiMacrosPages, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-029'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih029BaselineUiActions, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-030'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih030VirtualCisWithAssets, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-031'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih031MissingSerialNumbers, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-032'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih032CreateAssetRules, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-033'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih033InvalidDiscoverySource, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-034'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih034ImpersonationInProduction, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-035'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih035DuplicateUpdateSetNames, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-036'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih036KnowledgeBaseRetireWorkflow, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-037'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih037BusinessRuleCallstack, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-039'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih039ComplexConditions, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-040'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih040InactiveGroupMembers, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-041'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih041InactiveGroupManager, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-042'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih042GroupsWithoutMembers, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-043'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih043DirectRoleAssignments, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-044'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih044RoleGroupsWithoutType, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-046'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih046OrphanedDictionaryEntries, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-047'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih047ListLayoutDuplicatePositions, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-048'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih048OrphanedCatalogTasks, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-049'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih049JobsRunAsDeletedUser, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-050'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih050JobsRunAsInactiveUser, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-052'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih052SystemLocale, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-053'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih053SingleCurrencyMode, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-054'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih054MarkResolved, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-055'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih055ProblemClosedFields, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-057'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih057UpdateSetWithoutDescription, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-058'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih058StaleConfigurationItems, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-059'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih059UnsecuredScriptedRest, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-060'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih060SecurityUiFilter, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-061'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih061UiActionComplexConditions, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-062'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih062LargeRemoteTables, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-063'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih063JobsLongerThanInterval, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-064'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih064ScheduledJobErrors, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-065'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih065CacheFlush, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-067'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih067UsersWithoutLogin, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-068'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih068SlowGroupedListReports, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-069'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih069ChangedDictionaryEntries, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-070'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih070UpdateSetAudit, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-071'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih071CiClassesWithCustomFields, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-072'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih072CurrentUpdateInBusinessRules, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-073'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih073UniqueLocationNames, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-074'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih074CisWithoutName, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-075'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih075ConcurrentScheduledImports, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-076'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih076UiActionOutboundCalls, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-077'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih077CoalesceWithoutIndex, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-078'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih078IndirectCurrentUpdate, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-079'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih079TasksOpenedByInactiveUser, score_weight: 1 },
})

Record({
    $id: Now.ID['ih-suite-check-080'],
    table: 'scan_check_suite_check',
    data: { suite: instanceHealthSuite, check: ih080ActiveTasksWithClosedDate, score_weight: 1 },
})
