---
title: Standard Schema Support
sidebar_label: Standard Schema
description: Use Vest suites with tools that implement the Standard Schema V1 interface.
keywords: [Vest, Standard Schema, React Hook Form, interoperability]
---

# Standard Schema Support

Vest suites and Enforce rules implement [Standard Schema V1](https://standardschema.dev/). This gives ecosystem tools a vendor-neutral way to call Vest without a Vest-specific adapter.

## React Hook Form

The official React Hook Form resolver package includes a Standard Schema resolver:

```shell
npm install vest react-hook-form @hookform/resolvers
```

```tsx
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import { useForm } from 'react-hook-form';
import { create, enforce, test } from 'vest';

const suite = create(data => {
  test('email', 'Enter a valid email address', () => {
    enforce(data.email).isEmail();
  });
});

function EmailForm() {
  const form = useForm({
    resolver: standardSchemaResolver(suite),
  });

  return (
    <form onSubmit={form.handleSubmit(console.log)}>
      <input {...form.register('email')} />
      <p>{form.formState.errors.email?.message}</p>
      <button type="submit">Continue</button>
    </form>
  );
}
```

The resolver is the simplest option when the form manager should validate the whole form. To validate one field during interaction, run that field through the same suite:

```ts
suite.only('email').run(form.getValues());
```

See the tested [production architecture](../guides/production-architecture.md) for focused async validation, warnings, conditionals, a replaceable Zod boundary, and a stateless server run. An Enforce schema can own the boundary instead.

## Direct Standard Schema validation

Most application code should pass the suite to a compatible consumer and let that tool invoke the Standard Schema contract. If you are implementing or testing an integration directly, call the contract explicitly:

```ts
const output = await suite['~standard'].validate(data);

if (output.issues) {
  console.log(output.issues);
} else {
  console.log(output.value);
}
```

For normal Vest application code, use `suite.run()` for stateful execution or `suite.runStatic()` for an independent server run. Those are the primary APIs and expose Vest selectors such as `isPending`, `isTested`, `getWarnings`, and group status. `.validate()` exists only for Standard Schema interoperability.

## Enforce rules

Enforce schemas also expose the Standard Schema interface, making them suitable for parsing-oriented integrations that do not need Vest's stateful suite runtime.

Read [Vest, schema validators, and form libraries](../vest_vs_the_rest.md) for guidance on assigning responsibilities between these layers.
