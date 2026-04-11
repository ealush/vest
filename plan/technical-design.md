# Implementation Plan: Cross-Field Validation DX -- `test().dependsOn()`

## 1. Architectural Decision Record (ADR)

* **Goal:** Provide a declarative API (`test().dependsOn(...fields)`) for cross-field validation that ensures dependent fields are accurately validated and reported based on their dependencies.

* **implementation Rules (The 3 Pillars of `dependsOn`):**
    1. **Focus Sync (Pillar 1)**: Whenever a dependency field is focused (or updated), the dependent test must run as well to ensure cross-field logic is fresh.
    2. **Dirty-Field Guard (Pillar 2)**: The dependent test only runs if it has been tested at least once before (`isTested === true`). This prevents "lighting up" fields with errors before the user has interacted with them.
    3. **Validity Link (Pillar 3)**: A dependent field can NEVER be considered valid as long as any of its dependencies are invalid, even if the dependent field's own tests pass.
    4. System is typed: when using a typed suite test method, dependsOn will inherit the types of our suite, and our dependsOn input will be typed/autocompleted accordingly.
       ```
       const { test } = suite;
       ```

* **Domain Analysis:**
    * **Entities:**
        * `TIsolateTest` -- the test node that gains a `.dependsOn` chain method.
        * `VestRuntime` -- stores the persistent `dependencies` map.
        * `TestRegistry` -- used for O(1) dirty-checks during inclusion.
    * **State Extra:**
        * `dependencies` -- a map of `fieldName -> string[]` stored in the suite's persistent state.

* **Key Principles:**
    * **Reactive Logic over Manual wiring.** `dependsOn` replaces the need for manual `include().when()` calls with a more robust, "smart" inclusion logic.
    * **Persistence across focused runs.** Dependencies are stored in the runtime state so that even if a dependent field is omitted in a specific run (e.g., via `suite.only()`), its relationship to its dependencies remains known.
    * **Transitive Focus Propagation.** If `A -> B -> C`, focusing `C` correctly includes `B` and `A`.
    * **Recursive Validity.** Validity is calculated by traversing the dependency graph to ensure no invalid nodes exist upstream.

---

## 2. Pre-flight Checks

* [ ] Run full test suite: `npm run test` -- confirm green baseline
* [ ] Verify no existing tests in `packages/vest/src/core/test/__tests__/` are modified
* [ ] Verify `include.ts` is not modified (we call it, not change it)
* [ ] Confirm `test()` currently returns `TIsolateTest` and callers do not depend on the exact return type (search for `const x = test(` patterns in tests)

---

## 3. Phased Implementation Checklist

### Phase 1: Domain Modeling & Types

Define the `TestReturnValue` type and the `DependsOnConfig` value object.

