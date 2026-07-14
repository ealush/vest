# Production registration example

This is Vest's canonical production architecture:

> React Hook Form owns the inputs, Zod owns the submitted boundary, and Vest owns how validation evolves.

It demonstrates:

- focused field and step validation;
- React Hook Form integration through the official Standard Schema resolver;
- retained results across interactions;
- async username validation with cancellation and stale-result protection;
- linked password confirmation;
- conditional company fields;
- non-blocking password warnings;
- stateless server validation;
- a separate parsing boundary;
- a runnable Vite page with deterministic demo services;
- executable behavior tests and TypeScript checking.

## Files

- `src/registrationSuite.ts` — progressive business validation.
- `src/RegistrationForm.tsx` — React values and interactions.
- `src/main.tsx` — runnable browser entry with deterministic demo services.
- `src/styles.css` — standalone example presentation.
- `src/boundarySchema.ts` — Zod input boundary.
- `src/server.ts` — stateless request handling.
- `src/serverAction.ts` — a Next.js-style Server Action and resumable state.
- `src/registrationSuite.test.ts` — runtime behavior proof.
- `index.html` — Vite entry document.

## Run

From the repository root:

```shell
yarn example:production:build
yarn example:production:test
yarn example:production:typecheck
```

Start the interactive example with:

```shell
yarn workspace @vest/example-production-registration dev
```

The browser entry injects deterministic demo services so it runs without a backend. `RegistrationForm` keeps production defaults for `/api/usernames/:username` and `/api/register`.

The example deliberately avoids hiding progressive Vest behavior behind an adapter. A field interaction calls `suite.only(field).run(values)`, a step calls `suite.focus({ onlyGroup: step }).run(values)`, and the official Standard Schema resolver awaits the full stateless Vest validation before the boundary parser and submission handler run.
