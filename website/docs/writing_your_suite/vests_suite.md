---
sidebar_position: 1
title: Vest's Suite
description: All your validations reside in a Vest suite. The suite is a function that retains a javascript closure with the current validation state, and it returns the result object. It also exposes some methods to interact with the data, reset the state and handle async validations.
keywords:
  [
    Vest,
    Suite,
    Form,
    Validation,
    create,
    suite callback,
    result object,
    hasErrors,
    suite.get(),
    suite.reset(),
    suite.resetField(),
    suite.remove(),
    async validations,
  ]
---

# Vest's Suite: Writing Your Validation Suite

A Vest suite is the container for all your validations, where you can define and organize them. In this article, we will explain how to create a Vest suite and perform various operations on it.

## Basic Suite Structure

You can create a Vest suite using the `create` function provided by the `Vest` module. Here's a basic example:

```js
import { create } from 'vest';

const suite = create((data = {}) => {
  // ... Your validations go here
});
```

You pass a callback function to the `create` function, which takes the form data as its first argument, and any other arguments you might want to pass. You can then define your validations inside this function.

## Running the Suite

You can run your suite by calling it with the form data and any additional arguments you want to pass:

```js
const suite = create((data = {}, currentField) => {
  // ... Your validations go here
});

suite(formData, fieldName);
```

You can pass as many arguments as you need to the suite function, and they will be available inside the callback function.

## Getting the Current Suite State

There are two main ways of getting the current state of our suite:

### Using the Result Object

When you run the suite, it returns a result object that contains the validation state:

```js
const result = suite(formData, fieldName);

result.hasErrors(); // boolean
```

The result object is similar to the one you define in your suite function, except that it does not have the `done` property that allows you to set callbacks for async validations.

### Using `suite.get()`

You can also get the current state of your suite by calling `suite.get()` at any time, even within the suite itself. This method returns the current validation state, which may be partial if called within a running suite.

This method is especially useful if we want to access our suite state from within a running suite, or when out of context - for example, from a different UI component than our form.

## Cleaning up the Suite State

If you need to clean up the validation state of your suite, you can call `suite.reset()`. This will reset the state of the suite and cancel any pending async validations that might still be running.

## Resetting a Single Field

To reset the validity of a single field, you can call `suite.resetField(fieldName)`. This can be useful, for example, when you only want to run the validation on blur.

## Removing a Single Field from the Suite State

In some cases, you may want to remove a field from the suite state. For example, when the user removes a dynamically added field. In this case, you can call `suite.remove(fieldName)` to remove the field from the state and cancel any pending async validations that might still be running.

Note that you don't need to use `suite.remove` very often, as most users can simply use `reset` and `omitWhen`.

## Subscribing to Suite State Changes

You can subscribe to changes in the suite state by calling `suite.subscribe(callback)`. The callback will be called whenever the suite state changes internally.

```js
suite.subscribe(() => {
  const result = suite.get();
  // ... Do something with the result
});
```

### Unsubscribing from Suite State Changes

The `subscribe` method returns a function that you can call to unsubscribe from the suite state changes:

```js
const unsubscribe = suite.subscribe();
```

## Using Schemas for Type Safety

Vest allows you to pass an [enforce schema](../enforce/builtin-enforce-plugins/schema_rules) as the second parameter to `create()`. This provides both runtime validation and TypeScript type inference for your validation data.

### Basic Schema Usage

```typescript
import { create, test, enforce } from 'vest';

const schema = enforce.shape({
  username: enforce.string(),
  email: enforce.string(),
  age: enforce.number(),
});

const suite = create(schema, data => {
  // data is automatically typed based on the schema
  test('username', 'Username is required', () => {
    enforce(data.username).isNotEmpty();
  });

  test('email', 'Must be a valid email', () => {
    enforce(data.email).isEmail();
  });

  test('age', 'Must be 18 or older', () => {
    enforce(data.age).greaterThanOrEquals(18);
  });
});
```

### Schema Type Inference

When you provide a schema, Vest automatically infers the TypeScript types for your data parameter. This works with different schema types:

**Strict Schemas with `enforce.shape()`**

```typescript
const schema = enforce.shape({
  username: enforce.string(),
  email: enforce.string(),
});

const suite = create(schema, data => {
  // data: { username: string; email: string }
  // TypeScript will error if you try to access properties not in the schema
});
```

**Loose Schemas with `enforce.loose()`**

```typescript
const schema = enforce.loose({
  username: enforce.string(),
  email: enforce.string(),
});

const suite = create(schema, data => {
  // data: { username: string; email: string; [key: string]: unknown }
  // Can access additional properties not defined in the schema
});
```

**Partial Schemas with `enforce.partial()`**

```typescript
const schema = enforce.partial({
  username: enforce.string(),
  email: enforce.string(),
});

const suite = create(schema, data => {
  // data: { username?: string; email?: string }
  // All properties are optional
});
```

### Runtime Type Information

When using schemas, the suite result includes a `types` property that provides runtime type information about your data:

```typescript
const result = suite(formData);

// Access the runtime type information
console.log(result.types);
// Output: { username: 'string', email: 'string', age: 'number' }
```

This is particularly useful for dynamic forms or when you need to validate the shape of data at runtime.

### Backward Compatibility

For backward compatibility, you can still pass a suite name as the first parameter. The schema would then be the second parameter, and the callback the third:

```typescript
const suite = create('suite_name', schema, data => {
  // ...
});
```

However, it is recommended to omit the suite name and use the schema-first approach for cleaner code.
