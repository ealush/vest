# Enforce

Enforce is Vest's assertion library. It is used to validate values within, or outside of a Vest test.

```js
import { enforce, test } from 'vest';

test('username', 'Must be at least three characters long', () => {
  enforce(username).longerThan(2);
});
```
