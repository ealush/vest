# Vest with TanStack Form

## Status

Local implementation, tests, types, demo, and Vest documentation are complete. No upstream change is planned in this workspace.

## Tested versions

- Vest 6.3.2
- `@tanstack/react-form` 1.33.3

## What this proves

TanStack Form accepts a Vest suite as a form-level Standard Schema validator and maps nested and multiple issues into field state.

## What this does not prove

Standard Schema submission validation does not use Vest's focused execution or retained state. The field validators use an instance-owned suite directly, and TanStack Form currently validates but does not submit Standard Schema transformed output.

## Run locally

Run this workspace's `test`, `typecheck`, `build`, or `dev` script through Yarn.

## Runtime behavior

Tests cover invalid and valid forms, nested paths, multiple issues, focused retained-state isolation, corrected errors, submission, and independent instances.

## Type behavior

The form retains its input type and rejects unknown field paths.

## Known limitations

Transformed Standard Schema output is not forwarded to the TanStack Form submit callback.

## Upstream status

No upstream change has been created.
