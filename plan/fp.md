# Refactoring Plan: Adopt Result Monad in Internal Functions

## 1\. Establishment of User Intent

The user wants to increase the adoption of the `Result` monad pattern (from `vest-utils`) within the `packages/vest` codebase. The goal is to refactor **10 internal, non-exported functions** to return a `Result` type (`Success` or `Failure`) instead of their current direct return values, and then unwrap these results in their calling functions. This promotes type safety and functional programming principles without altering the public API.

## 2\. Identify Relevant Files and Candidates

Based on the analysis, the following 10 internal functions across 3 files have been selected for refactoring. These functions are internal (not exported) and are used by exported consumers in the same module.

**File 1: `packages/vest/src/suiteResult/selectors/collectFailures.ts`**

1.  `getByFieldName`
2.  `collectAll`

**File 2: `packages/vest/src/suiteResult/selectors/suiteSelectors.ts`**
3\. `getFailure`
4\. `getFailures`
5\. `getFailuresByGroup`
6\. `hasFailures`
7\. `hasFailuresByGroup`

**File 3: `packages/vest/src/core/test/testLevelFlowControl/verifyTestRun.ts`**
8\. `skipTestAndReturn`
9\. `omitTestAndReturn`
10\. `useForceSkipIfInSkipWhen`

## 3\. Unit Test Contract (TDD)

We will create a regression test file `packages/vest/src/__tests__/RefactorRegression.test.ts` to ensure the behavior of the exported consumers remains unchanged.

**Test File:** `packages/vest/src/__tests__/RefactorRegression.test.ts`

```typescript
import { TestSeverity } from 'vestjs-runtime'; // Mock or import if available
import { makeResult } from 'vest-utils';
import { gatherFailures } from '../suiteResult/selectors/collectFailures';
import { suiteSelectors } from '../suiteResult/selectors/suiteSelectors';
import { useVerifyTestRun } from '../core/test/testLevelFlowControl/verifyTestRun';
import { VestTest } from '../core/isolate/IsolateTest/VestTest';
import { IsolateTest } from '../core/isolate/IsolateTest/IsolateTest';

// Mocks to support the test execution
const mockTestObject = (fieldName, severity = 'error_count') => ({
  fieldName,
  [severity]: 1,
});

describe('Refactor Regression Tests', () => {
  describe('collectFailures.ts consumers', () => {
    it('gatherFailures should return specific field failures when fieldName is provided', () => {
      const group = {
        fieldA: { error_count: 1, errors: ['err1'] },
        fieldB: { error_count: 0, errors: [] },
      };
      // @ts-ignore
      const result = gatherFailures(group, 'errors', 'fieldA');
      expect(result).toEqual(['err1']);
    });

    it('gatherFailures should return all failures when fieldName is omitted', () => {
      const group = {
        fieldA: { error_count: 1, errors: ['err1'] },
        fieldB: { error_count: 1, errors: ['err2'] },
      };
      // @ts-ignore
      const result = gatherFailures(group, 'errors');
      expect(result).toEqual({ fieldA: ['err1'], fieldB: ['err2'] });
    });
  });

  describe('suiteSelectors.ts consumers', () => {
    const summary = {
      valid: false,
      error_count: 1,
      warn_count: 0,
      test_count: 1,
      errors: [{ fieldName: 'f1', message: 'e1' }],
      warnings: [],
      groups: {
        g1: {
          f1: { error_count: 1, errors: ['e1'] },
        },
      },
      tests: {
        f1: { error_count: 1, errors: ['e1'], pendingCount: 0, testCount: 1 },
      },
    };

    // @ts-ignore
    const selectors = suiteSelectors(summary);

    it('should correctly retrieve error existence via hasErrors', () => {
      expect(selectors.hasErrors('f1')).toBe(true);
      expect(selectors.hasErrors('f2')).toBe(false);
    });

    it('should correctly retrieve errors via getErrors', () => {
      expect(selectors.getErrors('f1')).toEqual(['e1']);
    });

    it('should correctly retrieve failures by group via hasErrorsByGroup', () => {
      expect(selectors.hasErrorsByGroup('g1')).toBe(true);
      expect(selectors.hasErrorsByGroup('g2')).toBe(false);
    });
  });

  // Note: verifyTestRun tests rely on heavy runtime mocking (VestTest state).
  // We rely on existing integration tests for full coverage, but basic invocation can be tested if feasible.
});
```

