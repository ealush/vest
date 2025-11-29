# Refactoring Plan: Implement StandardSchema Support in n4s

This plan details the steps to integrate `StandardSchema` support into the `n4s` (enforce) package. This will allow `n4s` validators (lazy, schema, and compound rules) to be used interchangeably with other schema validation libraries within the Vest ecosystem.

## 1\. Codebase Exploration & Mapping

**Reference Context:**

- **Target Package:** `packages/n4s`
- **Key Utilities:** `packages/vest-utils/src/suite/standardSchemaSpec.ts` (Contains `StandardSchemaV1` type definition).
- **Consumer:** `packages/vest` (specifically `createSuite`).

**Component Analysis:**

- **`Lazy` (n4s/src/lazy.ts):** currently defines the `run()` method which executes the validation chain. This needs to be renamed to `validate()` and exposed via the `~standard` property.
- **Schema Rules (n4s/src/rules/schemaRules/):** Rules like `shape`, `partial`, `loose` likely return a `Lazy` instance or a similar object with a `run` method.
- **Compound Rules (n4s/src/rules/compoundRules/):** Rules like `allOf`, `anyOf`, `oneOf` behave similarly to schema rules.
- **Types:** The `Lazy` interface in `n4sTypes.ts` (or equivalent) defines the public API of the enforcement chain.

**Change Impact:**

- Renaming `run` to `validate` is a breaking change for internal consumers if not handled carefully.
- The `validate` method must conform to the `StandardSchemaV1` signature (returning a `Result` object rather than just throwing or returning boolean).

---

## 2\. TDD Strategy: The Unit Test Contract

We will create a new test file to strictly define the `StandardSchema` compliance of `n4s` lazy validators.

**File:** `packages/n4s/src/__tests__/standardSchema.test.ts`

```typescript
import { enforce } from '../n4s';
import { StandardSchemaV1 } from 'vest-utils/standardSchemaSpec';

describe('n4s StandardSchema Support', () => {
  describe('Lazy Interface', () => {
    it('Should have the "~standard" property', () => {
      const validator = enforce.lazy(v => v.isString());
      expect(validator).toHaveProperty('~standard');
      expect(validator['~standard'].version).toBe(1);
      expect(validator['~standard'].vendor).toBe('n4s');
    });

    it('Should implement validate method matching StandardSchema spec', async () => {
      const validator = enforce.lazy(v => v.isString());

      const validResult = await validator['~standard'].validate('hello');
      expect(validResult.issues).toBeNull();
      // @ts-ignore
      expect(validResult.value).toBe('hello');

      const invalidResult = await validator['~standard'].validate(123);
      expect(invalidResult.issues).toBeInstanceOf(Array);
      expect(invalidResult.issues?.length).toBeGreaterThan(0);
    });
  });

  describe('Shape/Schema Rules', () => {
    it('enforce.shape should adhere to StandardSchema', async () => {
      const shape = enforce.shape({
        name: enforce.isString(),
        age: enforce.isNumber(),
      });

      expect(shape['~standard']).toBeDefined();

      const res = await shape['~standard'].validate({ name: 'Bob', age: 30 });
      expect(res.issues).toBeNull();
    });
  });

  describe('Direct validate() method usage', () => {
    it('should expose .validate() as an alias to the standard validation', async () => {
      const validator = enforce.lazy(v => v.equals(5));
      const res = await validator.validate(5);
      expect(res.issues).toBeNull();
    });
  });
});
```

---

## 3\. Step-by-Step Execution Plan

### ⚠️ Pre-Work Validation

Run the following to ensure a clean state:

```bash
yarn build
yarn test run
```

### Phase 1: Type Definitions & Imports

**Goal:** Import the spec and update `n4s` types to recognize `StandardSchema`.

1.  **Modify `packages/n4s/src/n4sTypes.ts` (or `lazy.ts` depending on export location):**
    - Import `StandardSchemaV1` from `vest-utils/standardSchemaSpec`.
    - Update the `LazyRule` or `Lazy` interface to include the `~standard` property.

**Checklist:**

- [ ] Import `StandardSchemaV1`.
- [ ] Update generic `Lazy` interface to extend or include `StandardSchemaV1`.
- [ ] Ensure `validate` method is defined in the type interface: `validate(input: any): Promise<StandardSchemaV1.Result<T>> | StandardSchemaV1.Result<T>`.

### Phase 2: Refactor `Lazy` Implementation

**Goal:** Rename `run` to `validate` and implement the `~standard` property.

1.  **Modify `packages/n4s/src/lazy.ts`:**
    - Rename the existing `run` method to `validate`.
    - **Crucial:** Ensure `validate` logic adapts the internal `n4s` result (which might throw or return a Vest result) into the `StandardSchema` result format (`{ value: T } | { issues: Issue[] }`).
    - Add the `~standard` property to the class/object.
    - _Backward Compatibility:_ If necessary, keep `run` as a deprecated alias that calls `validate` (or vice versa) to prevent massive breakage during refactor, but the goal implies replacement.

