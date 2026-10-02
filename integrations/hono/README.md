# Vest with Hono

## Status

Local implementation, tests, types, demo, and Vest documentation use Hono's released Standard Validator middleware.

## Tested versions

- Vest 6.3.2
- Hono 4.13.0
- `@hono/standard-validator` 0.3.0

## What this proves

Hono accepts and rejects JSON through a Vest suite, preserves nested issues, and passes transformed output to the handler.

## What this does not prove

Standard Schema middleware does not expose Vest's stateful interactive features.

## Run locally

Run this workspace's `test`, `typecheck`, `build`, or `dev` script through Yarn.

## Runtime behavior

Tests execute deterministic in-memory requests with no listening server.

## Type behavior

The application compiles against Hono's public request API and validator types.

## Known limitations

This is full-request server validation, not focused validation.

## Upstream status

No upstream change has been created.
