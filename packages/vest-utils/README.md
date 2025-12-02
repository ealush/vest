# vest-utils

Internal utility collection used across the Vest ecosystem (Vest, n4s/enforce, Context, and more). It includes small, focused helpers such as:

- Type guards: `isArray`, `isBoolean`, `isString`, `isNumeric`, `isPromise`, and related predicates.
- Data helpers: `asArray`, `defaultTo`, `nonnullish`, `text`, `toNumber`, comparison utilities, and length helpers.
- Control flow: `either`, `bindNot`, `callEach`, `optionalFunctionValue`, `deferThrow`.
- Lightweight primitives: cache, pub/sub bus, simple state machines, and result wrappers.

These modules are maintained for internal consumption and may change between versions. Prefer using higher-level packages (`vest`, `n4s`, `context`, etc.) unless you have a specific need for a particular helper.
