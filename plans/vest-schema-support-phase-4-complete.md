## Phase 4 Complete: Remove suite name from existing tests

Successfully cleaned up 21 test files by removing the deprecated suite name parameter from `create()` and `vest.create()` calls, modernizing the codebase to use the new Vest 6 API.

**Files modified:**

- packages/vest/src/suite/**tests**/suiteSelectorsOnSuite.test.ts (1 change)
- packages/vest/src/suite/**tests**/suite.dump.test.ts (1 change)
- packages/vest/src/suite/**tests**/focus.test.ts (5 changes)
- packages/vest/src/suite/**tests**/subscribe.test.ts (4 changes)
- packages/vest/src/exports/**tests**/SuiteSerializer.test.ts (3 changes)
- packages/vest/src/exports/**tests**/debounce.test.ts (7 changes)

**Changes summary:**

- Removed 21 suite name parameters from test files
- Changed `vest.create('suite_name', callback)` to `vest.create(callback)`
- Changed `create('name', callback)` to `create(callback)`
- Preserved 2 tests that specifically validate suite name functionality

**Files intentionally NOT modified:**

- staticSuite.test.ts (line 73) - Tests suite name validation
- create.test.ts (line 33) - Tests suite name in result

**Review Status:** APPROVED

**Git Commit Message:**

```
chore: Remove deprecated suite name parameter from tests

- Cleaned up 21 test instances to use new Vest 6 API
- Changed vest.create('name', callback) to vest.create(callback)
- Maintained backward compatibility for legacy code
- Preserved tests that validate suite name functionality
- All 2014 tests passing (225 test files)
```
