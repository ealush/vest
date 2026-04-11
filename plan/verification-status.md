# Cross-Field Validation Verification Status

Date: 2026-04-11

This file verifies the current `dependsOn` implementation against all planning artifacts in `plan/`:

- `plan/10-cross-field-validation.md`
- `plan/technical-design.md`
- `plan/appendix.md`

## What was checked

1. Plan requirements and checklists were reviewed line-by-line.
2. Implementation files were inspected for API shape and wiring.
3. Required test signals were re-run.

### Commands run

- `yarn vitest run packages/vest/src/core/test/__tests__/dependsOn.test.ts`
- `yarn vitest run packages/vest/src/suite/__tests__/typedSuite.test.ts`
- `yarn tsc --noEmit -p packages/vest/tsconfig.json`

## Verification matrix

### A) API and typing requirements

- ✅ `test()` returns a value exposing `.dependsOn(...)`.
- ✅ `.dependsOn(...)` is chainable (returns same test object).
- ✅ Typed suite method signatures thread `TestReturnValue<F>` in `getTypedMethods.ts`.
- ✅ TypeScript compile check passes for `packages/vest`.

### B) Implementation constraints

- ✅ `dependsOn` delegates via `include(safeFieldName).when(depField)`.
- ✅ Self-dependency guard exists (`ErrorStrings.INCLUDE_SELF` invariant).
- ✅ `useCreateSuiteRunner` remains unaware of `dependsOn`.
- ✅ `suiteSelectors` remain O(1) boolean checks (no graph traversal).

### C) Runtime behavior requirements (3 Pillars + integrations)

Current status from `dependsOn.test.ts`:

- ❌ Pillar 1 focus sync is incomplete (`auto-includes dependent field during focused run` fails).
- ❌ Pillar 2 dirty-field guard behavior is incomplete (`does NOT include dependent field if never tested` sequence fails on expected final inclusion/error assertion).
- ❌ Pillar 3 validity link is incomplete (`dependent invalid when dependency invalid` and recursive invalidation fail).
- ❌ Integration with manual `include().when()` currently fails.
- ❌ Group behavior currently fails.
- ❌ Async behavior currently fails.
- ✅ Self-dependency protection passes.
- ✅ Basic shape + multi-dependency chainability checks pass.

## Gap summary (what is still missing)

The planning docs define completion around passing behavioral signals for cross-field execution and validity propagation. Those signals are currently **not fully met** because 7 `dependsOn` tests still fail.

## Conclusion

The implementation is **partially complete**:

- API surface and typing are in place.
- Core wiring exists.
- Critical runtime guarantees from the plans (especially Pillars 1 and 3) are not fully satisfied yet.

No additional files under `plan/` were found that define extra requirements beyond the three documents listed above.
