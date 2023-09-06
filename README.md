# Vest - Declarative validations framework

![Vest](https://cdn.jsdelivr.net/gh/ealush/vest@assets/logo_250.png 'Vest')

[Vest Documentation](https://vestjs.dev)

[![Join Discord](https://badgen.net/discord/online-members/WmADZpJnSe?icon=discord&label=Discord)](https://discord.gg/WmADZpJnSe) [![Github Stars](https://badgen.net/github/stars/ealush/vest?color=yellow&label=Github%20🌟)](https://github.com/ealush/vest) [![Next Tag](https://badgen.net/npm/v/vest/next)](https://vestjs.dev/vest-5-is-ready) [![Version](https://badgen.net/npm/v/vest?&icon=npm)](https://www.npmjs.com/package/vest) [![Downloads](https://badgen.net/npm/dt/vest?label=Downloads)](https://www.npmjs.com/package/vest) [![bundlephobia](https://badgen.net/bundlephobia/minzip/vest)](https://bundlephobia.com/package/vest) [![Status](https://badgen.net/github/status/ealush/vest)](https://github.com/ealush/vest/actions)

---

Vest is a declarative validations framework designed to simplify the process of writing and maintaining form validations for your web application. Inspired by popular unit testing libraries such as Mocha and Jest, Vest allows developers to describe their validation requirements using a suite-like syntax, separating validation logic from feature logic to create more maintainable and readable code.

Vest's framework-agnostic approach means that it can be used with any UI framework, or without any framework at all. With Vest, you can reduce code bloat, improve feature readability and maintainability, and enhance the user experience of your web application.

```js
test('username', 'Username is required', () => {
  enforce(data.username).isNotBlank();
});

test('username', 'Username must be at least 3 chars', () => {
  enforce(data.username).longerThanOrEquals(3);
});

test('username', 'Username already taken', async () => {
  await doesUserExist(data.username);
});
```

## Installation

```
npm i vest
```

## Motivation

Building web applications often involves writing complex forms that require validation. As the complexity of these forms increases, so does the complexity of the validation logic required to ensure data is accurate and complete.

At this point, developers may start to experience issues with code bloat, poor maintainability, and difficulty in managing validation logic across different features of an application. This can lead to bugs, errors, and a poor user experience.

Vest was designed to address these issues by providing a simple, intuitive way to write form validation that is easy to learn, scalable, and extensible. By separating validation logic from feature logic, Vest helps developers create maintainable code that is easy to update, debug, and refactor.

With Vest, developers can reduce the complexity and increase the readability of their code, leading to more efficient development cycles, fewer bugs, and a better user experience overall.

# Why Vest?

Writing form validations can be time-consuming and complex, especially as your web application grows and evolves over time. Vest simplifies the process by providing a set of powerful tools that take care of the annoying parts for you, such as managing validation state and handling async validations.

Vest's declarative syntax is also designed to be easy to learn, especially for developers who are already familiar with unit testing frameworks. With Vest, you can leverage your existing knowledge to write effective form validations quickly and easily.

### 💡 Easy to Learn

Vest adopts the syntax and style of unit testing frameworks, so you can leverage the knowledge you already have to write your form validations.

### 🎨 Framework Agnostic

Vest is framework-agnostic, which means you can use it with any UI framework out there.

### 🧠 Takes Care of the Annoying Parts

Vest manages its validation state, handles async validations, and much more, so you don't have to.

### 🧩 Extendable

You can easily add new kinds of validations to Vest according to your needs.

### ♻️ Reusable Validation Logic

Validation logic in Vest can be shared across multiple features in your app, making it easy to maintain and refactor your codebase.

### 🧬 Supports Declarative Syntax

Vest's declarative syntax makes it easy to describe your form or feature structure and write clear, concise validations.

### 🧪 Promotes Testing and Debugging

By separating validation logic from feature logic, Vest makes it easier to test and debug your code, which can save you time and reduce errors.

# Getting Started

[Vest Documentation](https://vestjs.dev)

Here are some code sandboxes to get you started:

- [React](https://codesandbox.io/s/react-vest-5-gdc698?file=/src/suite.js)
- [Vue](https://codesandbox.io/s/vue-vest-5-d1g236?file=/src/suite.js)
- [Svelte](https://codesandbox.io/s/svelte-vest-5-imnq9z?file=/suite.js)
- [Vanilla](https://codesandbox.io/s/vest-vanilla-js-vest-5-3v4pqk?file=/src/suite.js)
- [Angular](https://github.com/wardbell/ngc-validate) (by @wardbell)

# Contribute

Information describing how to contribute can be found here:

https://github.com/ealush/vest/blob/latest/CONTRIBUTING.md
