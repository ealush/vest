# Vest - Declarative validations framework

[Vest Documentation](https://vestjs.dev)

[![Join Discord](https://badgen.net/discord/online-members/WmADZpJnSe?icon=discord&label=Discord)](https://discord.gg/WmADZpJnSe) [![Github Stars](https://badgen.net/github/stars/ealush/vest?color=yellow&label=Github%20🌟)](https://github.com/ealush/vest) [![Version](https://badgen.net/npm/v/vest?&icon=npm)](https://www.npmjs.com/package/vest) [![Downloads](https://badgen.net/npm/dt/vest?label=Downloads)](https://www.npmjs.com/package/vest) [![bundlephobia](https://badgen.net/bundlephobia/minzip/vest)](https://bundlephobia.com/package/vest) [![Status](https://badgen.net/github/status/ealush/vest)](https://github.com/ealush/vest/actions)

![Vest](https://cdn.jsdelivr.net/gh/ealush/vest@assets/logo_250.png 'Vest')

Vest is a form-validation framework inspired by unit testing libraries like Mocha or Jest; It is designed to be easy to use and easy to learn by introducing their declarative syntax.

The idea behind Vest is that your validations can be described as a suite - a contract that reflects your form or feature structure. Vest is framework agnostic, meaning it can be used with any UI framework, or without any framework at all.

Using Vest for form validation can reduce bloat, improve feature readability and maintainability.

```js
test('username', 'Username is required', () => {
  enforce(data.username).isNotBlank();
});

test('username', 'Username must be at least 3 chars', () => {
  enforce(data.username).longerThanOrEquals(3);
});
```

## Installation

```
npm i vest
```

## Motivation

Writing forms is an integral part of building web apps, and even though it may seem trivial at first - as your feature grows over time, so does your validation logic grows in complexity.

Vest tries to remediate this by separating validation logic from feature logic, so it's easier to maintain over time and refactor when needed.

# Why Vest?

💡 Vest is easy to Learn. Vest adopts the syntax and style of unit testing frameworks, so you can leverage the knowledge you already have to write your form validations.

🎨 Vest is framework agnostic. You can use Vest with any UI framework out there.

🧠 Vest takes care of all the annoying parts for you. It manages its validation state, handles async validations, and much more.

🧩 Vest is extendable. You can easily add new kinds of validations to Vest according to your needs.

♻️ Validation logic in Vest can be shared across multiple features in your app.

# Getting Started

[Vest Documentation](https://vestjs.dev)

Here are some code sandboxes to get you started:

- [React](https://codesandbox.io/s/react-28jwx?file=/src/suite.js)
- [Vue](https://codesandbox.io/s/vue-hsyt8?file=/src/suite.js)
- [Svelte](https://codesandbox.io/s/svelte-tsfhx?file=/suite.js)
- [Vanilla](https://codesandbox.io/s/vest-vanilla-js-35u8e?file=/src/suite.js)
