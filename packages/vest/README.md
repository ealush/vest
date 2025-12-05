# Vest - Declarative validations framework

![Vest](https://cdn.jsdelivr.net/gh/ealush/vest@assets/logo_250.png 'Vest')

[Vest Documentation](https://vestjs.dev)

[![Join Discord](https://badgen.net/discord/online-members/WmADZpJnSe?icon=discord&label=Discord)](https://discord.gg/WmADZpJnSe) [![Github Stars](https://badgen.net/github/stars/ealush/vest?color=yellow&label=Github%20🌟)](https://github.com/ealush/vest)
[![Next Tag](https://badgen.net/npm/v/vest/next)](https://vestjs.dev/vest-5-is-ready) [![Version](https://badgen.net/npm/v/vest?&icon=npm)](https://www.npmjs.com/package/vest) [![Downloads](https://badgen.net/npm/dt/vest?label=Downloads)](https://www.npmjs.com/package/vest) [![bundlephobia](https://badgen.net/bundlephobia/minzip/vest)](https://bundlephobia.com/package/vest) [![Status](https://badgen.net/github/status/ealush/vest)](https://github.com/ealush/vest/actions)

---

Vest is a validation framework that looks and feels like a unit testing framework. It is designed to be easy to learn, highly maintainable, and framework-agnostic.

Write your validations as if they were unit tests, and run them in your app.

```js
import { create, test, enforce } from 'vest';

const suite = create(data => {
  test('username', 'Username is required', () => {
    enforce(data.username).isNotBlank();
  });

  test('username', 'Username must be at least 3 chars', () => {
    enforce(data.username).longerThanOrEquals(3);
  });

  test('username', 'Username already taken', async () => {
    await doesUserExist(data.username);
  });
});

const result = await suite.run(formData);
```

## Why Vest?

Writing form validations can be messy. Vest cleans it up by separating validation logic from feature logic and providing a familiar, powerful syntax.

### 💡 Easy to Learn

Vest adopts the syntax and style of unit testing frameworks (Mocha, Jest). If you've written a test, you already know Vest.

### 🎨 Framework Agnostic

React, Vue, Svelte, Angular, or Vanilla JS—Vest works everywhere. It doesn't depend on your UI library.

### 🛡️ Type Safe

Vest is written in TypeScript and provides first-class type support, including typed suites and results.

### 🔌 Standard Schema Support

Vest implements the [Standard Schema](https://github.com/standard-schema/standard-schema) spec, making it a drop-in replacement for Zod or Yup in libraries like React Hook Form.

### ⚡ SSR & Hydration

Built-in support for server-side validation and state hydration (`runStatic`, `SuiteSerializer`), enabling seamless full-stack validation flows.

### 🧩 Extendable & Composable

Create custom rules, compose existing ones, or use the optional schema validation (`n4s`) to enforce data structure.

## Examples

### Basic suite with result helpers

```js
import { create, test, enforce } from 'vest';

const signupSuite = create(data => {
  test('email', 'Email is required', () => {
    enforce(data.email).isNotBlank().isEmail();
  });

  test('password', 'Password must be at least 8 characters', () => {
    enforce(data.password).isString().longerThanOrEquals(8);
  });
});

const result = await signupSuite.run({ email: '', password: 'short' });
result.hasErrors('email'); // true
result.getErrors('password'); // ['Password must be at least 8 characters']
```

### Mixing sync and async validations

```js
import { create, test, enforce } from 'vest';

const profileSuite = create(data => {
  test('handle', 'Handle must be unique', async () => {
    const exists = await handleExists(data.handle);
    enforce(exists).isFalse();
  });

  test('handle', 'Handle must be 3-16 characters', () => {
    enforce(data.handle)
      .isString()
      .longerThanOrEquals(3)
      .shorterThanOrEquals(16);
  });
});

const result = await profileSuite.run({ handle: 'ada' });
if (result.hasErrors()) {
  console.log(result.getErrors());
}
```

## Installation

```shell
npm i vest
```

## Getting Started

Check out the [Vest Documentation](https://vestjs.dev) for guides, API references, and examples.

### Playgrounds

- [React](https://codesandbox.io/s/react-vest-5-gdc698?file=/src/suite.js)
- [Vue](https://codesandbox.io/s/vue-vest-5-d1g236?file=/src/suite.js)
- [Svelte](https://codesandbox.io/s/svelte-vest-5-imnq9z?file=/suite.js)
- [Vanilla](https://codesandbox.io/s/vest-vanilla-js-vest-5-3v4pqk?file=/src/suite.js)

## Contribute

We welcome contributions! See [CONTRIBUTING.md](https://github.com/ealush/vest/blob/latest/CONTRIBUTING.md) for details.
