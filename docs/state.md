# Understanding Vest's state

Vest is designed to help perform validations on user inputs. The nature of user inputs is that they are filled one by one by the user. In order to provide good user experience, the best approach is to validate fields as the user type, or when they leave the field.

The difficult part when validating upon user interaction is that we want to only validate the field that the user is currently interacting with, and not the rest of the form. This
This can be done with Vest's [`only()` hook](./exclusion). That's where the state mechanism is becoming useful.

When you have skipped fields in your validation suite, vest will try to see if those skipped fields ran in the previous suite, and merge them into the currently running suite result - so the result object you get will include all the fields that your user interacted with.

Vest state is anchored to the suite name (defined in vest.create's first argument), which means the suite name must be unique.

## What Vest's state does

- _Skipped field merge_

As mentioned before - whenever you skip a field, vest will look for it in your previously ran suites and add it to the current result.

- _Lagging async `done` callback blocking_

In case you have an async test that didn't finish from the previous suite run - and you already ran another async test for the same field - vest will block the [`done()`]('./result#done) callbacks for that field from running for the previous suite result.

## What about server side validations?

You probably needs to consider running vest using its [stateless interface](./stateless_validations).
