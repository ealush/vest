# Vest with React Hook Form

## Status

Vest-local resolver candidate. No upstream React Hook Form changes have been made.

## Tested versions

- Vest 6.3.2
- react-hook-form 7.84.0
- @hookform/resolvers 5.7.1

## What this proves

- A Vest 6 Suite Object can back React Hook Form's dedicated resolver contract.
- Resolver field names drive focused Vest runs while unrelated results remain retained.
- Nested objects, reindexed field arrays, multiple issues, native validation, context, asynchronous checks, and transformed output work through the real RHF types and utilities.
- Overlapping asynchronous validation returns the newest field result instead of an obsolete result.
- Fresh suites isolate full submissions from focused changes and from other submissions.
- One integration owner per form keeps focused state isolated, aborts pending work, and replaces retained state on reset or unmount.

## What this does not prove

- The candidate has not been accepted or published by `@hookform/resolvers`.
- RHF's generic Resolver API does not expose an explicit submit or unmount event.
- Older Vest releases are not supported by this candidate.

## Run locally

```sh
yarn workspace @vest/integration-react-hook-form test
yarn workspace @vest/integration-react-hook-form typecheck
yarn workspace @vest/integration-react-hook-form build
```

## Runtime behavior

The resolver uses `suite.only(names).run(values, context)` for partial field requests. Full-form calls use a fresh suite from the supplied factory so concurrent submissions and field changes cannot overwrite one another. It maps Vest's flat issue list through React Hook Form's public nesting and native-validation helpers.

## Type behavior

The Enforce schema determines resolver input and parsed output types. The same schema is passed as the output boundary so successful focused calls also satisfy React Hook Form's full output contract. Submit handlers receive trimmed, normalized, and coerced output while raw mode preserves the input type.

## Known limitations

- A full run is inferred by comparing RHF's requested names with the current value leaves because `ResolverOptions` does not identify submission calls.
- The adapter needs a suite factory because Vest Suite Objects do not expose a public cloning API; focused calls retain one suite while full calls need isolated suites.
- Retained field-array state needs stable item IDs. This example passes React Hook Form's `useFieldArray` IDs through `getContactKey` so errors follow items across insertions and removals.
- If an unrelated invalid field prevents the output schema from transforming the whole form during a focused run, the resolver keeps the current input values. A full run still requires and returns parsed output.
- RHF reset and unmount do not invoke the resolver. The integration owner must abort its lifecycle signal and replace the focused suite alongside those events; asynchronous checks must honor their `AbortSignal`.
- The local async coordinator observes Suite Object completion events because superseded Vest stateful-run promises do not currently settle reliably.

## Upstream status

No issue or pull request has been opened in `react-hook-form/resolvers`.
