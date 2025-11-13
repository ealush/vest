## Plan: Add Schema Support to Vest Suite Creation

Add the ability to pass an enforce schema (from `enforce.shape()`, `enforce.loose()`, or `enforce.partial()`) as an optional parameter to `createSuite`. The schema will provide type inference for the suite's data parameter. Also removes the optional suite name parameter for Vest 6 simplification.

**Phases: 5**

---

## Phase 1: Update n4s types and build

**Objective:** Ensure n4s schema types are properly exported and available for vest to use

**Files/Functions to Modify/Create:**

- `/Users/ealush/dev/vest/packages/n4s/src/rules/schemaRules/shape.ts` - Verify exports
- `/Users/ealush/dev/vest/packages/n4s/src/n4s.ts` - Ensure schema types are exported
- `/Users/ealush/dev/vest/packages/n4s/src/utils/RuleInstance.ts` - Verify RuleInstance exports

**Tests to Write:**

- Test that `RuleInstance` type is accessible from n4s
- Test that `typeof schema.infer` works with schema rules
- Test that schema types can be imported in other packages

**Steps:**

1. Write tests to verify schema type exports work correctly
2. Run tests with `yarn test run` to see them fail (if any issues)
3. Update exports if needed to expose `RuleInstance` and schema types
4. Rebuild n4s package with `yarn vx build -p n4s`
5. Run tests again to confirm they pass
6. Run `yarn lint` to verify code style
7. Run `npx tsc ./packages/n4s --noEmit` to verify types compile

---

## Phase 2: Update Suite types to support schema parameter

**Objective:** Add schema generic parameter to Suite types and extract inferred data type. Add `types` property to SuiteResult for runtime type information.

**Files/Functions to Modify/Create:**

- `/Users/ealush/dev/vest/packages/vest/src/suite/SuiteTypes.ts` - Add schema generic, conditional data type
- `/Users/ealush/dev/vest/packages/vest/src/suiteResult/SuiteResultTypes.ts` - Add `types` property to SuiteResult
- `/Users/ealush/dev/vest/packages/vest/src/suiteResult/suiteResult.ts` - Add `types` to result object
- Create: `/Users/ealush/dev/vest/packages/vest/src/suite/__tests__/schema.types.test.ts` - Type tests

**Tests to Write:**

- Test suite with `enforce.shape()` schema infers correct data type
- Test suite with `enforce.loose()` schema infers correct data type
- Test suite with `enforce.partial()` schema infers correct data type
- Test suite without schema accepts any data type (backward compatibility)
- Test schema type is properly reflected in callback parameters
- Test `types` property exists in suite result
- Test `types` property contains the inferred type information

**Steps:**

1. Write type tests for schema-based type inference (will fail compilation initially)
2. Add schema generic parameter `S extends RuleInstance<any> | undefined = undefined` to `Suite` type
3. Add conditional type helper: `type InferSchemaData<S> = S extends RuleInstance<infer D> ? D : any`
4. Update `Suite` type to use inferred data type in callback constraint
5. Update `SuiteResult` type to include optional `types` property
6. Update `constructSuiteResultObject` to include `types` when schema provided
7. Run `npx tsc ./packages/vest --noEmit` to verify types compile
8. Run tests with `yarn test run` to confirm type inference works

---

## Phase 3: Update createSuite implementation

**Objective:** Remove suite name parameter, add schema parameter, store schema for future validation (with TODO comment)

**Files/Functions to Modify/Create:**

- `/Users/ealush/dev/vest/packages/vest/src/suite/createSuite.ts` - Update signature and implementation
- `/Users/ealush/dev/vest/packages/vest/src/suite/__tests__/create.test.ts` - Update tests
- Create: `/Users/ealush/dev/vest/packages/vest/src/suite/__tests__/createWithSchema.test.ts` - Schema-specific tests

**Tests to Write:**

