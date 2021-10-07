# eslint-plugin-vest

Eslint plugin for vest validations.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-vest`:

```
$ npm install eslint-plugin-vest --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-vest` globally.

## Usage

Add `vest` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["vest"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "exclude-before-test": 2,
    "hook-scope": 2
  }
}
```

## Supported rules

### exclude-before-test

This rule prevents you from calling the `only()` and `skip()` hooks after your test runs, improving performance and preventing unexpected behavior in async tests.

- Bad code example 🚨

```js
validate('MyForm', () => {
  test('fieldName1', 'message', () => {
    // ...
  });

  test('fieldName2', 'message', () => {
    // ...
  });

  only('fieldName2'); // 🚨Should be called before test()
});
```

- Good code example ✅

```js
validate('MyForm', () => {
  only();

  test('fieldName', 'message', () => {
    // ...
  });
});
```

### hook-scope

Makes sure you only call vest hooks from the scope they are allowed to run from.

- Bad code examples 🚨

```js
validate('MyForm', () => {
  warn(); // 🚨Should be called inside test()

  test('fieldName1', 'message', () => {
    // ...
  });

  test('fieldName2', 'message', () => {
    only('fieldName2'); // 🚨Should be called inside validate()
  });
});
```

- Good code examples ✅

```js
validate('MyForm', () => {
  only('fieldName2');

  test('fieldName1', 'message', () => {
    warn();
    // ...
  });

  test('fieldName2', 'message', () => {});
});
```
