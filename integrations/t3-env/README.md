# Vest with T3 Env

## Status

Vest-local documentation proof is green.

## Tested versions

- Vest 6.3.2
- `@t3-oss/env-core` 0.13.11

## What this proves

T3 Env accepts public Vest Enforce schemas for individual variables, rejects missing or malformed configuration, preserves server/client access boundaries, and returns transformed values.

## What this does not prove

Environment parsing is one-shot configuration validation; it does not use Vest's stateful suite workflow.

## Run locally

Run `yarn workspace @vest/integration-t3-env test`, `typecheck`, or `build`.

## Runtime behavior

The fixture validates an URL, converts a numeric port to a number, trims a public value, and confirms server-only access protection.

## Type behavior

T3 Env infers the output type of every Enforce schema, including the numeric port transformation.

## Known limitations

Per-variable Enforce schemas are a more natural fit here than a full Vest suite.

## Upstream status

No upstream change has been created.