## 4\. Step-by-Step Execution Plan

### Step 1: Create Regression Test File

Create the file defined above to verify the current behavior of the code before and after refactoring.

- **Action:** Create `packages/vest/src/__tests__/RefactorRegression.test.ts`.
- **Command:** `yarn test run` (Ensure it passes).

### Step 2: Refactor `collectFailures.ts`

Modify `packages/vest/src/suiteResult/selectors/collectFailures.ts`.

1.  **Import `makeResult` and `Result` from `vest-utils`**.
    ```typescript
    import { isPositive, makeResult, Result } from 'vest-utils';
    ```
2.  **Refactor `getByFieldName`**:
    - Change return type to `Result<string[]>`.
    - Wrap return value in `makeResult.Ok(...)`.
3.  **Refactor `collectAll`**:
    - Change return type to `Result<FailureMessages>`.
    - Wrap return value in `makeResult.Ok(...)`.
4.  **Update `gatherFailures`**:
    - Unwrap the calls to `getByFieldName` and `collectAll`.
    - Example:
      ```typescript
      export function gatherFailures(...): string[] | FailureMessages {
        return (fieldName
          ? getByFieldName(testGroup, severityKey, fieldName)
          : collectAll(testGroup, severityKey)
        ).unwrap();
      }
      ```

### Step 3: Refactor `suiteSelectors.ts`

Modify `packages/vest/src/suiteResult/selectors/suiteSelectors.ts`.

1.  **Import `makeResult` and `Result` from `vest-utils`**.
2.  **Refactor `getFailures`**:
    - Return `Result<FailureMessages | string[]>` (or specific based on overload, but typically `Result<any>` internally if using overloads is complex, or just wrap the implementation result).
    - Wrap calls to `gatherFailures` in `makeResult.Ok`.
3.  **Refactor `getFailuresByGroup`**:
    - Return `Result<GetFailuresResponse>`.
    - Wrap return in `makeResult.Ok`.
4.  **Refactor `hasFailures`**:
    - Return `Result<boolean>`.
    - Wrap return in `makeResult.Ok`.
5.  **Refactor `hasFailuresByGroup`**:
    - Return `Result<boolean>`.
    - Wrap return in `makeResult.Ok`.
6.  **Refactor `getFailure`**:
    - Return `Result<Maybe<SummaryFailure<F, G> | string>>`.
    - Wrap return in `makeResult.Ok`.
7.  **Update `suiteSelectors` factory**:
    - Update all closure methods (`isValid`, `hasErrors`, `getErrors`, etc.) to call `.unwrap()` on the refactored internal functions.
    - Example:
      ```typescript
      function hasErrors(fieldName?: InputFieldName<F>): boolean {
        return hasFailures(
          summary,
          SeverityCount.ERROR_COUNT,
          asFieldName(fieldName),
        ).unwrap();
      }
      ```
    - **Note:** `isValid` and `isValidByGroup` were **not** selected for refactoring (as they contained logic not just delegating), so leave them unless they depend on refactored functions (they do not appear to).

### Step 4: Refactor `verifyTestRun.ts`

Modify `packages/vest/src/core/test/testLevelFlowControl/verifyTestRun.ts`.

1.  **Import `makeResult` and `Result` from `vest-utils`**.
2.  **Refactor `skipTestAndReturn`**:
    - Return `Result<TIsolateTest>`.
    - Wrap return in `makeResult.Ok`.