> **A. The Test (The Specification)**
>
> * [ ] Create test file `packages/vest/src/core/test/__tests__/dependsOn.test.ts`
>
> ```typescript
> import { describe, it, expect } from 'vitest';
> import { create, test, enforce, include } from 'vest';
>
> describe('test().dependsOn() -- type and shape', () => {
>   it('test() returns an object with a dependsOn method', () => {
>     const suite = create((data: { a: string }) => {
>       const result = test('a', () => {
>         enforce(data.a).isNotEmpty();
>       });
>       // The return value must have dependsOn as a function
>       expect(result).toBeDefined();
>       expect(typeof result.dependsOn).toBe('function');
>     });
>     suite({ a: 'hello' });
>   });
>
>   it('dependsOn returns the same chainable object (for future chaining)', () => {
>     const suite = create((data: { a: string; b: string }) => {
>       const result = test('a', () => {
>         enforce(data.a).isNotEmpty();
>       });
>       const chained = result.dependsOn('b');
>       expect(chained).toBe(result);
>     });
>     suite({ a: '', b: '' });
>   });
> });
> ```
>
> **B. The Implementation**
>
> * [ ] Create `packages/vest/src/core/test/TestReturnValue.ts`:
>
> ```typescript
> import { TFieldName } from '../../suiteResult/SuiteResultTypes';
> import { TIsolateTest } from '../isolate/IsolateTest/IsolateTest';
>
> export interface TestReturnValue {
>   /**
>    * Declares that this test depends on the given fields.
>    * When any dependency field is focused (via suite.only()),
>    * this test's field is auto-included.
>    *
>    * Equivalent to calling include(thisField).when(depField)
>    * for each dependency.
>    */
>   dependsOn(...fields: (TFieldName | string)[]): TestReturnValue;
> }
> ```
>
> * [ ] Modify `packages/vest/src/core/test/test.ts` -- change return type from `TIsolateTest` to `TestReturnValue`:
>     * After `IsolateTest(useAttemptRunTest, testObjectInput, key)` call, wrap the result in a `TestReturnValue` object.
>     * The `dependsOn` method is a no-op stub for now (Phase 1 only defines the shape).
>
> ```typescript
> // In test.ts, after creating the isolate:
> const isolate = IsolateTest(useAttemptRunTest, testObjectInput, key);
>
> const returnValue: TestReturnValue = {
>   dependsOn(...fields: (TFieldName | string)[]) {
>     // Phase 2 implements the actual logic
>     return returnValue;
>   },
> };
>
> return returnValue;
> ```
>
> * [ ] Update `packages/vest/src/core/test/test.ts` function overload signatures to return `TestReturnValue` instead of `TIsolateTest`.
>
> **C. The Verification**
>
> * [ ] Run Phase 1 tests: `npx vitest run packages/vest/src/core/test/__tests__/dependsOn.test.ts`
> * [ ] Run existing test suite: `npx vitest run packages/vest/src/core/test/__tests__/` -- confirm no regressions
> * [ ] Confirm TypeScript compiles without errors: `npx tsc --noEmit -p packages/vest/tsconfig.json`

---

### Phase 2: Core Pure Logic -- `dependsOn` wiring

Wire `dependsOn` to call `include(fieldName).when(depField)` for each dependency.

