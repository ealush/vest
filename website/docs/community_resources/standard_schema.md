---
title: Standard Schema Support
sidebar_label: Standard Schema
description: Vest implements the Standard Schema specification, allowing seamless integration with libraries like React Hook Form.
keywords: [Vest, Standard Schema, Validation, React Hook Form, Interoperability]
---

# Standard Schema Support

Vest implements the [Standard Schema V1](https://github.com/standard-schema/standard-schema) specification. This makes Vest compatible with the broader ecosystem of validation tools and form libraries that support this standard (like React Hook Form via a standard-schema resolver).

## Why Standard Schema?

The JavaScript ecosystem has many validation libraries (Zod, Yup, Valibot, etc.). Historically, integrating them with form libraries required specific adapters for each one.

**Standard Schema** solves this by defining a common interface. Because Vest implements this interface, it can "plug and play" with any tool that supports Standard Schema, without needing a dedicated Vest adapter.

## Usage

Both **Suites** and **Enforce Rules** implement the `~standard` interface.

### Using Vest with Libraries

You can pass your suite directly to any library accepting a Standard Schema.

```javascript
import { create } from 'vest';
import { useForm } from 'react-hook-form'; // Example
import { vestResolver } from '@hookform/resolvers/vest'; // Hypothetical or generic standard resolver

const suite = create(() => {
  /* ... */
});

// Library usage (conceptual)
// The library calls suite['~standard'].validate(data) internally
useForm({
  resolver: vestResolver(suite), // Or a generic standard-schema resolver
});
```

### Validating Directly

You can also use the `.validate()` method on the suite, which is an alias for the Standard Schema validation entry point.

```javascript
const result = await suite.validate(data);

if (result.issues) {
  // Handle validation errors (Standard Schema format)
  console.log(result.issues);
} else {
  // Valid data
  console.log(result.value);
}
```

:::tip
Use `suite.validate()` primarily when integrating with third-party libraries (like React Hook Form or Zod resolvers). For direct usage within your application logic, `suite.run()` provides a richer API (`hasErrors`, `isPending`, etc.).
:::
