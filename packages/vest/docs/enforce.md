# Enforce

Enforce is Vest's assertion library. It is used to validate values within, or outside of a Vest test.

```js
import { enforce, test } from 'vest';

test('username', 'Must be at least three characters long', () => {
  enforce(username).longerThan(2);
});
```

- Further Reading:
  - [List of Enforce rules](./n4s/rules)
  - [Creating Custom Rules](./n4s/custom)
  - [Shape and schema validation](./n4s/compound)
  - [Consuming external rules](./n4s/external)