**Code Snippet Example (Lazy Class/Object):**

```typescript
// inside Lazy class or factory
public async validate(input: unknown): Promise<StandardSchemaV1.Result<Output>> {
  try {
    // ... execute existing enforcement logic ...
    return { value: input as Output, issues: null };
  } catch (err) {
    return { issues: [{ message: err.message, path: [] }] }; // Adapt n4s error to StandardSchemaIssue
  }
}

// Add the property
public get "~standard"() {
  return {
    version: 1,
    vendor: 'n4s',
    validate: this.validate.bind(this)
  };
}
```

**Checklist:**

- [ ] Rename `run` implementation to `validate`.
- [ ] Implement result transformation (n4s throws -\> StandardSchema Result object).
- [ ] Add `get "~standard"()` accessor.
- [ ] Verify `vendor` is set to `'n4s'`.

### Phase 3: Update Schema & Compound Rules

**Goal:** Ensure specific rule builders (`shape`, `allOf`, etc.) use the new `validate` method name and return compliant objects.

1.  **Modify `packages/n4s/src/rules/schemaRules/schemaRules.ts` (and `shape.ts`, etc.):**

    - These files often internally call `.run()`. Update them to call `.validate()` if they are recursively validating.
    - Ensure the objects returned by `shape`, `partial`, etc., are instances of the updated `Lazy` (or equivalent) so they inherit `~standard`.

2.  **Modify `packages/n4s/src/rules/compoundRules/compoundRules.ts`:**

    - Update internal usage of `.run()` to `.validate()`.
    - Ensure `allOf`, `anyOf`, `oneOf` return standard-compliant objects.

**Checklist:**

- [ ] Search codebase for `.run(` usages within `packages/n4s`.
- [ ] Replace internal calls with `.validate(` or `['~standard'].validate(`.
- [ ] Ensure `shape()` returns a StandardSchema compliant object.
- [ ] Ensure `compound` rules return StandardSchema compliant objects.

### Phase 4: Integration with Vest

**Goal:** Ensure `createSuite` can consume the updated `n4s` validators.

1.  **Verify `packages/vest/src/suite/createSuite.ts` (or `createWithSchema.ts`):**

    - If `createSuite` detects schemas via Duck Typing (checking for `~standard`), the new `n4s` objects should work automatically.
    - If `createSuite` has specific `instanceof` checks for `n4s`, ensure those logic paths are compatible with the new structure.

2.  **Test Integration:**

    - Create a test case in `packages/vest/src/__tests__/integration.standardschema.test.ts`.

<!-- end list -->

```typescript
import { create, test, enforce } from 'vest';

const suite = create(data => {
  test('field', 'msg', () => {
    // This uses the new n4s StandardSchema support directly
    enforce(data).shape({
      id: enforce.isNumber(),
    });
  });
});

// Run suite and verify
```

**Checklist:**

- [ ] Verify `vest` handles the new `n4s` object structure.
- [ ] Run full test suite to ensure no regressions in basic Vest functionality.

### Phase 5: Documentation Updates

**Goal:** Document the new API capability.

1.  **Modify `packages/n4s/README.md`:**

    - Add a section about StandardSchema compatibility.
    - Explain that `enforce.lazy` and `enforce.shape` now return StandardSchema v1 compliant objects.

2.  **Modify `packages/vest/README.md` (Optional):**

    - Briefly mention that Vest's `n4s` is now a StandardSchema provider.

---

## 4\. Documentation Changes

**File:** `packages/n4s/README.md`

**Insert Section:** "StandardSchema Support"

````markdown
## StandardSchema Support

`n4s` fully supports the [StandardSchema](https://standardschema.dev/) specification (v1).
All lazy validators, shapes, and compound rules expose the `~standard` property.

```javascript
import { enforce } from 'n4s';

const userSchema = enforce.shape({
  name: enforce.isString(),
  age: enforce.isNumber(),
});

// Use with any StandardSchema consumer
const result = await userSchema['~standard'].validate({ name: 'Bob', age: 20 });
```
````

```

---

## 5. Verification & Final Checklist

**⚠️ CRITICAL:** Run these commands to finalize.

- [ ] `yarn build` - Ensure typescript compilation succeeds with new types.
- [ ] `yarn test run` - Ensure the new `standardSchema.test.ts` passes and no regressions in `n4s` or `vest`.
- [ ] `yarn vx typecheck` - Verify strict type compliance.
- [ ] `yarn vx typecheck-tests` - Verify test types.

**Final Sanity Check:**
- Did we remove/replace `run` entirely? If so, verify no external consumers in the monorepo depended on it (e.g., `vest-utils` tests).
- Does `validate` handle asynchronous rules (Promises) correctly as per StandardSchema spec? (Ensure `validate` return type allows `Promise<Result>`).
```
