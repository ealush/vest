# Generalized Severities Summary

## Public API Changes

- Added new test severities: `success` and `info`.
- Added new hooks: `success()`, `info()`, `useSuccess()`, and `useInfo()`.
- Added new SuiteResult selectors:
  - `hasSuccesses`, `getSuccesses`
  - `hasInfo`, `getInfo`
  - `hasSuccessesByGroup`, `getSuccessesByGroup`
  - `hasInfoByGroup`, `getInfoByGroup`

## Execution Trace

1. Ran baseline suite (`npm test`) to verify a green starting point.
2. Extended severity domain types with `SUCCESSES` and `INFO` plus corresponding count keys.
3. Extended `VestTest` severity inspection support (`isSuccess`, `isInfo`) and aligned `warn` with `setSeverity`.
4. Added new success/info hooks and exported them from the main `vest` barrel.
5. Updated suite summary aggregation to collect success/info messages only for passing tests.
6. Updated selectors and selector interfaces to expose success/info queries on suite and group levels.
7. Updated severity profile matching so failed success/info tests are not considered blocking `errors`.
8. Added targeted tests for core severity behavior, hook behavior, and selectors.
9. Re-ran targeted tests and full suite validation, then lint.
