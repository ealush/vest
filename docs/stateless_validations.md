# Server side and stateless validations

By default Vest validations are stateful in order to reduce boilerplate code on the consumer side. This is usually fine, but in some cases, usually when performing server side validations, we would like our validations to be stateless - so that validation results do not leak between validation runs.

Writing stateless validations is just like writing stateful validations, only that instead of declaring your suite using `vest.create`, you directly import your validate function from Vest:

```js
import { validate } from 'vest';

const res = validate('stateless-validation-example', () => {
  // your validation code goes here
});
```

In the example above, we import validate directly from Vest, and in each run it creates a temporary state that gets purged when the validation is finished.
