## Plan: Add Comprehensive JSDoc Documentation to n4s-schema

This plan adds JSDoc comments throughout the n4s-schema codebase, with focus on external exports that appear in built types. The documentation will provide clear API guidance for library users and improve IDE intellisense support.

**Phases: 7**

1. **Phase 1: Document Main API Exports (n4s-schema.ts)**
   - **Objective:** Add JSDoc comments to the primary exports: `enforce`, `compose`, and `ctx`
   - **Files/Functions to Modify/Create:**
     - `src/n4s-schema.ts`: Document `enforce`, `enforce.extend`, `enforce.context`, `compose`, and `ctx` export
   - **Tests to Write:** No new tests needed (already has 920 passing tests)
   - **Steps:**
     1. Add JSDoc to `enforce` constant explaining the dual API (eager/lazy)
     2. Add JSDoc to `enforce.extend` method explaining custom rule extension
     3. Add JSDoc to `enforce.context` method explaining context access
     4. Add JSDoc to re-exported `compose` function
     5. Add JSDoc to re-exported `ctx` export
     6. Run tests to verify no breakage

2. **Phase 2: Document Core Utility Classes**
   - **Objective:** Add JSDoc to RuleInstance and RuleRunReturn classes that are fundamental to the API
   - **Files/Functions to Modify/Create:**
     - `src/utils/RuleInstance.ts`: Document class and `create` method
     - `src/utils/RuleRunReturn.ts`: Document class, constructor, and static methods (`create`, `Passing`, `Failing`)
   - **Tests to Write:** No new tests needed
   - **Steps:**
     1. Add class-level JSDoc to `RuleInstance` explaining its purpose
     2. Document `RuleInstance.create` static method
     3. Add class-level JSDoc to `RuleRunReturn` explaining validation results
     4. Document `RuleRunReturn.create`, `Passing`, and `Failing` methods with examples
     5. Run tests to verify no breakage

3. **Phase 3: Document Lazy API Functions**
   - **Objective:** Add JSDoc to lazy.ts, compose.ts explaining builder pattern API
   - **Files/Functions to Modify/Create:**
     - `src/lazy.ts`: Document `enforceLazy` export
     - `src/compose.ts`: Document `compose` function
   - **Tests to Write:** No new tests needed
   - **Steps:**
     1. Add JSDoc to `enforceLazy` explaining the lazy/builder pattern
     2. Add JSDoc to `compose` function with usage examples
     3. Document type exports for lazy API
     4. Run tests to verify no breakage

4. **Phase 4: Document Eager API Functions**
   - **Objective:** Add JSDoc to eager.ts explaining imperative validation API
   - **Files/Functions to Modify/Create:**
     - `src/eager.ts`: Document `enforceEager` function
     - `src/extendLogic.ts`: Document `extendEnforce` function
   - **Tests to Write:** No new tests needed
   - **Steps:**
     1. Add JSDoc to `enforceEager` explaining the eager/imperative API
     2. Add JSDoc explaining the `message` method for custom error messages
     3. Document `extendEnforce` function for custom rule extension
     4. Run tests to verify no breakage

5. **Phase 5: Document Type Validation Rules**
   - **Objective:** Add JSDoc to all type-checking rules (isArray, isString, isNumber, isBoolean, isNull, isNullish, isUndefined, isNumeric)
   - **Files/Functions to Modify/Create:**
     - `src/rules/array/isArrayRule.ts`: `isArray`, `isNotArray`
     - `src/rules/string/isString.ts`: `isString`
     - `src/rules/number/isNumber.ts`: `isNumber`
     - `src/rules/boolean/isBoolean.ts`: `isBoolean`
     - `src/rules/nullish/isNull.ts`, `isUndefined.ts`, `isNullish.ts`
     - `src/rules/numeric/isNumeric.ts`: `isNumeric`
     - `src/rules/general/isNotNumber.ts`, `isNotString.ts`, `isNotBoolean.ts`, `isNotNull.ts`, `isNotUndefined.ts`, `isNotNullish.ts`, `isNotNumeric.ts`, `isNotArray.ts`
   - **Tests to Write:** No new tests needed
   - **Steps:**
     1. Add JSDoc to all `isType` functions with type guard information
     2. Add JSDoc to all `isNotType` negation functions
     3. Include usage examples showing both eager and lazy APIs
     4. Run tests to verify no breakage

6. **Phase 6: Document Comparison and Schema Rules**
   - **Objective:** Add JSDoc to comparison rules and schema validation rules
   - **Files/Functions to Modify/Create:**
     - `src/rules/commonComparison.ts`: `equals`, `notEquals`, `greaterThan`, `lessThan`, etc.
     - `src/rules/commonLength.ts`: `minLength`, `maxLength`, `lengthEquals`, etc.
     - `src/rules/schemaRules/shape.ts`: `shape` function
     - `src/rules/schemaRules/loose.ts`: `loose` function
     - `src/rules/schemaRules/partial.ts`: `partial` function
     - `src/rules/schemaRules/optional.ts`: `optional` function
     - `src/rules/schemaRules/isArrayOf.ts`: `isArrayOf` function
     - `src/rules/compoundRules/allOf.ts`, `anyOf.ts`, `noneOf.ts`, `oneOf.ts`
   - **Tests to Write:** No new tests needed
   - **Steps:**
     1. Add JSDoc to all comparison rules with parameter descriptions
     2. Add JSDoc to length validation rules
     3. Document schema validation rules (`shape`, `loose`, `partial`, `optional`, `isArrayOf`)
     4. Document compound rules (`allOf`, `anyOf`, `noneOf`, `oneOf`)
     5. Include usage examples for complex schema validations
     6. Run tests to verify no breakage

7. **Phase 7: Document Remaining Rules and Context**
   - **Objective:** Complete documentation for all remaining rules and context utilities
   - **Files/Functions to Modify/Create:**
     - `src/enforceContext.ts`: Document context API
     - `src/rules/general/*.ts`: All general rules (`isEmpty`, `isTruthy`, `isFalsy`, `condition`, etc.)
     - `src/rules/string/*.ts`: String-specific rules (`startsWith`, `endsWith`, `matches`, `isBlank`, etc.)
     - `src/rules/number/*.ts`: Number-specific rules (`isPositive`, `isNegative`, `isEven`, `isOdd`, `isBetween`, etc.)
     - `src/rules/object/*.ts`: Object rules (`isKeyOf`, `isValueOf`, etc.)
     - `src/rules/array/*.ts`: Array rules (`includes`, etc.)
   - **Tests to Write:** No new tests needed
   - **Steps:**
     1. Add JSDoc to context API exports
     2. Document all general utility rules
     3. Document string-specific validation rules
     4. Document number-specific validation rules
     5. Document object validation rules
     6. Document array-specific rules
     7. Run full test suite to verify no breakage
     8. Run tests without coverage flag to verify all still pass

**Open Questions:**

1. Should we include `@example` tags with code snippets for the main API functions, or keep documentation concise?
2. Should we document internal utility functions, or only public-facing exports?
3. Should type-only exports receive JSDoc comments, or focus solely on runtime exports?
