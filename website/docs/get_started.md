---
sidebar_position: 1
---

# Getting Started

## Installation

To install the stable version of Vest, run:

```
npm i vest
```

You can also embed Vest directly as a script tag in your page:

```html
<script src="https://unpkg.com/vest@4/dist/umd/vest.production.js"></script>
```

## Writing your first suite

A Vest suite is very similar to a unit testing suite in Jest or Mocha, so the following might look familiar:

```js
// suite.js
import { create, test, enforce } from 'vest';

const suite = create((data = {}) => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  test('username', 'Username must be at least 3 characters long', () => {
    enforce(data.username).longerThan(2);
  });
});

export default suite;
```

Vest is a powerful framework, and it has quite a few features. In the following sections, you'll learn Vest's core concepts and how to make use of it.
