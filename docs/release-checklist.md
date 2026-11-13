# Release checklist: Instance Health on a customer instance

App scope `x_bits2_inst_hlth`. Source instance: bithawkdemo1 (alias `but-o`).
Rule: nothing is deployed or published without the user's approval.

## 0. Decide first

- [ ] Customer name and target instance: ______________________
- [ ] Customer agrees to the install, the scan load and the findings (written approval)
- [ ] Install path: application repository (preferred) / `now-sdk install` with a temporary alias
- [ ] Install window (outside business hours): ______________________

## 1. Prepare the release (repository)

- [ ] `docs/check-catalogue.md` is current; every check in the release is `validated` or knowingly marked otherwise
- [ ] Check IDs are consecutive; the key to visible number mapping is documented in the catalogue
- [ ] Suite file regenerated: `node tools/generate-suite.js src/fluent/scan-checks`
- [ ] Priorities applied: `node tools/set-priorities.js`
- [ ] New setting/share checks are in `SETTING_CHECKS` / `SHARE_CHECKS` of `IHHealthScore`
- [ ] No `$id` key or export name was changed (only names renumbered)
- [ ] Version raised in `package.json` (currently 0.0.1) and noted in this file's release log
- [ ] `npm run build` runs without errors
- [ ] Built XML in `dist/app/update/` checked: ES5 scripts, regex backslashes, `active: true` on records
- [ ] No hardcoded sys_ids, instance names or users from bithawkdemo1 (search `src/` and `dist/`)
- [ ] No test data in the build (`IH-TEST` not found in `dist/`)
- [ ] Git is clean and the release is tagged (`vX.Y.Z`)

## 2. Removed or renumbered checks

- [ ] List the keys removed since the last release (the target deletes their records on upgrade)
- [ ] Customer's own scan results or suite settings do not depend on them

## 3. Compatibility with the target

- [ ] Target release family and patch level compatible with SDK 4.14.0
- [ ] Instance Scan plugin active on the target
- [ ] The tables the checks scan exist on the target (e.g. store apps, ITSM/CSM tables); otherwise accept or remove those checks
- [ ] Customer has no existing app or records with scope `x_bits2_inst_hlth`
- [ ] Cross-scope access: no unexpected cross-scope privilege prompts on install

## 4. Test on a non-production instance first

- [ ] Install the exact release on a test or sub-production instance (second `now-sdk` alias, or the repository)
- [ ] Install log has no errors or skipped records
- [ ] Menu modules visible, checks and suite active
- [ ] Run the suite; compare with bithawkdemo1: runtime, number of findings, no script errors in the system log
- [ ] Every finding links to the record the user must act on
- [ ] Health score table fills; scheduled job runs without errors
- [ ] Load acceptable (job runs every minute; consider a longer interval for production)

## 5. Publish and install

- [ ] User approves the publish
- [ ] Publish the version to the application repository from bithawkdemo1
- [ ] Install on the customer instance via Application Manager (or `now-sdk install --auth <customer alias>`)
- [ ] Remove the temporary auth alias afterwards if one was created

## 6. After the install

- [ ] Install log clean; no errors in the system log for scope `x_bits2_inst_hlth`
- [ ] Roles and ACLs exist (`Acl()` records with role names); a non-admin user sees what is expected
- [ ] Run the suite once, off-peak; check duration and instance performance
- [ ] Review the first findings with the customer; explain priorities (1 = instance-wide, 2 = noticeable, 3 = housekeeping)
- [ ] Health score visible and plausible
- [ ] Customer contact receives: version, install date, what runs and how often

## 7. Rollback

- [ ] Previous version available in the repository (or note "first install")
- [ ] Rollback options agreed: deactivate suite and scheduled job; or install the previous version; or uninstall the app
- [ ] Uninstall impact known (scan results and health score data of the app are lost)

## Release log

| Version | Date | Target | Installed by | Notes |
|---|---|---|---|---|
| | | | | |
