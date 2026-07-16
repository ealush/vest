# Vest — form validation that remembers

![Vest](https://cdn.jsdelivr.net/gh/ealush/vest@assets/logo_250.png 'Vest')

[Documentation](https://vestjs.dev) · [Async race demo](https://vestjs.dev/#async-race-demo) · [Getting started](https://vestjs.dev/docs/get_started)

[![Join Discord](https://badgen.net/discord/online-members/WmADZpJnSe?icon=discord&label=Discord)](https://discord.gg/WmADZpJnSe) [![GitHub Stars](https://badgen.net/github/stars/ealush/vest?color=yellow&label=GitHub%20Stars)](https://github.com/ealush/vest) [![Version](https://badgen.net/npm/v/vest?icon=npm)](https://www.npmjs.com/package/vest) [![Downloads](https://badgen.net/npm/dt/vest?label=Downloads)](https://www.npmjs.com/package/vest) [![Bundle size](https://badgen.net/bundlephobia/minzip/vest)](https://bundlephobia.com/package/vest) [![Status](https://badgen.net/github/status/ealush/vest)](https://github.com/ealush/vest/actions)

Vest runs the tests for the field or step that changed and keeps the results for everything else. When async checks overlap, only the latest result can update the suite.

> **Vest validates what changed, remembers what already passed, and prevents stale async validation results.**

The validation rules read like unit tests. The stateful runtime is what makes Vest different.

```js
import { create, enforce, test } from 'vest';

const suite = create(data => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  test('username', 'Username must be at least 3 characters', () => {
    enforce(data.username).longerThanOrEquals(3);
  });

  test('username', 'Username is already taken', async ({ signal }) => {
    const response = await checkUsername(data.username, { signal });
    enforce(response.available).isTruthy();
  });
});

// Run only username tests and retain previous results for every other field.
const result = suite.only('username').run(formData);

result.isPending('username');
result.hasErrors('username');

// Await the current async run when final completion matters.
await result;
```

## Why Vest?

- **Incremental execution:** Validate a field, group, or step without rerunning everything.
- **Retained validation state:** A focused run updates part of the existing result instead of replacing it.
- **Race-safe async:** Track pending work, cancel obsolete requests, and ignore stale completions.
- **Real workflow primitives:** Model dependent fields, conditional sections, warnings, optional values, groups, and dynamic lists.
- **Client and server continuity:** Run statelessly on the server and resume full validation state in the browser.
- **Framework independence:** Use the same suite with React, Vue, Svelte, Angular, vanilla JavaScript, or Node.js.
- **TypeScript and schemas:** Infer typed inputs and parsed outputs with Enforce schemas.
- **Standard Schema interoperability:** Pass suites and Enforce rules to compatible tools while keeping `run()` and `runStatic()` as Vest's execution APIs.
- **Familiar, testable rules:** Keep business validation outside UI components in suites that are easy to unit-test.

## Where Vest fits

| Layer                | Responsibility                                              | Typical tools                      |
| -------------------- | ----------------------------------------------------------- | ---------------------------------- |
| Form state           | Values, registration, touched state, submission             | React Hook Form, Formik            |
| Data boundary        | Parse and protect a complete payload                        | Zod, Valibot, Ajv, Enforce schemas |
| **Validation state** | Decide what runs now, retain results, coordinate async work | **Vest**                           |

These layers are complementary. A common architecture uses a form manager for input mechanics, Vest for progressive interaction, and a schema validator for the final submitted boundary.

## Where Vest works well

Vest works well for:

- async username, email, inventory, coupon, or eligibility checks;
- onboarding and multi-step workflows;
- linked fields and cross-field business rules;
- warnings that should not block submission;
- optional and conditional sections;
- dynamic lists of travelers, products, or addresses;
- rules shared between browser and server;
- SSR workflows that should not validate everything twice.

For a trivial synchronous form or a one-shot API parse, native HTML validation or a schema validator may be all you need.

## Installation

```shell
npm i vest
```

## Start here

- [Getting started](https://vestjs.dev/docs/get_started)
- [Vest tutorials](https://vestjs.dev/docs/tutorials)
- [How Vest handles validation](https://vestjs.dev/docs/concepts)
- [Async validation without race conditions](https://vestjs.dev/docs/guides/async-validation-race-conditions)
- [Complete registration example](https://vestjs.dev/docs/guides/production-architecture)
- [When not to use Vest](https://vestjs.dev/docs/guides/when-not-to-use-vest)
- [Vest, schema validators, and form libraries](https://vestjs.dev/docs/vest_vs_the_rest)
- [Consumer AI usage guide](https://vestjs.dev/llms-consumer.txt)
- [Public roadmap](https://github.com/ealush/vest/blob/latest/ROADMAP.md)

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](https://github.com/ealush/vest/blob/latest/CONTRIBUTING.md).
