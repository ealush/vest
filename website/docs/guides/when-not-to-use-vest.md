---
title: When Not to Use Vest
description: Know when HTML validation, a schema, or a form library is enough on its own.
keywords: [Vest alternatives, form validation choice, Zod vs Vest]
---

# When Not to Use Vest

Vest is most useful when validation changes during user interaction. It is more machinery than you need for every value check.

## Use native HTML validation when

- the form has only a few independent fields;
- `required`, `min`, `max`, `pattern`, and input types express the rules;
- custom error timing and server rule sharing are unnecessary.

## Use only a schema API when

- the primary job is parsing an API request, configuration file, or environment variables;
- validation happens once at a clear boundary;
- transformations, codecs, JSON Schema, or ecosystem-specific type integrations are more important than interaction state.

An Enforce schema's `.parse()` API can be enough for this job without creating a Vest suite. Zod, Valibot, ArkType, Joi, and Ajv also have strengths in this category.

## Use a form manager's built-in validation when

- the workflow is tied to one UI framework;
- its field-level rules and error state cover the complete UX;
- rules do not need to run independently on the server or in another interface.

## Choose Vest when the hard part is behavior over time

Vest earns its place when several of these are true:

- only the changed field or step should run;
- earlier results must remain available;
- async checks overlap and stale responses are dangerous;
- fields depend on other fields;
- conditional sections enter and leave the validity model;
- warnings must not block submission;
- the same business rules run in browser and server workflows.

## Combine tools when responsibilities differ

You might use React Hook Form for input handling and Vest with Enforce for both interactive validation and the API boundary. If the project already uses Zod, keep Zod at the boundary and use Vest for the form. Either approach works.

See the [production architecture](./production-architecture.md) and [comparison guide](../vest_vs_the_rest.md).