> **A. The Test (The Specification)**
>
> * [ ] Add to `packages/vest/src/core/test/__tests__/dependsOn.test.ts`:
>
> ```typescript
> describe('test().dependsOn() -- inclusion wiring', () => {
>   it('auto-includes dependent field during focused run', () => {
>     const suite = create((data: { password: string; confirmPassword: string }) => {
>       test('password', 'Required', () => {
>         enforce(data.password).isNotEmpty();
>       });
>       test('confirmPassword', 'Must match', () => {
>         enforce(data.confirmPassword).equals(data.password);
>       }).dependsOn('password');
>     });
>
>     // Focus on password -- confirmPassword should be auto-included
>     const result = suite.only('password').run({
>       password: 'abc123',
>       confirmPassword: 'different',
>     });
>
>     expect(result.hasErrors('confirmPassword')).toBe(true);
>     expect(result.getErrors('confirmPassword')).toContain('Must match');
>   });
>
>   it('does not include dependent field when unrelated field is focused', () => {
>     const suite = create((data: { email: string; password: string; confirmPassword: string }) => {
>       test('email', 'Required', () => {
>         enforce(data.email).isNotEmpty();
>       });
>       test('confirmPassword', 'Must match', () => {
>         enforce(data.confirmPassword).equals(data.password);
>       }).dependsOn('password');
>     });
>
>     const result = suite.only('email').run({
>       email: 'test@test.com',
>       password: 'abc',
>       confirmPassword: 'different',
>     });
>
>     expect(result.hasErrors('confirmPassword')).toBe(false);
>   });
>
>   it('works with multiple dependencies', () => {
>     const suite = create((data: { a: string; b: string; total: string }) => {
>       test('a', () => enforce(data.a).isNotEmpty());
>       test('b', () => enforce(data.b).isNotEmpty());
>       test('total', 'Sum must equal 100', () => {
>         enforce(Number(data.a) + Number(data.b)).equals(100);
>       }).dependsOn('a', 'b');
>     });
>
>     // Focus on 'a' -- 'total' should be included
>     const resultA = suite.only('a').run({ a: '30', b: '70', total: '' });
>     expect(resultA.isTested('total')).toBe(true);
>
>     // Focus on 'b' -- 'total' should also be included
>     const resultB = suite.only('b').run({ a: '30', b: '70', total: '' });
>     expect(resultB.isTested('total')).toBe(true);
>   });
>
>   it('dependsOn cannot reference its own field', () => {
>     const suite = create((data: { a: string }) => {
>       // Self-dependency should be ignored (same as include('a').when('a') which throws)
>       expect(() => {
>         test('a', () => enforce(data.a).isNotEmpty()).dependsOn('a');
>       }).toThrow();
>     });
>     suite({ a: '' });
>   });
>
>   it('runs normally without focus (no-op when no .only())', () => {
>     const suite = create((data: { password: string; confirmPassword: string }) => {
>       test('password', 'Required', () => {
>         enforce(data.password).isNotEmpty();
>       });
>       test('confirmPassword', 'Must match', () => {
>         enforce(data.confirmPassword).equals(data.password);
>       }).dependsOn('password');
>     });
>
>     // Full run -- all tests execute regardless of dependsOn
>     const result = suite({ password: 'abc', confirmPassword: 'abc' });
>     expect(result.isValid()).toBe(true);
>   });
> });
> ```
>
> **B. The Implementation**
>
> * [ ] Modify `packages/vest/src/core/test/test.ts` -- implement `dependsOn` body:
>
> ```typescript
> import { include } from '../../hooks/include';
> // ...existing imports...
>
> function vestTest(
>   fieldName: string,
>   ...args: /* existing overloads */
> ): TestReturnValue {
>   const {
>     fieldName: safeFieldName,
>     message,
>     testFn,
>     key,
>   } = validateTestParams(fieldName, ...args).unwrap();
>
>   const testObjectInput = { fieldName: safeFieldName, message, testFn };
>
>   useEmit('TEST_RUN_STARTED');
>
>   IsolateTest(useAttemptRunTest, testObjectInput, key);
>
>   const returnValue: TestReturnValue = {
>     dependsOn(...fields: (TFieldName | string)[]) {
>       for (const depField of fields) {
>         include(safeFieldName).when(depField);
>       }
>       return returnValue;
>     },
>   };
>
>   return returnValue;
> }
> ```
>
> **Key detail:** `include(safeFieldName).when(depField)` is called immediately during suite callback execution. The `include` function internally creates an `IsolateTransient` node that registers the inclusion rule. The `dependsOn` method runs synchronously during the same suite callback invocation, so it is in the correct context.
>
> **C. The Verification**
>
> * [ ] Run: `npx vitest run packages/vest/src/core/test/__tests__/dependsOn.test.ts`
> * [ ] All 5 new tests must pass (green)
> * [ ] Run full test suite: `npx vitest run` -- no regressions

---

### Phase 3: Integration -- Real-World Patterns & Edge Cases

