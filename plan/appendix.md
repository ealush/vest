# Implementation Plan: Cross-Field Validation DX -- `test().dependsOn()`

## 1. Architectural Decision Record (ADR)

- **Goal:** Provide a declarative, chainable API (`test().dependsOn(...fields)`) for cross-field validation. This ensures that dependent fields (e.g., `confirmPassword`) automatically sync their focus and validation state with their dependencies (e.g., `password`).
    
- **Domain Analysis:**
    
    - **Entities:** `TIsolateTest` (the core test node).
        
    - **Value Objects / Interfaces:** `TestReturnValue` (the immutable interface returned from a `test()` execution).
        
- **Key Principles:**
    
    - **Functional-Light JS:** We will avoid mutating the existing test suite state directly. Instead, `dependsOn` will act as a higher-order composer, mapping the new dependencies over the existing functional primitive `include().when()`.
        
    - **DDD (Ubiquitous Language):** `dependsOn` explicitly models the real-world business rule of dependency. The API reads like natural domain language ("This test depends on that field").
        
    - **API Design (Outside-In):** We design the consumer experience first (`test('...').dependsOn('...')`) and build the internals to wrap the underlying `TestRegistry` and `include` system.
        
    - **Clean Code:** We will reject self-referential dependencies early to prevent infinite loops, utilizing invariant guards.
        

---

## 2. Pre-flight Checks

- `[ ] Run full test suite to ensure the baseline is green: npm test`
    
- `[ ] Verify no existing tests are modified (unless strictly required by spec changes, honoring the TDD Golden Rule).`
    

---

## 3. Phased Implementation Checklist

### Phase 1: Domain Modeling & API Typing (Non-Breaking Additions)

_Define the new Interfaces and Value Objects first. We must extend the return type of the `test` function without breaking existing generic `void` assumptions._

> **A. The Test (The Specification)**
> 
> `[ ] Create/Edit packages/vest/src/core/test/__tests__/test.types.test.ts with the following code:`
> 
> TypeScript
> 
> ```
> import { test } from 'vest';
> 
> describe('test() Return Type', () => {
>   it('should return a TestReturnValue object exposing a dependsOn method', () => {
>     const result = test('confirmPassword', 'Passwords must match', () => {});
>     
>     expect(result).toBeDefined();
>     expect(typeof result.dependsOn).toBe('function');
>   });
> });
> ```
> 
> **B. The Implementation (The Logic)**
> 
> `[ ] Create/Edit packages/vest/src/core/test/TestTypes.ts and packages/vest/src/core/test/test.ts to satisfy the test.`
> 
> - Add the `TestReturnValue` interface in the types file.
>     
> 
> TypeScript
> 
> ```
> export interface TestReturnValue {
>   dependsOn: (...fields: string[]) => TestReturnValue;
> }
> ```
> 
> - Update the `test()` function signature to return `TestReturnValue`. Return a stubbed object for now.
>     
> 
> **C. The Verification**
> 
> `[ ] Run failure check: Verify the test fails initially.`
> 
> `[ ] Run success check: npm test packages/vest/src/core/test/__tests__/test.types.test.ts`
> 
> `[ ] Run regression check: npm test`

---

### Phase 2: Core Logic (The `dependsOn` Composer)

_Implement the core logic using pure iteration (mapping) and isolating side-effects to the `include` registry. We must guard against circular references (e.g., a field depending on itself)._

> **A. The Test (The Specification)**
> 
> `[ ] Create/Edit packages/vest/src/core/test/__tests__/dependsOn.test.ts with the following code:`
> 
> TypeScript
> 
> ```
> import { test, create, include, enforce } from 'vest';
> import { ErrorStrings } from 'vest/src/errors/ErrorStrings';
> 
> describe('dependsOn Core Logic', () => {
>   it('should throw an error if a field attempts to depend on itself', () => {
>     const suite = create(() => {
>       expect(() => {
>         test('password', 'valid', () => {}).dependsOn('password');
>       }).toThrow(ErrorStrings.INCLUDE_SELF);
>     });
>     suite();
>   });
> 
>   it('should chain multiple dependencies properly without mutation', () => {
>     const suite = create(() => {
>       const result = test('total', 'Must equal 100', () => {})
>         .dependsOn('a', 'b', 'c');
>       
>       expect(typeof result.dependsOn).toBe('function');
>     });
>     suite();
>   });
> });
> ```
> 
> **B. The Implementation (The Logic)**
> 
> `[ ] Edit packages/vest/src/core/test/test.ts to satisfy the test.`
> 
> - Update the `test` return value to actually wire up the `include().when()` logic.
>     
> - Ensure you import `invariant` and `ErrorStrings`.
>     
> 
> TypeScript
> 
> ```
> // Inside the test() factory:
> const returnValue: TestReturnValue = {
>   dependsOn(...fields: string[]): TestReturnValue {
>     for (const depField of fields) {
>       if (depField === fieldName) {
>         invariant(false, ErrorStrings.INCLUDE_SELF); // Protect the invariant
>       }
>       // Compose over the existing functional primitive
>       include(fieldName).when(depField);
>     }
>     // Return self to allow for immutable-style chaining
>     return returnValue; 
>   }
> };
> 
> return returnValue;
> ```
> 
> **C. The Verification**
> 
> `[ ] Run failure check: Verify the test fails initially.`
> 
> `[ ] Run success check: npm test packages/vest/src/core/test/__tests__/dependsOn.test.ts`
> 
> `[ ] Run regression check: npm test`

---

### Phase 3: Integration & System Validation

