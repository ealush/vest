---
sidebar_position: 1
title: Getting started with Vest
description: Vest is a powerful framework that allows you to write and run validations for your JavaScript code. This guide will walk you through the installation process and show you how to write your first suite.
keywords: [Vest, Get started, Quickstart, Validation, JavaScript]
---

# Introduction to Vest

Vest is a powerful and easy-to-use JavaScript validation framework that allows you to write and run validations for your code. It is designed to handle complex validation scenarios while still being simple to use. This guide will show you how to install and use Vest@5, the latest version of the framework that's currently in development.

## Installation

To get started with Vest, you will need to install it using npm. Open up your terminal and run the following command:

```
npm i vest
```

This will install Vest in your project.

## Writing your first suite

Once you've installed Vest, you can start writing your first validation suite. A Vest suite is very similar to a unit testing suite in Jest or Mocha, so if you're familiar with those frameworks, the following code should look familiar:

```js
// suite.js
import { create, test, enforce } from 'vest';

const suite = create((data = {}) => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  test('username', 'Username must be at least 3 characters long', () => {
    enforce(data.username).longerThan(2);
  });
});

export default suite;
```

In this example, we're creating a new validation suite using the `create` function provided by Vest. The suite takes a callback function that defines the validation rules. In this case, we're defining two rules for the `username` field: it must not be blank, and it must be at least 3 characters long. We're using the `test` function to define each rule, and the `enforce` function to define the validation conditions.

Once you've defined your validation suite, you can use it in your application code to validate data. Here's an example of how you might use the suite to validate a form submission:

```js
import suite from './suite';

const formData = {
  username: '',
  password: '',
};

const validationResult = suite(formData);

if (validationResult.isValid()) {
  // Submit the form
} else {
  // Handle validation errors here
}
```

In this example, we're importing our validation suite and passing it some form data. The `suite` function returns a `ValidationResult` object that contains information about the validation outcome. We're using the `isValid` function to check if there are any errors in the result.
