# Enforce - n4s

[![Join Discord](https://badgen.net/discord/online-members/WmADZpJnSe?icon=discord&label=Discord)](https://discord.gg/WmADZpJnSe) [![Version](https://badgen.net/npm/v/vest?&icon=npm)](https://www.npmjs.com/package/n4s) [![Downloads](https://badgen.net/npm/dt/n4s?label=Downloads)](https://www.npmjs.com/package/n4s) [![bundlephobia](https://badgen.net/bundlephobia/minzip/n4s)](https://bundlephobia.com/package/n4s) [![Status](https://badgen.net/github/status/ealush/vest)](https://github.com/ealush/vest/actions)

Enforce is a validations assertions library. It provides rules that you can test your data against.

By default, enforce throws an error when your validations fail. These errors should be caught by a validation testing framework such as [Vest](https://github.com/ealush/vest).

You can extend Enforce per need, and you can add your custom validation rules in your app.

```js
import { enforce } from 'n4s';

enforce(4).isNumber();
// passes

enforce(4).isNumber().greaterThan(2);
// passes

enforce(4)
  .lessThan(2) // throws an error, will not carry on to the next rule
  .greaterThan(3);
```

## Installation

```
npm i n4s
```

## Non throwing validations

> This functionality replaces the no-longer supported ensure export, as it performs the same functionality with better performance.

If you wish to use enforce's functionality safely with a boolean return interface, you can use its lazy validation interface:

```js
enforce.isArray().longerThan(3).test([1, 2, 3]);
```

[Read the docs](https://ealush.github.io/n4s)

- [List of enforce rules](https://ealush.github.io/n4s/#/rules)
- [Schema validation](https://ealush.github.io/n4s/#/shape)
- [Custom enforce rules](https://ealush.github.io/n4s/#/custom)
