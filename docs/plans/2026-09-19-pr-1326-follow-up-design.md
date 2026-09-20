# PR 1326 follow-up design

## Scope

Address every still-valid unresolved review thread on PR 1326 and restore a
green performance check without weakening its acceptance thresholds.

## Runtime fixes

- Make `isArrayOf` distinguish `RuleRunReturn` instances from plain result
  objects when a passing result carries `type: undefined`. Class instances
  preserve the input, while an explicit `undefined` on a plain object remains
  a parser output. Cover both cases with a focused regression test.
- When a retained keyed test changes field name during reconciliation, remove
  that isolate from its old registry buckets before mutating the field name.
  Let the existing `ISOLATE_RECONCILED` registration flow add it under the new
  key. Extend the reorder regression test to prove the old registry key no
  longer contains the retained test.

## Validation-gate fix

Make resolved alias checks match both an exact forbidden package root and its
descendants. Preserve alias subpaths. Keep `context` intentionally unmapped
unless a focused self-test shows that mapping it would not reject legitimate
downward dependencies.

## Review and performance disposition

The D13full review thread targets an acceptance-process document removed by the
current head. Resolve it as obsolete rather than restoring that document.

Rerun the failed performance gate. If the stable C12full regression reproduces,
profile and optimize the implementation. If it does not reproduce, retain the
existing thresholds and use the fresh passing evidence. Do not waive or relax a
performance criterion.

## Verification and delivery

Run focused n4s, Vest reconciliation, registry, and boundary-gate tests, then
the relevant broader checks. Commit and push the implementation, resolve only
threads that are fixed or obsolete, and verify the PR's resulting CI state.
