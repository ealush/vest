# Async Enforcements Summary

This change adds asynchronous enforcement support to the eager `enforce(value)` API while preserving existing sync behavior.

## Architectural Shift

- The eager chain now tracks an internal `pendingPromise`.
- Rules still execute eagerly while all rules are synchronous.
- When a Promise-returning rule is encountered, execution transitions to queued promise chaining.
- Any subsequent rules (including synchronous ones) are queued behind `pendingPromise`.

## Behavior Guarantees

- **Fail-fast sync behavior is preserved**: synchronous failures before any async rule throw immediately.
- **Awaitable chains**: eager chains now implement `then` and `catch`, so `await enforce(value).rule()` is valid.
- **Mixed sync/async chains**: sync rules after an async rule execute in queue order.

## Type Updates

- Eager return type now includes `PromiseLike<void>` and `.catch(...)`.
- Custom matcher return types now allow `Promise<boolean | RuleRunReturn<any>>`.

## Scope Note

- This implementation focuses on eager runtime chaining (`enforce(value)`), including custom async rules via `enforce.extend`.
