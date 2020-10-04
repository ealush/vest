# Understanding Vest's state

Vest is designed to help perform validations on user inputs. The nature of user inputs is that they are filled one by one by the user. In order to provide good user experience, the best approach is to validate fields as the user type, or when they leave the field.

The difficult part when validating upon user interaction is that we want to only validate the field that the user is currently interacting with, and not the rest of the form. This
This can be done with Vest's [`only()` hook](./exclusion). That's where the state mechanism is becoming useful.

When you have skipped fields in your validation suite, vest will try to see if those skipped fields ran in the previous suite, and merge them into the currently running suite result - so the result object you get will include all the fields that your user interacted with.

## What Vest's state does

- _Skipped field merge_

As mentioned before - whenever you skip a field, vest will look for it in your previously ran validations and add it to the current result.

- _Lagging async `done` callback blocking_

In case you have an async test that didn't finish from the previous suite run - and you already ran another async test for the same field - vest will block the [`done()`]('./result#done) callbacks for that field from running for the previous suite result.

## Resetting suite state with `.reset();`

In some cases, such as form reset, you want to discard of previous validation results. This can be done with `vest.reset()`.

`.reset` disables all pending async tests in your suite and empties the state out.

### Usage:

`.rese()` Is a property on your validation suite, calling it will remove your suite's state.

```js
import vest from 'vest';

const v = vest.create('suite_name', () => {
  // Your tests go here
});

v.reset(); // validation result is removed from Vest's state.
```
