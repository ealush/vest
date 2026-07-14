---
title: When Not to Use Vest
description: Choose the smallest validation tool that matches the actual lifecycle and integration needs of your application.
keywords: [Vest alternatives, form validation choice, Zod vs Vest]
---

# When Not to Use Vest

Vest is designed for validation that has a lifecycle. It is not automatically the best choice every time an application checks a value.

## Use native HTML validation when

- the form has only a few independent fields;
- `required`, `min`, `max`, `pattern`, and input types express the rules;
- custom error timing and server rule sharing are unnecessary.

## Use a schema validator alone when

- the primary job is parsing an API request, configuration file, or environment variables;
- validation happens once at a clear boundary;
- transformations, codecs, JSON Schema, or ecosystem-specific type integrations are more important than interaction state.

Zod, Valibot, ArkType, Joi, and Ajv each have strengths in this category.

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

A common production architecture is React Hook Form for input mechanics, Vest for progressive validation state, and Zod for the final API boundary. This is not redundant when each layer owns a distinct failure mode.

See the [production architecture](./production-architecture.md) and [comparison guide](../vest_vs_the_rest.md).
