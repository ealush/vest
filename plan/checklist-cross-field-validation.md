# Cross-field validation implementation checklist

Date: 2026-04-11

## Plan coverage checklist

### API & typing

- [x] `test()` returns chainable value with `.dependsOn(...)`
- [x] Typed suite methods return `TestReturnValue<F>`
- [x] Self-dependency guard enforced (`INCLUDE_SELF`)

### Runtime behavior (3 pillars)

- [ ] Pillar 1 — focused dependency re-runs dependent test with fresh data
- [ ] Pillar 2 — dirty-field guard on focused dependency path
- [x] Pillar 3 — dependent validity reflects upstream invalid dependencies
- [x] Recursive dependency invalidation (`A -> B -> C`)

### Integration expectations

- [ ] Coexists with manual `include().when()` with fresh dependent re-run
- [ ] Works inside groups
- [ ] Works for async dependent tests

### Technical housekeeping

- [x] Dependencies graph persisted in suite state (`SuiteDependencies`)
- [x] Summary carries dependency graph for selector-level validity checks
- [x] Typecheck passes for `packages/vest`

## Current verification commands

- `yarn vitest run packages/vest/src/core/test/__tests__/dependsOn.test.ts` → 5 failing tests
- `yarn vitest run packages/vest/src/suite/__tests__/typedSuite.test.ts` → pass
- `yarn tsc --noEmit -p packages/vest/tsconfig.json` → pass

## Current failing specs (dependsOn)

- `auto-includes dependent field during focused run (Pillar 1)`
- `does NOT include dependent field if it has never been tested before (Pillar 2)` (final focused rerun assertion)
- `coexists with manual include().when() rules`
- `works with groups`
- `works with async tests`

## Iteration notes

- Iteration 1: Added dependency graph propagation + recursive validity checks (Pillar 3 now passing).
- Iteration 2: Added focused flow-control hooks for dependsOn + dirty gating scaffolding.
- Current blocker: focused rerun freshness is still not achieved in runtime reconciliation for dependent tests, which is why the 5 specs above still fail.
