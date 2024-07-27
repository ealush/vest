---
sidebar_position: 4
title: Compound Rules
description: These are rules that accept other rules as their arguments. These rules let you validate more complex scenarios with the ergonomics of enforce.
keywords: [Vest, compound, rules, compound rules, anyOf, allOf, oneOf, noneOf]
---

# Compound rules

Alongside the list of rules that only accept data provided by the user, enforce also supports compound rules - these are rules that accept other rules as their arguments. These rules let you validate more complex scenarios with the ergonomics of enforce.

To use it, simply import these rules in your project:

```js
import 'vest/enforce/compounds';
```

These rules will then become available in `enforce`:

- [Compound rules](#compound-rules)
  - [enforce.anyOf() - or validations](#enforceanyof---or-validations)
  - [enforce.allOf() - all/and validations](#enforceallof---alland-validations)
  - [enforce.oneOf()](#enforceoneof)
  - [enforce.noneOf - None rules](#enforcenoneof---none-rules)

## enforce.anyOf() - or validations

Sometimes a value has more than one valid possibility, `any` lets us validate that a value passes _at least_ one of the supplied rules.

```js
enforce(value).anyOf(enforce.isString(), enforce.isArray()).isNotEmpty();
// A valid value would either an array or a string.
```

## enforce.allOf() - all/and validations

`allOf` lets us validate that a value passes _all_ of the supplied rules.

```js
enforce(value).allOf(enforce.isArray(), enforce.longerThan(2));
```

## enforce.oneOf()

enforce.oneOf can be used to determine if _exactly_ one of the rules applies. It will run against rule in the array, and will only pass if exactly one rule applies.

```js
enforce(value).oneOf(
  enforce.isString(),
  enforce.isNumber(),
  enforce.longerThan(1),
);

/*
value = 1      -> ✅ (value is a number)
value = "1"    -> ✅ (value is string)
value = [1, 2] -> ✅ (value is longer than 1)
value = "12"   -> 🚨 (value is both a string and longer than 1)
*/
```

## enforce.noneOf - None rules

enforce.noneOf can be used to determine if _none_ of the rules apply. It will run against each rules supplied, and will only pass if none of the rules pass.

```js
enforce(value).noneOf(
  enforce.isString(),
  enforce.isNumber(),
  enforce.longerThan(1)
);

value = 1      -> 🚨 (value is a number)
value = "1"    -> 🚨 (value is string)
value = [1, 2] -> 🚨 (value is longer than 1)
value = ["12"] -> ✅ (value is not a string and not longer than 1)

```
