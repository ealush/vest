## Plan: Schema-Aware Suite Creation (Vest)

**Execution rules:** After each numbered step, run `yarn build` followed by `yarn test run`, report results, and stop for confirmation before continuing. After each step is completed, write the summary of the change in a new markdown file in `plans/implemented/` named `<step_number>_<title>.md`, describing what was done and any relevant notes. Be as detailed as necessary for future reference and change log purposes as well as for documentation.

Add schema-aware typing to `create`/`createSuite`, surface schema metadata on `SuiteResult`, and document the API. n4s already exposes `RuleInstance` and schema helper types (`packages/n4s/src/n4s.ts`), and runtime accepts an optional `schema` argument (`packages/vest/src/suite/createSuite.ts`), but Vest types and suite results do not yet use the schema.

---

## Phase 1: Type plumbing for schema-aware suites

**Objective:** Introduce schema generics and inference into Vest types while keeping non-schema suites unchanged.

**Baby steps:**

1. [completed] Add a leading generic parameter to `createSuite` so callers can explicitly type the first callback argument (data) via the generic; keep existing behavior when omitted. Update `packages/vest/src/suite/createSuite.ts` and any re-exports as needed. Run build/tests, then stop for confirmation.
2. Add the second `schema` argument to suites with the n4s `RuleInstance` type; ensure runtime accepts it without breaking existing calls. Run build/tests, then stop for confirmation.
3. Infer the data argument type from the provided schema (concrete types), including `.run` callbacks, mirroring `Array.map` style inference. Add helpers if needed (e.g., `InferSchemaData`). Run build/tests, then stop for confirmation.

**Files to modify:**

- `packages/vest/src/suite/SuiteTypes.ts` – add schema generic (`S extends RuleInstance<any> | null | undefined`), infer data from `schema.infer`, and thread it into `Suite`.
- `packages/vest/src/vest.ts` and any re-exports that surface `create`/`Suite` – align exported types with the new schema-aware signatures.
- `packages/vest/src/core/context/SuiteContext.ts` – store schema on the context so it is available when constructing the result (without altering existing state behavior).

**Implementation notes:**

- Define a helper like `InferSchemaData<S>` to map `RuleInstance` → data type and fall back to `any` when no schema.
- Keep backwards compatibility for suites without schema and for callbacks that expect multiple params (schema should only constrain the first data param).
- Accept `null`/`undefined` schemas at the type level to match existing runtime usage in `createWithSchema.test.ts`.

**Validation:** `yarn build`, then `yarn test run` after the step is complete.

---

## Phase 2: Surface schema on `SuiteResult`

**Objective:** Attach schema type info to suite results without changing other summary fields.

**Baby steps:** 4. Extend `SuiteResult` with a `types` property and introduce a generic for the concrete schema type. Adjust `SuiteResult` definitions to carry both inferred data and schema. Run build/tests, then stop for confirmation. 5. From within `createSuite`, pass the schema/types generic through the suite result wiring so `suite.get().types` surfaces the data+schema types when available. Update any result construction logic accordingly. Run build/tests, then stop for confirmation.

**Files to modify:**

- `packages/vest/src/suiteResult/SuiteResultTypes.ts` – add optional `types?: { data: InferSchemaData<S>; schema: S }`.
- `packages/vest/src/suiteResult/suiteResult.ts` – thread schema from context into `constructSuiteResultObject` and set `types` only when a valid schema is provided.
- `packages/vest/src/suite/createSuite.ts` – pass schema into the suite runner/context so `useCreateSuiteResult` can read it (include TODO for future runtime validation if desired).

**Validation:** `yarn build`, then `yarn test run` after the step is complete.

---

## Phase 3: Tests and examples

**Objective:** Enforce schema-aware typing and runtime expectations via the existing test files.

**Baby steps:** 6. Update/extend tests (e.g., `schema.types.test.ts`, `createWithSchema.test.ts`, `schema.example.ts`) to cover the schema-typed data argument, `run` typing, and the new `types` field. Run build/tests, then stop for confirmation.

**Files to modify:**

- `packages/vest/src/suite/__tests__/schema.types.test.ts` – unskip/adjust the schema-driven suite describe blocks to assert inference for `shape`, `loose`, and `partial`, run signature requirements, and the `types` property shape; keep the export-focused tests intact.
- `packages/vest/src/suite/__tests__/createWithSchema.test.ts` – add assertions that `suite.get().types` reflects schema when provided and is `undefined` when schema is `null`/`undefined`/omitted.
- `packages/vest/src/suite/__tests__/schema.example.ts` – align examples/comments with the final API if type behavior changes.

**Validation:** `yarn build`, then `yarn test run` after the step is complete.

---

## Phase 4: Documentation

**Objective:** Document the schema parameter and the `types` result field.

**Files to modify:**

- `website/docs/writing_your_suite/vests_suite.md` – add “Using Schemas for Type Safety” with `shape`, `loose`, and `partial` examples.
- `website/docs/typescript_support.md` – show type inference from schemas and mention `suite.get().types`.
- `website/docs/enforce/builtin-enforce-plugins/schema_rules.md` – note Vest integration points.
- `website/docs/get_started.md` / `website/docs/api_reference.md` – update the `create` signature and mention the optional schema + `types` field.

**Validation:** `yarn build`, then `yarn test run` after the step is complete (or additional doc build if desired).

# Extra specification

the data argument should be the typed similar to Arary.map, so that when hovering the data argument in the callback, it shows the inferred type from the schema. If we pass a generic type to createSuite, the type argument should be inferred from the generic type.

We should expose the concrete type, so:

```ts
// ✅ CORRECT: Data matches schema
const userSchema = enforce.shape({
  username: enforce.isString(),
  age: enforce.isNumber(),
  email: enforce.isString(),
});

const validSuite = create(data => {
  // TypeScript knows the exact shape of data:
  // data.username: string
  // data.age: number
  // data.email: string

  test('username', () => {
    enforce(data.username).isNotEmpty();
  });

  test('age', () => {
    enforce(data.age).greaterThan(0);
  });
}, userSchema);
```

.run should be typed according to the schema as well:

```ts
const result = validSuite.run({
  username: 'john_doe',
  age: 30,
  email: 'john@example.com',
});
```

# Clarifications

1. vest should only infer the types of the first argument (data) of the suite callback from the schema. Other arguments (like `fields` or `meta`) should remain unaffected and retain their existing types or be typed on the callback itself (data /_typed from schema schema_/ , arg: UserType) => {}
2. Empty schema: undefined / null (isNUllish)
3. always write the approprite tests, unskip the test, update the documentation with the added / modified api.
