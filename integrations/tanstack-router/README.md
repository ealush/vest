# Vest with TanStack Router

## Status

Vest-local documentation proof is green.

## Tested versions

- Vest 6.3.2
- `@tanstack/react-router` 1.170.18

## What this proves

TanStack Router accepts a Vest suite as `validateSearch`, rejects invalid URLs, transforms values, and infers the route search type.

## What this does not prove

Search parsing is one-shot boundary validation and does not use Vest retained state.

## Run locally

Run `yarn workspace @vest/integration-tanstack-router test`, `typecheck`, or `build`.

## Runtime behavior

Tests load real memory-history routes with valid and invalid query strings.

## Type behavior

The route's search hook exposes Vest's transformed output type.

## Known limitations

TanStack Router requires search validation to be synchronous.

## Upstream status

No upstream change has been created.
