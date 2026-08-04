# Vest with Standard Schema

## Status

Docs green. The Vest-side runtime, types, demo, and documentation are locally verified; no upstream contribution has been opened.

## Tested versions

- Vest 6.3.2 from this workspace
- `@standard-schema/spec` 1.0.0

## What this proves

Vest suites and Enforce schemas implement Standard Schema version 1, including synchronous and asynchronous validation, normalized issues, nested paths, multiple issues, inferred input/output types, parsed output, and independent repeated validation.

## What this does not prove

Standard Schema invokes complete validation. It does not expose Vest's focused execution, retained interactive state, warnings, groups, or race coordination.

## Run locally

```shell
yarn workspace @vest/integration-standard-schema test
yarn workspace @vest/integration-standard-schema typecheck
yarn workspace @vest/integration-standard-schema build
yarn workspace @vest/integration-standard-schema dev
```

## Runtime behavior

The tests exercise valid and invalid synchronous payloads, asynchronous rules, nested paths, multiple field issues, transformations, and repeated calls.

## Type behavior

Compile-time tests use the released `StandardSchemaV1.InferInput` and `InferOutput` utilities and reject invalid input types.

## Known limitations

The Enforce surface identifies its vendor as `n4s`, while a Vest suite identifies its vendor as `vest`. This is intentional because they are distinct public validation surfaces.

## Upstream status

Not opened. Vest-side proof must be publicly available before proposing the registry addition.
