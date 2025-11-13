## Phase 3 Complete: Implement createSuite with schema parameter

Successfully implemented the core schema functionality in createSuite, allowing users to pass a schema as the second parameter and get automatic type inference for the suite callback's data parameter. The implementation stores the schema in runtime state and makes it available in the SuiteResult via the `types` property. Maintained backward compatibility with the legacy API.

**Files created/changed:**
- packages/vest/src/suite/createSuite.ts
- packages/vest/src/core/Runtime.ts
- packages/vest/src/suiteResult/suiteResult.ts
- packages/vest/src/suite/__tests__/schema.types.test.ts
- Multiple snapshot files updated with new `types` property

**Functions created/changed:**
- createSuite<F, G, T, S>() - Added schema as optional second parameter, maintained backward compatibility with legacy suite name signature
- useCreateVestState() - Added suiteSchema parameter to store schema in runtime state
- useSuiteSchema() - New function to retrieve schema from runtime state
- useCreateSuiteRunner<F, G, T, S>() - Added schema generic parameter
- useCreateSuiteMethods<F, G, T, S>() - Added schema generic parameter
- useCreateSuiteResult<F, G, S>() - Added schema generic parameter
- constructSuiteResultObject<F, G, S>() - Added schema parameter and types property logic
- useSuiteResultCache<F, G, S>() - Added schema generic parameter

**Tests created/changed:**
- schema.types.test.ts (11 tests) - Comprehensive test coverage for schema functionality
  - Type inference from shape/loose/partial schemas
  - Backward compatibility without schema
  - Types property presence and structure
  - Complex nested schema scenarios
  - Compile-time type checking
- All snapshots updated to include `types` property

**Review Status:** APPROVED

**Backward Compatibility:**
- Legacy API: `createSuite(suiteName, callback)` still works (deprecated)
- New API: `createSuite(callback, schema)` for schema support
- Runtime detection based on first argument type (string vs function)

**Git Commit Message:**
```
feat: Add schema support to createSuite for typed validation

- Added optional schema parameter as second argument to createSuite
- Maintained backward compatibility with legacy suiteName parameter
- Schema flows through runtime state to SuiteResult's types property
- Automatic type inference for suite callback data parameter from schema
- Added useSuiteSchema() to retrieve schema from runtime state
- Types property provides runtime schema metadata when schema is present
- Added TODO comment for future automatic schema validation feature
- All 2014 tests passing (225 test files)
- Successfully builds with no errors
```
