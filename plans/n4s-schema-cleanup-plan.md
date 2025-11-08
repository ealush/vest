\*\*\*\*## Plan: N4S-Schema Codebase Cleanup and Refactoring

This plan addresses redundancies, duplications, dead code, high cyclomatic complexity, and architectural improvements in the n4s-schema package. The goal is to improve maintainability, readability, and adherence to clean code principles while ensuring all tests pass.

**Key Issues Found:**

- Large type-only files: stringRules.ts (103 LOC), numericRules.ts (83 LOC), arrayRules.ts (79 LOC), numberRules.ts (76 LOC)
- Unnecessary array wrapper functions duplicating commonLength logic
- Dead code: `empty` and `notEmpty` functions in array rules (unused)
- High complexity in commonContainer.ts (eslint complexity warnings)
- Repetitive interface patterns across rule type files
- genRuleChain.ts mixing concerns (86 LOC)

**Phases (7 phases)**

1. **Phase 1: Remove Dead Code**

   - **Objective:** Delete unused functions and consolidate redundant wrappers
   - **Files/Functions to Modify/Create:**
     - DELETE: `src/rules/array/empty.ts`, `src/rules/array/notEmpty.ts`
     - MODIFY: `src/rules/arrayRules.ts` (remove exports for empty/notEmpty)
   - **Tests to Write:**
     - Verify existing array rule tests still pass (no test changes needed)
   - **Steps:**
     1. Write test: Run existing array rule tests to establish baseline
     2. See tests pass (baseline confirmation)
     3. Delete `src/rules/array/empty.ts` and `src/rules/array/notEmpty.ts`
     4. Remove empty/notEmpty from arrayRules.ts exports
     5. Run tests to confirm still passing

2. **Phase 2: Consolidate Array Length Wrappers**

   - **Objective:** Eliminate unnecessary array wrapper files by using commonLength directly in arrayRules.ts
   - **Files/Functions to Modify/Create:**
     - DELETE: `src/rules/array/minLength.ts`, `src/rules/array/maxLength.ts`, `src/rules/array/longerThan.ts`, `src/rules/array/longerThanOrEquals.ts`, `src/rules/array/shorterThan.ts`, `src/rules/array/shorterThanOrEquals.ts`, `src/rules/array/lengthEquals.ts`, `src/rules/array/lengthNotEquals.ts`
     - MODIFY: `src/rules/arrayRules.ts` (import directly from commonLength)
   - **Tests to Write:**
     - Test array length rules still work correctly
   - **Steps:**
     1. Write test: Verify array length methods work after consolidation
     2. See test fail (not yet refactored)
     3. Modify arrayRules.ts to import length functions directly from commonLength
     4. Delete individual array length wrapper files
     5. Run tests to confirm passing
     6. Run `yarn run tsconfig` to update import aliases

3. **Phase 3: Extract Generic RuleInstance Type Builder**

   - **Objective:** Create a DRY type utility to reduce repetitive interface patterns
   - **Files/Functions to Modify/Create:**
     - CREATE: `src/rules/RuleInstanceBuilder.ts` with generic type helper
     - MODIFY: `src/rules/stringRules.ts`, `src/rules/numberRules.ts`, `src/rules/numericRules.ts`, `src/rules/arrayRules.ts` to use the builder
   - **Tests to Write:**
     - Type tests to verify interface compatibility
   - **Steps:**
     1. Write type test: Verify rule instance types are preserved
     2. See test fail (builder doesn't exist)
     3. Create RuleInstanceBuilder.ts with generic type builder utility
     4. Refactor stringRules.ts to use builder (reduce from 103 to ~50 LOC)
     5. Run tests and typecheck to confirm passing
     6. Run `yarn run tsconfig` to update import aliases

4. **Phase 4: Refactor Remaining Rule Type Files**

   - **Objective:** Apply generic type builder to remaining large rule files
   - **Files/Functions to Modify/Create:**
     - MODIFY: `src/rules/numericRules.ts` (reduce from 83 to ~40 LOC)
     - MODIFY: `src/rules/numberRules.ts` (reduce from 76 to ~35 LOC)
     - MODIFY: `src/rules/arrayRules.ts` (reduce from 79 to ~35 LOC)
   - **Tests to Write:**
     - Type tests for each refactored rule file
   - **Steps:**
     1. Write type tests: Verify all rule types work correctly
     2. See tests fail (not yet refactored)
     3. Apply RuleInstanceBuilder to numericRules.ts
     4. Apply RuleInstanceBuilder to numberRules.ts
     5. Apply RuleInstanceBuilder to arrayRules.ts
     6. Run tests and typecheck to confirm passing

5. **Phase 5: Reduce Complexity in commonContainer.ts**

   - **Objective:** Break down complex inside/notInside functions to reduce cyclomatic complexity
   - **Files/Functions to Modify/Create:**
     - MODIFY: `src/rules/commonContainer.ts` (extract helper functions)
     - CREATE: `src/rules/commonContainer.test.ts` (colocated tests)
   - **Tests to Write:**
     - Test string containment behavior
     - Test array containment behavior
     - Test array-of-values containment
   - **Steps:**
     1. Write tests: Create comprehensive tests for inside/notInside edge cases
     2. See tests pass (existing behavior)
     3. Extract `isStringContainment`, `isArrayContainment` helper functions
     4. Refactor inside() to use helpers, reducing complexity from 7 to ≤5
     5. Refactor notInside() to use helpers, reducing complexity from 7 to ≤5
     6. Run tests and lint to confirm passing

6. **Phase 6: Split genRuleChain.ts Responsibilities**

   - **Objective:** Separate chain building logic from proxy configuration
   - **Files/Functions to Modify/Create:**
     - CREATE: `src/rules/chainBuilder/chainBuilder.ts` (~40 LOC)
     - MODIFY: `src/rules/genRuleChain.ts` (keep only public API, ~30 LOC)
     - MODIFY: `src/rules/chainBuilder/proxyHandlers.ts` (import from new location)
   - **Tests to Write:**
     - Test chain building API still works
   - **Steps:**
     1. Write test: Verify genRuleChain API preserved
     2. See test pass (baseline)
     3. Extract createChainBuilder to new chainBuilder.ts file
     4. Update genRuleChain.ts to import and use chainBuilder
     5. Update imports in proxyHandlers.ts and other consumers
     6. Run tests to confirm passing
     7. Run `yarn run tsconfig` to update import aliases

7. **Phase 7: Reduce Complexity in partial.ts**
   - **Objective:** Extract validation logic to reduce complexity from current to ≤5
   - **Files/Functions to Modify/Create:**
     - MODIFY: `src/rules/schemaRules/partial.ts`
     - CREATE: `src/rules/schemaRules/partial.test.ts` (move tests if not colocated)
   - **Tests to Write:**
     - Test partial schema validation with extra keys
     - Test partial schema validation with missing keys
     - Test partial schema validation with valid subset
   - **Steps:**
     1. Write tests: Ensure comprehensive coverage of partial validation
     2. See tests pass (existing behavior)
     3. Extract `hasExtraKeys` helper function
     4. Extract `validateProvidedKeys` helper function
     5. Refactor partial() to use helpers, reducing complexity to ≤5
     6. Run tests and lint to confirm passing

**Open Questions (3 questions)**

1. Should we create a code generator for rule type interfaces to prevent future duplication? Yes / No / Consider later?
2. The RuleInstanceBuilder generic - prefer type utility or factory function approach?
3. Should array wrappers be kept for better error messages or fully removed for DRY?