_Verify that the newly exposed API correctly triggers the "Focus Sync" and "Dirty-Field Guard" through the Vest Runtime._

> **A. The Test (The Specification)**
> 
> `[ ] Edit packages/vest/src/core/test/__tests__/dependsOn.test.ts to add the integration test:`
> 
> TypeScript
> 
> ```
>   it('should automatically run dependent tests when dependency is focused', () => {
>     const suite = create((data) => {
>       test('password', 'Required', () => {
>         enforce(data.password).isNotEmpty();
>       });
>       
>       test('confirmPassword', 'Must match', () => {
>         enforce(data.confirmPassword).equals(data.password);
>       }).dependsOn('password');
>     });
> 
>     // Run 1: Normal run to dirty the fields
>     suite({ password: '123', confirmPassword: '123' });
>     
>     // Run 2: Focus ONLY on password
>     const res = suite.only('password')({ password: '123', confirmPassword: '456' });
>     
>     // confirmPassword should have run and failed because it depends on password
>     expect(res.hasErrors('confirmPassword')).toBe(true);
>   });
> ```
> 
> **B. The Implementation (The Logic)**
> 
> `[ ] No implementation changes should be required if Phase 2 was correctly mapped to include().when().`
> 
> _This phase proves our architecture holds up—by reusing the existing boundaries (`include().when()`), our integration test should pass purely by wiring the outside-in API._
> 
> **C. The Verification**
> 
> `[ ] Run regression check: npm test`

---

## 4. Final Review

- `[ ] Lint code: npm run lint`
    
- `[ ] Type Check: Verify no 'any' types were introduced. Ensure 'fields' is explicitly typed as 'string[]' (or 'TFieldName[]' if using Suite generic typing).`
    
- `[ ] Export: Ensure 'TestReturnValue' is exported from the main package index/barrel file if required by consumers.`
    
- `[ ] Create summary file: ./plans/cross_field_validation_summary.md`

--------
Based on the Test-Driven Development (TDD) philosophy, our tests _are_ the formal specification for the `test().dependsOn()` feature.

Drawing from the Architectural Decision Record (ADR), the `10-cross-field-validation.md` requirements, and the final review constraints, here is the comprehensive list of tests required to prove this feature is complete and robust.

They are categorized by their architectural boundaries:

### 1. API & Type Contract Tests (Non-Breaking Additions)

_These tests ensure the Outside-In API design is correctly typed and accessible without breaking existing implementations._

- **`it('should return a TestReturnValue object exposing a dependsOn method')`**
    
    - _Purpose:_ Verifies that calling `test(...)` now returns an object with the `dependsOn` function, rather than `void`, and that the TypeScript compiler accepts this.
        

### 2. Core Logic & Domain Invariant Tests

_These tests verify the pure functional composition and ensure business rules (like preventing infinite loops) are strictly enforced._

- **`it('should throw an error if a field attempts to depend on itself')`**
    
    - _Purpose:_ Protects the domain invariant. Prevents circular dependencies (`A` depends on `A`) which would cause a maximum call stack size exceeded error.
        
- **`it('should chain multiple dependencies properly without mutation')`**
    
    - _Purpose:_ Verifies that `test().dependsOn('a', 'b', 'c')` correctly maps all dependencies to the underlying registry without mutating shared state, and allows for further method chaining if needed.
        
- **`it('should handle a single dependency correctly')`**
    
    - _Purpose:_ Baseline sanity check for the most common use case (e.g., `confirmPassword` depends on `password`).
        

### 3. Integration & System Behavior Tests (The 3 Pillars)

_These tests verify that `dependsOn` correctly hooks into the Vest Runtime, specifically the `include` and `focus` systems._

- **`it('should automatically run dependent tests when dependency is focused')`**
    
    - _Purpose:_ Tests **Pillar 1 (Focus Sync)**. Proves that if we run `suite.only('password')`, the `confirmPassword` test runs automatically.
        
- **`it('should not run the dependent test if neither it nor its dependencies are focused')`**
    
    - _Purpose:_ Tests **Pillar 2 (Dirty-Field Guard)**. Proves that a dependent field won't prematurely validate (and show an error) unless the user has actually interacted with it or its dependency.
        
- **`it('should invalidate dependent test if dependency fails')`**
    
    - _Purpose:_ Tests **Pillar 3 (Validity Link)**. Ensures a dependent field cannot achieve a "valid" status if the field it relies upon is currently failing.
        

### 4. Edge Cases & Ecosystem Coexistence Tests

_These regression and edge-case tests are mandated by our Final Review checklist to ensure the new API plays nicely with advanced Vest features._

- **`it('should work correctly alongside manual include().when() calls')`**
    
    - _Purpose:_ Ensures that adding `dependsOn` does not overwrite or corrupt custom inclusion logic defined elsewhere in the suite.
        
- **`it('should respect group isolation when using dependsOn')`**
    
    - _Purpose:_ Verifies that if a dependent test and its dependency exist inside a `group()`, the dependency graph respects the group boundaries.
        
- **`it('should correctly await and resolve dependencies that are asynchronous tests')`**
    
    - _Purpose:_ Ensures that if `password` is an async test (e.g., checking a database), the `confirmPassword` test waits for the resolution state appropriately.
        

---

**Architect's Note for Implementation:** Do not write the implementation code first. You must write these `it(...)` blocks into your test files (`dependsOn.test.ts` and `test.types.test.ts`), watch them fail in your console (Red), and only then write the minimal code in `test.ts` to make them pass (Green).