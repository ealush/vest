# n4s Schema Parsing Architecture

## Overview

n4s schema rules (`shape`, `loose`, `partial`) now support **validation + parsing** in one pass.

- `run(value)` returns `{ pass, type, path?, message? }`.
- `parse(value)` throws on invalid data and returns parsed `type` on success.

This enables coercion-style schemas (e.g. numeric strings to numbers) while preserving Standard Schema compatibility.

## Architectural decisions

## 1) Single-pass transformation pipeline

Rule chains execute left-to-right. Every successful rule may replace the current value (`currentValue = result.type`).
This means transforms compose naturally and avoid extra passes.

Why:

- Better performance (no additional parse walk)
- Predictable semantics
- Reuse of existing `run` machinery

## 2) Schema object hardening against prototype pollution

Schema object handling only uses own enumerable keys (`Object.keys`) and rejects dangerous keys:

- `__proto__`
- `prototype`
- `constructor`

Why:

- Prevent object graph/prototype mutation through crafted input keys
- Eliminate prototype chain traversal (`for..in` over inherited keys)

## 3) Parsed data propagation into Vest

When Vest runs with schema, it uses parsed data as suite callback input and result `value`/`types.output`.
Vest also keeps schema validation semantics for reporting field errors.

Why:

- Suite tests can rely on typed, normalized data
- Avoid duplicate parsing logic in applications

## 4) Compatibility and fallback behavior

If schema parsing fails, Vest keeps runtime stability by falling back to the original input for callback execution while still surfacing schema validation failures.

Why:

- Preserve backward-compatible suite execution model
- Ensure errors are still reported deterministically

## Security notes

- n4s does not execute arbitrary code from input payloads.
- Custom rules are user-authored functions and should be treated as trusted application code.
- Input key sanitization is intentionally strict to reduce attack surface.

## Complexity notes

- Key lookups rely on `Set` membership where applicable for O(1) average-time membership checks.
- Schema traversal remains O(n) over schema keys and O(m) over input keys (required to validate/copy each key once).