- Test suite creation without schema (backward compatibility)
- Test suite creation with `enforce.shape()` schema
- Test suite creation with `enforce.loose()` schema
- Test suite creation with `enforce.partial()` schema
- Test suite with schema provides proper TypeScript types in callback
- Test suite result includes `types` property when schema provided
- Test suite result `types` property is undefined when no schema

**Steps:**

1. Write failing tests for new schema parameter API
2. Remove suite name function overload from `createSuite`
3. Add new signature: `createSuite<F, G, T, S>(callback: T, schema?: S): Suite<F, G, T, S>`
4. Update argument parsing (no longer need to reverse/extract name)
5. Store schema in suite state/context if provided
6. Add TODO comment for future schema validation: `// TODO: Implement automatic schema validation on suite.run()`
7. Pass schema to `constructSuiteResultObject` for `types` property
8. Update existing tests to remove suite name parameter
9. Run `yarn test run` to confirm tests pass
10. Run `npx tsc ./packages/vest --noEmit` to verify types compile
11. Run `yarn lint` to check code style

---

## Phase 4: Remove suite name from all existing usages

**Objective:** Update all vest test files and examples to remove suite name parameter

**Files/Functions to Modify/Create:**

- All test files in `/Users/ealush/dev/vest/packages/vest/**/__tests__/**/*.test.ts`
- All test files in `/Users/ealush/dev/vest/packages/*/src/**/__tests__/**/*.test.ts`
- Example files and integration tests throughout the codebase

**Tests to Write:**

- No new tests, but verify all existing tests still pass after updates

**Steps:**

1. Search for all occurrences of `create(` or `createSuite(` in packages directory
2. Use grep to find: `grep -r "create\s*\(\s*['\"]" packages/`
3. Identify calls with suite name as first string parameter
4. Remove suite name parameter from each call (automated search/replace where possible)
5. Handle edge cases where suite name was stored in variable
6. Run `yarn test run` to ensure all tests pass
7. Fix any failing tests one by one
8. Run `yarn lint` to check code style
9. Fix any linting issues
10. Verify with `npx tsc ./packages/vest --noEmit`

---

## Phase 5: Update documentation

**Objective:** Document new schema parameter and remove suite name from all documentation

**Files/Functions to Modify/Create:**

- `/Users/ealush/dev/vest/website/docs/writing_your_suite/vests_suite.md` - Update createSuite API
- `/Users/ealush/dev/vest/website/docs/typescript_support.md` - Add schema type inference examples
- `/Users/ealush/dev/vest/website/docs/enforce/builtin-enforce-plugins/schema_rules.md` - Add vest integration note
- `/Users/ealush/dev/vest/website/docs/get_started.md` - Update examples
- `/Users/ealush/dev/vest/website/docs/api_reference.md` - Update API signatures
- Any versioned docs that need updating

**Tests to Write:**

- No tests, but manually verify documentation examples are correct

**Steps:**

1. Search for suite name references: `grep -r "create\s*\(\s*['\"]" website/docs/`
2. Remove suite name from all code examples in docs
3. Add new section in `vests_suite.md`: "Using Schemas for Type Safety"
4. Document the schema parameter with examples:
   - Basic usage with `enforce.shape()`
   - Using `enforce.loose()` for flexible objects
   - Using `enforce.partial()` for optional fields
5. Add TypeScript section showing type inference in action
6. Update `typescript_support.md` with schema inference examples
7. Add note in `schema_rules.md` about integration with vest suites
8. Update `get_started.md` to show modern API (no suite name)
9. Update `api_reference.md` with new signature
10. Add note about `types` property in suite result
11. Review all changes for accuracy and completeness
12. Build docs locally to verify: `cd website && yarn build`

---

## Open Questions: RESOLVED

1. **Schema validation** → Add TODO comment for future implementation
2. **Error reporting** → TypeScript handles type safety at compile time
3. **Schema access** → Not exposed, but `types` property added to `SuiteResult` for runtime type information
