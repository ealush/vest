---
sidebar_position: 10
---

# Understanding Vest's state

Vest is designed to help perform validations on user inputs. The nature of user inputs is that they are filled one by one by the user. In order to provide good user experience, the best approach is to validate fields as the user type, or when they leave the field.

The difficult part when validating upon user interaction is that we want to only validate the field that the user is currently interacting with, and not the rest of the form. This
This can be done with Vest's [`only()` hook](./writing_your_suite/including_and_excluding/skip_and_only.md). That's where the state mechanism is becoming useful.

When you have skipped fields in your validation suite, vest will try to see if those skipped fields ran in the previous suite, and merge them into the currently running suite result - so the result object you get will include all the fields that your user interacted with.

## What Vest's state does

- _Skipped field merge_

As mentioned before - whenever you skip a field, vest will look for it in your previously ran validations and add it to the current result.

- _Lagging async `done` callback blocking_

In case you have an async test that didn't finish from the previous suite run - and you already ran another async test for the same field - vest will block the [`done()`](./writing_your_suite/result_object.md#done) callbacks for that field from running for the previous suite result.

# Drawbacks when using stateful validations

When the validations are stateful, you get the benefit of not having to know which fields have already been validated, or keeping track of their previous results.

The drawback of this approach is that when you run the same form in multiple-unrelated contexts, the previous validation state still holds the previous result.

Here are a few examples and their solutions:

## Single Page Application - suite result retention

This scenario applies to cases when your form is a part of a single-page-app with client-side routing. Let's assume your user successfully submits the form, navigates outside of the page, and then later in the same session, navigate back to the form.

The form will then have a successful validation state since the previous result is stored in the suite state.

### Solution: Resetting suite state with `.reset();`

In some cases, such as form reset, you want to discard of previous validation results. This can be done with `vest.reset()`.

`.reset` disables all pending async tests in your suite and empties the state out.

### Usage:

`.reset()` Is a property on your validation suite. Calling it will remove your suite's state.

```js
import { create } from 'vest';

const suite = create(() => {
  // Your tests go here
});

suite.reset(); // validation result is removed from Vest's state.
```

## Dynamically added fields

When your form contains dynamically added fields, for example - when a customer can add fields to their checkout form on the fly, those items would still exist in the suite state when the user removed them from the form. This means that you may have an unsuccessful suite result, even though it should be successful.

### Solution: Removing a single field from the validation result

Instead of resetting the whole suite, you can alternatively remove just one field. This is useful when dynamically adding and removing fields upon user interaction - and you want to delete a deleted field from the state.

```js
import { create, test } from 'vest';

const suite = create(() => {
  // Your tests go here

  test('username', 'must be at least 3 chars long', () => {
    /*...*/
  });
});

suite.remove('username'); // validation result is removed from Vest's state.
```

## Server-side validations

When running your validations on the server, you want to keep each request isolated with its own state, and not update the same validation state between requests. Doing that can cause failed validations to seem successful or vice versa due to different requests relying on the same state.

### Solution: Treat validations as stateless

While when on the browser you usually want to treat validations as statefull - even though it might sometimes not be the case - on the server you almost always want to treat your validations as stateless.

To do that, all you need to do is wrap your suite initialization with a wrapper function. Whenever you call that function, a new suite state will be created.

### Example

```js
import { create } from 'vest';

function suite(data) {
  return create(() => {
    test('username', 'username is required', () => {
      enforce(data.username).isNotEmpty();
    });
  })();
  // Note that we're immediately invoking our suite
  // so what we return is actually the suite result
}

const result = suite({ username: 'Mike123' });
```
