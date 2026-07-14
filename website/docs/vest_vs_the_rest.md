---
sidebar_position: 3
title: Vest, Schema Validators, and Form Libraries
description: Learn where Vest fits alongside Zod, Standard Schema tools, and form state managers.
keywords: [Vest, Zod, React Hook Form, Schema Validation, Stateful Validation]
---

# Vest, Schema Validators, and Form Libraries

Vest does not need every validation problem to be a Vest problem.

Different tools own different parts of the workflow:

| Tool category                    | Primary responsibility                              |
| -------------------------------- | --------------------------------------------------- |
| Schema validators such as Zod    | Define and parse a valid data boundary              |
| Form managers such as RHF/Formik | Manage values, registration, events, and submission |
| **Vest**                         | Manage how validation evolves during interaction    |

## The distinction

A schema validator is excellent at answering:

> Does this submitted payload have the expected structure and values?

Vest is designed to answer:

> The user changed one part of a workflow. What needs to run now, what previous state remains valid, and which async result should be trusted?

Vest can also perform structural validation with Enforce schemas. The distinction is about the runtime model, not a claim that schema validation is unimportant.

## Vest and Zod

Zod is a strong choice for:

- parsing unknown input;
- validating API and persistence boundaries;
- defining data structures;
- deriving TypeScript types;
- one-shot validation.

Vest is a strong choice for:

- validating one field or step at a time;
- retaining earlier validation results;
- coordinating overlapping async checks;
- dependent and conditional fields;
- multi-step workflows;
- warnings, pending state, and progressive completion.

### Use both

A production application can use Zod for the submitted boundary and Vest for interaction:

```text
User interaction
  → Vest runs focused, stateful validation
  → UI shows errors, warnings, and pending work

Final submission
  → Zod parses the complete boundary payload
  → server applies authoritative business rules
```

The concise explanation is:

> **Zod defines what a valid submitted account looks like. Vest manages how the user gets there.**

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

| Capability                          | Schema validator   | Form state manager | Vest                               |
| ----------------------------------- | ------------------ | ------------------ | ---------------------------------- |
| Parse a complete object boundary    | Primary            | Varies             | Yes, with schemas                  |
| Own field values and registration   | No                 | Primary            | No                                 |
| Run selected fields or groups       | Varies             | Often              | Primary                            |
| Retain validation between runs      | No                 | Often              | Primary                            |
| Prevent stale async results         | Usually manual     | Varies             | Built in                           |
| Model dependent fields              | Cross-object rule  | Varies             | `include` and ordinary JS          |
| Model conditional sections          | Unions/refinements | Varies             | `skipWhen`, `omitWhen`, `optional` |
| Warnings that do not block submit   | Usually custom     | Varies             | Built in                           |
| Share rules across UI frameworks    | Yes                | Usually no         | Yes                                |
| Stateless server execution          | Yes                | Not primary        | `runStatic()`                      |
| Resume full server validation state | No                 | Framework-specific | `SuiteSerializer`                  |

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

The goal is not to replace every schema or form library. It is to make progressive validation a first-class part of the application architecture.
