# n4s schema parsing architecture

## Goals

1. **Single-pass validation and transformation** for schema rules (`shape`, `loose`, `partial`).
2. **Predictable parse API** available across plain rules and chains.
3. **Security-first object traversal**, with explicit protection against dangerous keys used in prototype-pollution attacks.
4. **O(1) lookup behavior** by relying on native object property checks and set membership checks.

## Pipeline design

Schema execution is now modeled as a parse pipeline:

1. Validate the input container (must be object-like).
2. Reject dangerous own keys (`__proto__`, `prototype`, `constructor`) on both schema and user input.
3. Iterate schema keys using own-key iteration only (`Object.keys`).
4. Run each field rule and collect the transformed output (`RuleRunReturn.type`).
5. Return a parsed object with validated/coerced values.

This keeps validation and transformation in one pass over the relevant keys.

## Security decisions

Schema object utilities centralize safety behavior:

- `ownKeys` avoids prototype chain traversal.
- `safeHasOwn` avoids `in` checks that include inherited keys.
- `findDangerousOwnKey` short-circuits when dangerous keys are detected.
- `safeShallowCopy` creates a sanitized shallow clone and omits dangerous keys.

These utilities are used by `shape`, `loose`, and `partial` to ensure consistent behavior.

## Parse API semantics

Every `RuleInstance` now exposes:

- `test(value)` → boolean
- `validate(value)` → standard-schema result (`value` or `issues`)
- `parse(value)` → transformed output or throws on validation failure
- `run(value)` → internal `RuleRunReturn`

Chains propagate transformed values through each step, so rules can compose coercions predictably.

## Vest integration

When a suite is created with a schema:

- The schema parsing path is executed before the suite callback.
- If `schema.parse` exists, it is used first.
- On parse throw, Vest falls back to `schema.run` for rich path/message reporting.
- The suite callback receives parsed data.
- `SuiteResult.value` and `types.output` are parsed output.
- `types.input` remains the original input.

## Complexity notes

- Key checks are O(1) average-case (`Set.has`, own-property checks).
- Rule execution remains linear in the number of relevant keys: O(n).
- No recursive cloning is performed in schema wrappers; copying is shallow by design.
