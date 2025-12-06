---
sidebar_position: 3
title: Date Enforce Rules
description: Documentation for the date enforce rules, including isDate, isAfter, isBefore, and isISO8601 rules, along with their options and configurations.
keywords:
  [
    date,
    date enforce rules,
    isDate rule,
    isAfter rule,
    isBefore rule,
    isISO8601 rule,
    date validation,
  ]
---

# Date Enforce Rules

The date enforce rules provide functionality to validate and manipulate date values. This documentation covers the `isDate`, `isAfter`, `isBefore`, and `isISO8601` rules, along with their options and configurations.

These rule exposes the [`validator.js`](https://www.npmjs.com/package/validator) date rule, and accepts the same options.

## isDate Rule

The `isDate` rule checks whether a given value is a valid date. It accepts various options to customize the validation behavior.

```javascript
enforce(value).isDate(options);
```

### Options

The `isDate` rule accepts an optional `options` object to customize the validation behavior. The available options are as follows:

| Option       | Default Value  | Description                                                                                                                   |
| ------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `format`     | `'YYYY/MM/DD'` | A string specifying the expected date format. The default format is `'YYYY/MM/DD'`.                                           |
| `strictMode` | `false`        | A boolean value indicating whether strict mode should be enabled. In strict mode, only strings matching the format are valid. |
| `delimiters` | `['/', '-']`   | An array of allowed date delimiters. By default, both `'/'` and `'-'` are considered valid delimiters.                        |

#### Valid Date Formats

The `format` option accepts various valid date formats, including:

- `'YYYY/MM/DD'`
- `'YY/MM/DD'`
- `'YYYY-MM-DD'`
- `'YY-MM-DD'`
- `'MM/DD/YYYY'`
- `'MM/DD/YY'`
- `'MM-DD-YYYY'`
- `'MM-DD-YY'`
- `'DD/MM/YYYY'`
- `'DD/MM/YY'`
- `'DD-MM-YYYY'`
- `'DD-MM-YY'`

### Usage Example

```javascript
import { enforce } from 'vest';
import 'vest/enforce/date';

const dateString = '2002-07-15';

// Basic usage
enforce(dateString).isDate();

// Usage with options
enforce(dateString).isDate({
  format: 'YYYY-MM-DD',
  strictMode: true,
  delimiters: ['-', '/'],
});
```

## isAfter Rule

The `isAfter` rule checks if a given date string is after a specified date. It accepts an optional `comparisonDate` parameter to compare against.

```javascript
enforce(dateString).isAfter(comparisonDate);
```

### Usage Example

```javascript
import { enforce } from 'vest';
import 'vest/enforce/date';

const dateString = '2002-07-15';
const comparisonDate = '2002-07-14';

// Basic usage
enforce(dateString).isAfter(comparisonDate);
```

## isBefore Rule

The `isBefore` rule checks if a given date string is before a specified date. It accepts an optional `comparisonDate` parameter to compare against.

```javascript
enforce(dateString).isBefore(comparisonDate);
```

### Usage Example

```javascript
import { enforce } from 'vest';
import 'vest/enforce/date';

const dateString = '2002-07-15';
const comparisonDate = '2002-07-16';

// Basic usage
enforce(dateString).isBefore(comparisonDate);
```

## isISO8601 Rule

The `isISO8601` rule checks if a given string is a valid ISO 8601 date. It supports strict mode and strict separator options.

```javascript
enforce(dateString).isISO8601(options);
```

### Options

The `isISO8601` rule accepts an optional `options` object to customize the validation behavior. The available options are as follows:

| Option            | Default Value | Description                                                                                                                                      |
| ----------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `strict`          | `false`       | A boolean value indicating whether strict mode should be enabled. In strict mode, only valid ISO 8601 date strings are considered.               |
| `strictSeparator` | `false`       | A boolean value indicating whether strict separator mode should be enabled. In strict separator mode, the date and time separator must be a 'T'. |

### Usage Example

```javascript
import { enforce } from 'vest';
import 'vest/enforce/date';

const dateString = '2020-07-10T15:00:00.000';

// Basic usage
enforce(dateString).isISO8601();

// Usage with options
enforce(dateString).isISO8601({
  strict: true,
  strictSeparator: true,
});
```
