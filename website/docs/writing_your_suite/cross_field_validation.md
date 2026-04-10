---
sidebar_position: 8
title: Cross-Field Validation
description: Using dependsOn() to link validation states between related fields and automate focused updates.
keywords: [Vest, dependsOn, Cross-Field Validation, Dependency Graph, Focus Sync, Validity Link]
---

# Cross-Field Validation

In many forms, the validity of one field depends on the state of another. A classic example is a **Password Matching** requirement: the "Confirm Password" field is only valid if it matches the "Password" field, AND the "Password" field itself is valid.

Vest provides the `.dependsOn()` API to manage these relationships declaratively.

## The `dependsOn()` API

You can declare a dependency by chaining `.dependsOn()` to any test.

```javascript
test('confirmPassword', 'Passwords must match', () => {
  enforce(data.confirmPassword).equals(data.password);
}).dependsOn('password');
```

By adding this dependency, you tell Vest that `confirmPassword` is coupled with `password`. Vest will now coordinate their validation behavior automatically.

## The 3 Pillars of `dependsOn`

When you link fields with `dependsOn`, Vest enforces three core behaviors:

### 1. Focus Sync (Inclusion)
When you run a focused update (e.g., using `suite.only('password')` on blur), Vest automatically includes any fields that depend on it.

This means that if a user updates their password, the "Confirm Password" validation will also run, ensuring the two fields stay in sync without you having to manually call `suite.only(['password', 'confirmPassword'])`.

### 2. Dirty Guard
Vest is careful not to "scream" errors at the user too early. A dependent field will only be auto-included if it has been validated at least once before (it is "dirty").

If a user touches the "Password" field for the first time, Vest won't trigger an error on "Confirm Password" until the user has actually interacted with it as well.

### 3. Validity Link
A field's final validity is transitive. If `confirmPassword` depends on `password`, then `confirmPassword` can **never be valid** as long as `password` is invalid — even if its own internal check (matching the strings) passes.

## Chaining and Transitivity

Dependencies can be chained to form deep validation graphs. Vest automatically resolves these transitions iteratively to ensure performance and safety.

```javascript
// f1 -> f2 -> f3
test('f1', () => ...).dependsOn('f2');
test('f2', () => ...).dependsOn('f3');
```

In this setup:
- Focusing `f3` will include both `f2` and `f1`.
- If `f3` is invalid, both `f2` and `f1` will be marked as invalid.

## Circular Dependencies

If your fields depend on each other (e.g., a "Start Date" must be before "End Date", and "End Date" must be after "Start Date"), you can declare circular dependencies safely.

```javascript
test('startDate', () => ...).dependsOn('endDate');
test('endDate', () => ...).dependsOn('startDate');
```

Vest detects these cycles and ensures that the validation settles correctly without infinite loops or stack overflows.

## Async Dependencies

If a dependency is an asynchronous test, the dependent field will reflect the `pending` state of its upstream dependency. The dependent field will only become `valid` once its internal tests AND all its async dependencies have passed.

## Interaction with `optional()`

If a dependency is marked as `optional()` and is currently omitted from the run, it is considered **Valid**. This allows its dependents to remain valid as well.

## Summary

`dependsOn()` simplifies complex form logic by:
- **Automating Focused Runs**: No more manually calculating which related fields to include on blur.
- **Ensuring Data Integrity**: Validity is naturally propagated through the dependency graph.
- **Reducing Noise**: Maintaining the "don't show errors too early" philosophy of Vest.