3.  **Refactor `omitTestAndReturn`**:
    - Return `Result<TIsolateTest>`.
    - Wrap return in `makeResult.Ok`.
4.  **Refactor `useForceSkipIfInSkipWhen`**:
    - Return `Result<TIsolateTest>`.
    - Wrap return in `makeResult.Ok`.
5.  **Update `useVerifyTestRun`**:
    - Call `.unwrap()` on the returns of these functions.
    - Example:
      ```typescript
      if (useShouldSkipBasedOnMode(testData)) {
        return skipTestAndReturn(testObject).unwrap();
      }
      ```

### Step 5: Verify Changes

1.  Run the regression test: `yarn test packages/vest/src/__tests__/RefactorRegression.test.ts`.
2.  Run the full suite: `yarn test run`.
3.  Run type checks: `yarn vx typecheck`.
4.  Run cleanup: Remove `RefactorRegression.test.ts` if desired, or keep it for future safety.

## 5\. Detailed Checklist

- [ ] **Preparation**

  - [ ] Run `yarn build` and `yarn test run` to ensure clean slate.
  - [ ] Create `packages/vest/src/__tests__/RefactorRegression.test.ts` with the provided content.

- [ ] **Refactor `collectFailures.ts`**

  - [ ] Import `{ makeResult, Result }` from `vest-utils`.
  - [ ] Update `getByFieldName` signature to `Result<string[]>`.
  - [ ] Update `getByFieldName` body to return `makeResult.Ok(...)`.
  - [ ] Update `collectAll` signature to `Result<FailureMessages>`.
  - [ ] Update `collectAll` body to return `makeResult.Ok(...)`.
  - [ ] Update `gatherFailures` to `.unwrap()` the results.

- [ ] **Refactor `suiteSelectors.ts`**

  - [ ] Import `{ makeResult, Result }` from `vest-utils`.
  - [ ] Update `getFailures` to return `Result<GetFailuresResponse>`.
  - [ ] Update `getFailuresByGroup` to return `Result<GetFailuresResponse>`.
  - [ ] Update `hasFailures` to return `Result<boolean>`.
  - [ ] Update `hasFailuresByGroup` to return `Result<boolean>`.
  - [ ] Update `getFailure` to return `Result<Maybe<SummaryFailure<F, G> | string>>`.
  - [ ] Update `suiteSelectors` function:
    - [ ] Add `.unwrap()` to `hasErrors` implementation.
    - [ ] Add `.unwrap()` to `hasWarnings` implementation.
    - [ ] Add `.unwrap()` to `hasWarningsByGroup` implementation.
    - [ ] Add `.unwrap()` to `hasErrorsByGroup` implementation.
    - [ ] Add `.unwrap()` to `getWarnings` implementation.
    - [ ] Add `.unwrap()` to `getWarning` implementation.
    - [ ] Add `.unwrap()` to `getErrors` implementation.
    - [ ] Add `.unwrap()` to `getError` implementation.
    - [ ] Add `.unwrap()` to `getErrorsByGroup` implementation.
    - [ ] Add `.unwrap()` to `getWarningsByGroup` implementation.

- [ ] **Refactor `verifyTestRun.ts`**

  - [ ] Import `{ makeResult, Result }` from `vest-utils`.
  - [ ] Update `skipTestAndReturn` to return `Result<TIsolateTest>`.
  - [ ] Update `omitTestAndReturn` to return `Result<TIsolateTest>`.
  - [ ] Update `useForceSkipIfInSkipWhen` to return `Result<TIsolateTest>`.
  - [ ] Update `useVerifyTestRun` to `.unwrap()` calls to the above functions.

- [ ] **Verification**

  - [ ] Run `yarn build` to ensure no build errors.
  - [ ] Run `yarn test run` to pass all tests. (run avoids watch mode)
  - [ ] Run `yarn vx typecheck` to ensure no type errors.
  - [ ] Run `yarn vx typecheck-tests` to ensure no type errors.
