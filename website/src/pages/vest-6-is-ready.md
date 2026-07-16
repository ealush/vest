---
title: Vest 6 is now stable
description: Vest 6 is now the default stable release, with major improvements to the API, type safety, and standard compliance.
keywords: [Vest, v6, upgrade, schema, validation, standard schema]
---

# Vest 6 is now stable

Vest 6 is now the default stable release. This version represents a significant architectural shift, focusing on improved developer experience, predictability, and stronger type safety.

While Vest 5 focused on runtime performance and execution modes, Vest 6 overhauls the API surface to make suite interaction more intuitive and standard-compliant.

Install the latest stable version:

```bash
npm install vest
```

## Highlights

### The Suite Object

The most immediate change in Vest 6 is how you interact with a suite. In previous versions, `create` returned a function that you executed directly.

In Vest 6, `create` returns a **Suite Object**. This object provides a unified interface for running, resetting, and inspecting your suite.

```javascript
import { create, test } from 'vest';

const suite = create(data => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });
});

// Run the suite
const result = suite.run(formData);

// Reset state
suite.reset();
```

### Native Promise Support

Async handling has been simplified. In V6, `suite.run()` returns a result object that also behaves as a Promise. This removes the need for the `promisify` utility or specific callback patterns for async suites.

```javascript
// Await the result directly
const result = await suite.run(data);

if (result.isValid()) {
  // ...
}
```

### Integrated Schema Validation

Vest 6 introduces optional schema validation using `n4s` (enforce). You can now pass a schema definition to `create`. This validates the structure of your data before your tests run and, crucially, infers TypeScript types for your suite's data argument.

```javascript
import { create, test, enforce } from 'vest';

const schema = enforce.shape({
  username: enforce.isString(),
  age: enforce.isNumber(),
});

// 'data' is now strongly typed based on the schema above
const suite = create(data => {
  test('username', 'Must be at least 3 chars', () => {
    enforce(data.username).longerThan(2);
  });
}, schema);
```

### Standard Schema Compliance

Vest 6 implements the [Standard Schema](https://github.com/standard-schema/standard-schema) specification. This allows Vest suites to be used directly by other libraries and tools that support this standard, increasing interoperability across the ecosystem.

```javascript
const result = await suite['~standard'].validate(data);
```

Standard Schema consumers normally call this hook automatically. Vest application code should continue to use `suite.run()` for stateful execution and `suite.runStatic()` for independent server execution.

### Top-Level Memoization

The memoization API has been promoted to a top-level export. Instead of being attached to a specific test, `memo` now wraps a block of logic. This allows you to memoize groups of tests or complex calculations more flexibly.

```javascript
import { create, test } from 'vest';
import { memo } from 'vest/memo';

create(data => {
  memo(() => {
    test('heavy-computation', () => {
      // ...
    });
  }, [data.field]);
});
```

## Migrating from V5

If you're upgrading from V5, a migration step is required due to changes to the core API (specifically `suite.run()`). We have prepared a detailed [Upgrade Guide](https://vestjs.dev/docs/upgrade_guide) to help you transition your codebase.

The guide also includes a prompt you can use with LLMs to help automate the refactoring process.

## Feedback

This release contains internal architectural changes designed to improve stability and runtime safety. We encourage you to try it out and report any issues on [GitHub](https://github.com/ealush/vest/issues).
