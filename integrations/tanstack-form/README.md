# Vest with TanStack Form

## Status

Local implementation, tests, types, demo, and Vest documentation are in progress. No upstream change is planned in this workspace.

## Tested versions

- Vest 6.3.2
- `@tanstack/react-form` 1.33.3

## What this proves

TanStack Form accepts a Vest suite as a form-level Standard Schema validator and maps nested and multiple issues into field state.

## What this does not prove

Generic Standard Schema validation does not use Vest focused execution or retained interactive state. TanStack Form currently validates but does not submit Standard Schema transformed output.

## Run locally

Run this workspace's `test`, `typecheck`, `build`, or `dev` script through Yarn.

## Runtime behavior

Tests cover invalid and valid forms, nested paths, multiple issues, corrected errors, submission, and independent instances.

## Type behavior

The form retains its input type and rejects unknown field paths.

## Known limitations

Transformed Standard Schema output is not forwarded to the TanStack Form submit callback.

## Upstream status

No upstream change has been created.
