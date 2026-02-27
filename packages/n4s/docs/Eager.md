# Eager API (`src/eager.ts`)

## Purpose

`eager.ts` implements the imperative `enforce(value).rule().rule()` API.

## Responsibilities

- Build a proxy over a validated value.
- Resolve rule names from built-ins and schema rules (`getRule`, `getSchemaRule`).
- Create bound rule invocations (`createRuleCall`) with short-circuit behavior.
- Support transient custom message injection through `.message()`.

## Collaborators

- `src/eager/ruleRegistry.ts`: built-in + custom rule resolution.
- `src/eager/ruleCallGenerator.ts`: constructs executable rule wrappers.
- `src/eager/allRules.ts`: core rules + schema rule map.

## Nuances

- Message state is mutable-but-local to each proxy instance and is cleared per call path.
- Unknown properties fall through to target object to avoid hard throws for non-rule access.
- Eager chain behavior must align with lazy chain semantics where shared rules are used.
