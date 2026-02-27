# VestTest isolate (`src/core/isolate/IsolateTest/VestTest.ts`)

## Purpose

`VestTest.ts` is the concrete data model and helper layer for test isolates.

## Architectural role

It encapsulates test-specific metadata and status transitions that are consumed by selectors, summary generation, and reconciliation logic.

## Typical responsibilities in the module

- Constructing typed test isolate payloads.
- Providing test-centric inspectors (status, message/failure accessors, metadata checks).
- Supporting merges/reuse paths when previous test runs are reconciled.

## Collaborators

- `IsolateTest.ts` / `IsolateTestReconciler.ts` for execution and reuse semantics.
- `suiteResult/selectors/*` for user-facing result APIs.
- `core/test/*` for test registration and run orchestration.

## Nuances

- Async test behavior and abort semantics ultimately materialize as VestTest status and output transitions.
- Changes here can silently impact selector correctness (`hasFailures`, `isPending`, grouped failure collection).
