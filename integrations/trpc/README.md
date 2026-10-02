# Vest with tRPC

## Status

Vest-local documentation proof is green.

## Tested versions

- Vest 6.3.2
- `@trpc/server` 11.18.0

## What this proves

tRPC accepts a Vest suite directly as a Standard Schema procedure input parser, awaits async suites, infers input and transformed output, and prevents invalid calls from reaching the procedure.

## What this does not prove

This boundary-validation flow does not use Vest retained state or focused execution.

## Run locally

Run `yarn workspace @vest/integration-trpc test`, `typecheck`, or `build`.

## Runtime behavior

The tests use tRPC's real procedure builder and in-process caller without a network mock.

## Type behavior

`inferRouterInputs` exposes the schema input while `inferRouterOutputs` exposes Vest's transformed output.

## Known limitations

Standard Schema validation errors are wrapped in tRPC's `BAD_REQUEST` error.

## Upstream status

No upstream change has been created.
