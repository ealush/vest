---
sidebar_position: 5
title: Consuming third party rules
description: Here's how to use third party rules.
keywords:
  [
    enforce,
    external rules,
    third party,
    input validation,
    validator.js,
    validator,
    npm,
    isEmail,
  ]
---

# Consuming External Rules with Enforce

Enforce is a versatile assertion library that provides a wide range of validation rules to ensure the validity of input data in your app. However, in some cases, you may need additional validation rules that are not included in Enforce's core library. This is where external rules come in.

## The Need for External Rules

Enforce includes the most common rules needed for input validation and does not make assumptions about your business logic constraints. This is why it does not include certain validation rules such as `isEmail` or `isPhoneNumber`, which may be required for your app's validation needs.

Fortunately, there are numerous packages available, such as `validator.js`, that provide additional validation rules. `validator.js` is a popular and highly compatible package that can be used in conjunction with Enforce to add these rules to your app's validation.

## Importing External Rules

Before you can use external rules with Enforce, you need to install and import the relevant packages. For example, to use the `isEmail` and `isMobilePhone` rules from `validator.js`, you would install the package using npm:

```
npm i validator
```

Then, in your code, you can import the individual rules that you need:

```js
import isEmail from 'validator/es/lib/isEmail';
import isMobilePhone from 'validator/es/lib/isMobilePhone';
```

Note that importing the entire `validator.js` package can increase your bundle size unnecessarily, so it is recommended to import only the individual rules that you need.

## Adding External Rules to Enforce

Once you have imported the relevant external rules, you can add them to Enforce's library of validation rules using the `enforce.extend` method:

```js
enforce.extend({ isEmail, isMobilePhone });
```

This method takes an object that maps the rule name to the validation function. In this example, `isEmail` and `isMobilePhone` are mapped to their respective validation functions.

## Using External Rules with Enforce

After adding the external rules to Enforce, you can use them in your validation tests just like any other Enforce rule. Here's an example that uses the `isEmail` rule to validate an email address:

```js
enforce('example@example.com').isEmail(); // ✅
enforce('example[at]example[dot]com').isEmail(); // 🚨
```

In this example, the `enforce` function is called with an email address as input data. The `isEmail` rule is then called to validate the email address, and because it is a valid email address, the validation passes and a checkmark symbol is returned. The second example is not a valid email address, so the validation fails and an error symbol is returned.

A full list of the supported validator.js rules can be found on [npmjs.com/package/validator](https://www.npmjs.com/package/validator).
