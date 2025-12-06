# Context 🪆

Lightweight context propagation for JavaScript and TypeScript. Create a scoped storage object, run code inside it, and read the active value anywhere down the call stack - without depending on React.

- `createContext(defaultValue?)` – simplest option with a single value per run.
- `createCascade(initializer?)` – merges parent and child context objects, ideal for layered data.
- `bind` – capture context for later execution (useful with async callbacks).

## Installation

```bash
npm i context
```

## createContext

Create an isolated context with an optional default value used outside of a running scope.

```js
import { createContext } from 'context';

const requestContext = createContext({ requestId: undefined });

function handleRequest(requestId) {
  return requestContext.run({ requestId }, () => {
    logRequest();
    return doWork();
  });
}

function logRequest() {
  // Inside run → current context value
  console.log(requestContext.use().requestId);
}
```

**API:**

- `run(value, callback)` – activates the context for the callback. Nested runs temporarily override the value and restore it afterwards.
- `use()` – returns the current value or the default when no context is active.
- `useX(message?)` – like `use`, but throws if called outside of `run`, ignoring any default value.

## createCascade

`createCascade` composes context objects instead of replacing them. Each `run` merges the current value with the parent context, so shared properties flow down while children can add or override keys.

```js
import { createCascade } from 'context';

const userContext = createCascade();

userContext.run({ user: { id: 5, name: 'Ada' } }, () => {
  // child run inherits id/name and adds role
  userContext.run({ user: { role: 'admin' } }, () => {
    const ctx = userContext.use();
    // ctx.user => { id: 5, name: 'Ada', role: 'admin' }
  });
});
```

**API additions:**

- `use()` / `useX(message?)` – return the merged object for the current layer.
- `run(value, callback)` – merges `value` into the parent context without passing arguments to `callback`.
- `bind(value, callback)` – returns a function that executes `callback` inside a context seeded with `value`, preserving arguments when invoked later.

## TypeScript

Both factories are fully typed. Annotate your contexts for stricter checks:

```ts
const settings = createContext<{ locale: string }>();
const session = createCascade<{ user?: { id: string } }>();
```

## Notes

- Context is synchronous by design; reading it after an async boundary requires `bind` or wrapping the async call inside `run`.
- Each `run` call leaves the parent context untouched once the callback completes.