> **A. The Test (The Specification)**
>
> * [ ] Add integration tests to `packages/vest/src/core/test/__tests__/dependsOn.test.ts`:
>
> ```typescript
> describe('test().dependsOn() -- integration', () => {
>   it('confirm password pattern -- full workflow', () => {
>     const suite = create((data: { password: string; confirmPassword: string }) => {
>       test('password', 'Too short', () => {
>         enforce(data.password).longerThan(7);
>       });
>
>       test('confirmPassword', 'Must match password', () => {
>         enforce(data.confirmPassword).equals(data.password);
>       }).dependsOn('password');
>     });
>
>     // User types password -- confirmPassword auto-included
>     const r1 = suite.only('password').run({
>       password: 'longpassword',
>       confirmPassword: '',
>     });
>     expect(r1.hasErrors('password')).toBe(false);
>     expect(r1.hasErrors('confirmPassword')).toBe(true);
>
>     // User types matching confirm
>     const r2 = suite.only('confirmPassword').run({
>       password: 'longpassword',
>       confirmPassword: 'longpassword',
>     });
>     expect(r2.isValid('confirmPassword')).toBe(true);
>   });
>
>   it('date range pattern', () => {
>     const suite = create((data: { startDate: string; endDate: string }) => {
>       test('startDate', 'Required', () => {
>         enforce(data.startDate).isNotEmpty();
>       });
>       test('endDate', 'Required', () => {
>         enforce(data.endDate).isNotEmpty();
>       });
>       test('endDate', 'Must be after start date', () => {
>         enforce(
>           new Date(data.endDate) > new Date(data.startDate),
>         ).isTruthy();
>       }).dependsOn('startDate');
>     });
>
>     const result = suite.only('startDate').run({
>       startDate: '2026-01-01',
>       endDate: '2025-06-01',
>     });
>
>     expect(result.hasErrors('endDate')).toBe(true);
>   });
>
>   it('coexists with manual include().when()', () => {
>     const suite = create((data: { source: string; related: string; dependent: string }) => {
>       include('related').when('source');
>
>       test('source', () => enforce(data.source).isNotEmpty());
>       test('related', () => enforce(data.related).isNotEmpty());
>       test('dependent', () => {
>         enforce(data.dependent).equals(data.source);
>       }).dependsOn('source');
>     });
>
>     const result = suite.only('source').run({
>       source: 'val',
>       related: '',
>       dependent: 'val',
>     });
>
>     expect(result.isTested('related')).toBe(true);
>     expect(result.isTested('dependent')).toBe(true);
>   });
>
>   it('works with groups', () => {
>     const suite = create((data: { password: string; confirmPassword: string }) => {
>       group('auth', () => {
>         test('password', 'Required', () => {
>           enforce(data.password).isNotEmpty();
>         });
>         test('confirmPassword', 'Must match', () => {
>           enforce(data.confirmPassword).equals(data.password);
>         }).dependsOn('password');
>       });
>     });
>
>     const result = suite.only('password').run({
>       password: 'abc',
>       confirmPassword: 'different',
>     });
>
>     expect(result.hasErrors('confirmPassword')).toBe(true);
>   });
>
>   it('dependsOn with async tests', async () => {
>     const suite = create((data: { username: string; profile: string }) => {
>       test('username', 'Required', () => {
>         enforce(data.username).isNotEmpty();
>       });
>       test('profile', 'Username must exist first', async () => {
>         await new Promise((resolve) => setTimeout(resolve, 10));
>         enforce(data.profile).isNotEmpty();
>       }).dependsOn('username');
>     });
>
>     const result = suite.only('username').run({
>       username: 'alice',
>       profile: '',
>     });
>
>     // Wait for async tests to finish
>     await result.done();
>     expect(result.hasErrors('profile')).toBe(true);
>   });
> });
> ```
>
> **B. The Implementation**
>
> * [ ] No additional source changes expected if Phase 2 is correct. The `include().when()` mechanism already handles groups, async, and coexistence with manual includes.
> * [ ] If the self-dependency test (from Phase 2) does not throw via `include`'s invariant (`ErrorStrings.INCLUDE_SELF`), add explicit guard in `dependsOn`:
>
> ```typescript
> dependsOn(...fields: (TFieldName | string)[]) {
>   for (const depField of fields) {
>     if (depField === safeFieldName) {
>       invariant(false, ErrorStrings.INCLUDE_SELF);
>     }
>     include(safeFieldName).when(depField);
>   }
>   return returnValue;
> },
> ```
>
> * [ ] Export `TestReturnValue` type from vest's public API if needed for TypeScript consumers. Check `packages/vest/src/exports/` for the main export barrel.
>
> **C. The Verification**
>
> * [ ] Run full test file: `npx vitest run packages/vest/src/core/test/__tests__/dependsOn.test.ts`
> * [ ] Run entire suite: `npx vitest run`
> * [ ] Verify TypeScript: `npx tsc --noEmit`

---

## 4. Final Review

* [ ] Lint code: `npm run lint`
* [ ] No `any` types introduced (verify `TestReturnValue` uses `TFieldName | string`)
* [ ] No direct mutations of shared state (we only call `include().when()` which handles its own state through `IsolateTransient`)
* [ ] Return type change from `TIsolateTest` to `TestReturnValue` does not break existing callers (search codebase for `const x = test(` patterns)
* [ ] `dependsOn` is purely additive -- no existing behavior is altered
* [ ] Tests cover: single dependency, multiple dependencies, self-reference guard, no-focus no-op, coexistence with manual `include`, groups, async
* [ ] Bundle size impact: minimal (one small object wrapper per `test()` call, no new modules)
* [ ] Tree-shaking: `dependsOn` method is always present on the return value but its `include` import is already in vest's bundle via existing exports
