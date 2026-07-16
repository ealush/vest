---
title: Validate Dynamic Lists and Arrays
description: Preserve correct validation state when users insert, remove, or reorder repeated form rows.
keywords: [array validation, dynamic form, repeated fields, Vest each]
---

# Validate Dynamic Lists and Arrays

Index-based validation state breaks when rows move. If the first traveler is removed, the second traveler must not inherit the first traveler's error.

Use `each()` and give every test the stable identity of its item:

```ts
import { create, each, enforce, test } from 'vest';

export const tripSuite = create(data => {
  each(data.travelers, traveler => {
    test(
      'travelerName',
      'Traveler name is required',
      () => enforce(traveler.name).isNotBlank(),
      `${traveler.id}:name`,
    );

    test(
      'passportNumber',
      'Passport number is required',
      () => enforce(traveler.passportNumber).isNotBlank(),
      `${traveler.id}:passport`,
    );
  });
});
```

The final `test` argument is the tracking key. It must be stable and unique to that test, so combine a database ID, UUID, or client-generated stable ID with the rule identity—not the array position.

```ts
const added = {
  id: crypto.randomUUID(),
  name: '',
  passportNumber: '',
};
```

Run the relevant named field after editing a row. Vest reconciles keyed tests and removes state belonging to deleted items on the next run.

For item-specific rendering, keep the same stable ID in the UI and validation data. This gives React and Vest the same answer to “which logical row is this?”

Read the complete [dynamic tests reference](../writing_tests/advanced_test_features/dynamic_tests.md).
