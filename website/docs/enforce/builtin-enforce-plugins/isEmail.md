---
sidebar_position: 2
title: isEmail enforce Rule
description: isEmail enforce rule for validating email addresses.
keywords: [Vest, enforce, plugin, isEmail, n4s]
---

# isEmail Enforce Rule

## Description

The `isEmail` enforce rule is used to validate whether a given value is a valid email address. It leverages the `isEmail` library to perform the email validation.

The rule exposes the [`validator.js`](https://www.npmjs.com/package/validator) isEmail rule, and accepts the same options.

## Usage Example

```javascript
import { enforce } from 'vest';
import 'vest/enforce/isEmail';

const email = 'user@example.com';

// Basic usage
enforce(email).isEmail();
```

## Options

The `isEmail` enforce rule accepts an optional `options` object to customize the validation behavior. The available options are as follows:

| Option                       | Default Value | Description                                                                                                                                                     |
| ---------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allow_display_name`         | `false`       | If set to `true`, the validator will also match the format `Display Name <email-address>`.                                                                      |
| `require_display_name`       | `false`       | If set to `true`, the validator will reject strings without the format `Display Name <email-address>`.                                                          |
| `allow_utf8_local_part`      | `true`        | If set to `false`, the validator will not allow any non-English UTF8 character in the email address's local part.                                               |
| `require_tld`                | `true`        | If set to `false`, email addresses without a top-level domain (TLD) in their domain will also be matched.                                                       |
| `ignore_max_length`          | `false`       | If set to `true`, the validator will not check for the standard maximum length of an email.                                                                     |
| `allow_ip_domain`            | `false`       | If set to `true`, the validator will allow IP addresses in the host part of the email address.                                                                  |
| `domain_specific_validation` | `false`       | If set to `true`, additional validation will be enabled, disallowing certain syntactically valid email addresses that are rejected by Gmail and other services. |
| `blacklisted_chars`          | `''`          | If a string is provided, the validator will reject emails that include any of the characters in the string in the name part.                                    |
| `host_blacklist`             | `[]`          | If set to an array of strings, and the part of the email after the `@` symbol matches one of the strings defined in the array, the validation fails.            |
| `host_whitelist`             | `[]`          | If set to an array of strings, and the part of the email after the `@` symbol matches none of the strings defined in the array, the validation fails.           |

```js
// Usage with options
enforce(email).isEmail({
  allow_display_name: true,
  require_display_name: true,
  allow_utf8_local_part: false,
  require_tld: false,
  ignore_max_length: true,
  allow_ip_domain: true,
  domain_specific_validation: true,
  blacklisted_chars: '!"#$%&\'()*+,/:;<=>?@[\\]^`{|}~',
  host_blacklist: ['example.com', 'example.org'],
  host_whitelist: ['gmail.com', 'yahoo.com'],
});
```
