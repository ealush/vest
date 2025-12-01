---
sidebar_position: 12
title: Suite Serialization and Resumption
description: Serialize and resume Vest suites across different environments, such as client-side and server-side.
keywords:
  [Vest, serialize, resume, client, server, validation, full stack validation]
---

# Suite Serialization and Resumption

Vest provides the ability to serialize and resume validation suites, allowing you to transfer the state of validations between different environments, such as from the server to the client. This feature enhances the user experience by providing immediate feedback on the client-side based on server-side validations.

## Use Cases

- **Client-Server Validation:** Perform validations on the server and seamlessly resume them on the client, providing immediate feedback to the user without re-running all validations.
- **Persistence:** Store the validation state and resume it later, for example, if the user navigates away from a form and returns.
- **Debugging:** Serialize the state of a suite for debugging purposes, making it easier to reproduce and analyze validation issues.

## How it Works

The `SuiteSerializer` object provides two static methods: `serialize` and `resume`.

### `SuiteSerializer.serialize()`

This method takes a Vest suite instance and returns a string representation of the suite's current state. This string can be transferred to another environment, such as the client.

```javascript
import { SuiteSerializer } from 'vest';

const suite = create(data => {
  // ... your validation tests ...
});

suite(formData); // Run the suite with some data

const serializedSuite = SuiteSerializer.serialize(suite);
```

## SuiteSerializer.resume()

This method takes a Vest suite instance and a serialized suite string. It applies the serialized state to the provided suite instance, effectively resuming the validation state from the serialized data.

```js
import { SuiteSerializer } from 'vest';

const suite = create(data => {
  // ... your validation tests ...
});

SuiteSerializer.resume(suite, serializedSuite);

// The suite now has the state from the serializedSuite string
```

## Example: Client-Server Validation

```js
// suite.js
import { create } from 'vest';
import { SuiteSerializer } from 'vest';

const suite = create(data => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  test('email', 'Email is invalid', () => {
    enforce(data.email).isEmail();
  });
});
```

```js
// server.js

app.post('/submit', (req, res) => {
  const formData = req.body;

  suite(formData);

  const serializedSuite = SuiteSerializer.serialize(suite);

  res.json({ serializedSuite });
});
```

```js
// client.js
import suite from './suite';
import { SuiteSerializer } from 'vest';

const form = document.getElementById('myForm');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);  


  fetch('/submit', {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.json())
    .then((data)  
 => {
      SuiteSerializer.resume(suite, data.serializedSuite);
    });
});
```

In this example, the server performs the initial validation and sends the serialized suite state to the client. The client then resumes the suite with the received state, allowing for immediate feedback and a consistent validation experience across both environments.
