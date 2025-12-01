---
sidebar_position: 6
title: Dirty Checking
description: How to check if a field is dirty using Vest
keywords: [Vest, dirty, isDirty, isTested, validation, pristine]
---

# Checking if a field is dirty

:::tip TL;DR

Use `isTested` instead of dirty checking.
:::

Many people search for isDirty / dirty checking. This does not work well with the Vest methodology because Vest does not interact with the form or the DOM and can sometimes even run on the server. Instead, most of the same capability as isDirty can be achieved with [`isTested`](./accessing_the_result.md#istested) which checks if the form has already had validation run on it, assuming it actually means it is dirty.

## What is dirty checking?

In the context of form validation, dirty checking refers to the process of determining whether a field's value has been modified by the user. This information can be used to provide more targeted feedback to the user, such as only displaying validation errors for fields that have been interacted with.

## Why Vest does not do dirty checking

Vest is a validation framework that is designed to be decoupled from the DOM. This means that it does not have access to the state of the form or its fields. As a result, Vest cannot directly determine whether a field is dirty or not.

## Why isTested is a better alternative

Instead of dirty checking, Vest provides the `isTested` method. This method can be used to check if a particular field has been tested. This is a more reliable way to determine whether a field has been interacted with, as it does not rely on the state of the DOM and prevents unnecessary maintenance of state.

## Example

The following code will only display validation errors for the username field if it has been tested:

```js
const result = suite({ username: '' });

if (result.isTested('username')) {
  // Display validation errors for the username field
}
```
