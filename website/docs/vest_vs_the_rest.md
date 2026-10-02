---
sidebar_position: 3
title: Vest, Schema Validators, and Form Libraries
description: Learn where Vest fits alongside Zod, Standard Schema tools, and form state managers.
keywords: [Vest, Zod, React Hook Form, Schema Validation, Stateful Validation]
---

# Vest, Schema Validators, and Form Libraries

Vest can work alongside the form and schema tools you already use.

These capabilities can be composed, but they are not mutually exclusive:

| Tool or layer                    | What it can own                                    |
| -------------------------------- | -------------------------------------------------- |
| Form managers such as RHF/Formik | Values, registration, events, and submission       |
| Enforce schemas, Zod, or Valibot | Structural validation, transformation, and parsing |
| **Vest suites**                  | Stateful and stateless validation workflows        |
| **Vest suite + Enforce schema**  | Both parsed boundaries and validation over time    |

## Where Vest differs

A schema validator is excellent at answering:

> Does this submitted payload have the expected structure and values?

A Vest suite also needs to answer:

> The user changed one part of a workflow. What needs to run now, what previous state remains valid, and which async result should be trusted?

Vest can handle both jobs. Enforce schemas validate, transform, and parse data. A Vest suite keeps test results up to date while the user moves through a form.

## Vest and Zod

Zod is a strong choice for:

- parsing unknown input;
- validating API and persistence boundaries;
- defining data structures;
- deriving TypeScript types;
- one-shot validation.

Enforce supports those same core boundary jobs. A schema created with `enforce.shape`, `enforce.loose`, or `enforce.partial` exposes `.parse()` and returns transformed output:

```ts
const accountSchema = enforce.shape({
  age: enforce.isNumeric().toNumber(),
  email: enforce.isString().trim(),
});

const account = accountSchema.parse(input);
// account.age is a number
```

Attach the schema to a suite when the same boundary and parsed values should participate in Vest's runtime:

```ts
const accountSuite = create(parsedAccount => {
  test('age', 'Must be an adult', () => {
    enforce(parsedAccount.age).greaterThanOrEquals(18);
  });
}, accountSchema);

const result = accountSuite.runStatic(input);
if (result.isValid()) persist(result.value);
```

Vest is a strong choice for:

- validating one field or step at a time;
- retaining earlier validation results;
- coordinating overlapping async checks;
- dependent and conditional fields;
- multi-step workflows;
- warnings, pending state, and progressive completion.

### Use Vest on its own or with Zod

Vest can own both the interactive workflow and the submitted boundary:

```text
User interaction
  → Vest runs focused, stateful validation
  → UI shows errors, warnings, and pending work

Final submission
  → Enforce schema parses and transforms the complete payload
  → Vest runStatic applies the business rules
```

If your application already uses Zod, parse the payload before a stateless Vest run:

```ts
const parsed = schema.parse(payload);
const result = await suite.runStatic(parsed);
```

Zod and Enforce can both parse the boundary. The Vest suite is what carries the validation result from one interaction to the next.

## Vest and form state managers

Vest does not register inputs, store their values, or submit the form. That makes it possible to use Vest:

- directly with local state;
- with React Hook Form or Formik;
- from Vue or Svelte composables;
- in a custom workflow engine;
- on the server without a UI.

A form manager and Vest can therefore work together: the form manager owns input mechanics while Vest owns progressive validation behavior.

Vest implements Standard Schema so compatible tools can consume suites and Enforce rules through a shared validation interface. Application code should use `suite.run()` for stateful validation or `suite.runStatic()` for independent server validation. The Standard Schema `~standard.validate` hook exists for compatible consumers, not as Vest's general execution API.

## Capability comparison

| Capability                          | Standalone schema tool | Form state manager | Vest                               |
| ----------------------------------- | ---------------------- | ------------------ | ---------------------------------- |
| Parse a complete object boundary    | Primary                | Varies             | `enforce.shape(...).parse()`       |
| Own field values and registration   | No                     | Primary            | No                                 |
| Run selected fields or groups       | Varies                 | Often              | Primary                            |
| Retain validation between runs      | No                     | Often              | Primary                            |
| Prevent stale async results         | Usually manual         | Varies             | Built in                           |
| Model dependent fields              | Cross-object rule      | Varies             | `include` and ordinary JS          |
| Model conditional sections          | Unions/refinements     | Varies             | `skipWhen`, `omitWhen`, `optional` |
| Warnings that do not block submit   | Usually custom         | Varies             | Built in                           |
| Share rules across UI frameworks    | Yes                    | Usually no         | Yes                                |
| Stateless server execution          | Yes                    | Not primary        | `runStatic()`                      |
| Resume full server validation state | No                     | Framework-specific | `SuiteSerializer`                  |

## Why use Vest instead of writing validation state manually?

It is possible to assemble focused validation, pending flags, request IDs, abort controllers, field dependencies, caches, and error merging by hand.

Vest packages those behaviors into one validation runtime with a consistent result model. This removes plumbing that otherwise spreads across components and becomes difficult to test as the workflow grows.

## When Vest is the right tool

Vest becomes more valuable as a workflow gains:

- asynchronous checks;
- dependencies between fields;
- multiple steps or conditional sections;
- dynamic lists;
- validation shared across browser and server;
- expensive checks that should not rerun unnecessarily;
- UX distinctions between untested, pending, warning, error, and valid.

## When another tool may be enough

Prefer a simpler solution when:

- native HTML validation covers the requirement;
- the form is trivial and entirely synchronous;
- validation happens only once at an API boundary;
- your primary problem is storing form values rather than validation behavior.

You do not have to replace your schema or form library to use Vest. Add it when keeping validation correct between interactions is the hard part.
