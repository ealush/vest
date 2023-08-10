---
sidebar_position: 4
title: isURL enforce Rule
description: isURL enforce rule for validating url addresses.
keywords: [Vest, enforce, plugin, isURL, n4s, url]
---

# isURL Enforce Rule

## Description

The isURL enforce rule provides functionality to validate URL values. This documentation covers the `isUrl` rule, along with its options and configurations.

These rule exposes the [`validator.js`](https://www.npmjs.com/package/validator) isURL rule, and accepts the same options.

## isURL Rule

The `isURL` rule checks whether a given value is a valid URL. It accepts various options to customize the validation behavior.

To be used, the rule first needs to be imported:

```javascript
import 'vest/enforce/isURL';

enforce(value).isURL(options);
```

### Options

The isURL rule accepts an optional options object to customize the validation behavior. The available options are as follows:

The `isUrl` rule accepts an optional `options` object to customize the validation behavior. The available options are as follows:

| Option                         | Default Value | Description                                                                                 |
| ------------------------------ | ------------- | ------------------------------------------------------------------------------------------- |
| `require_protocol`             | `false`       | Requires the URL to include a protocol (e.g., `http://` or `https://`).                     |
| `require_host`                 | `true`        | Requires the URL to include a host (e.g., `www.example.com`).                               |
| `require_valid_protocol`       | `true`        | Requires the URL's protocol to be in the list of valid protocols (`http`, `https`, `ftp`).  |
| `allow_underscores`            | `false`       | Allows underscores in the host name.                                                        |
| `allow_trailing_dot`           | `false`       | Allows a trailing dot in the host name.                                                     |
| `allow_protocol_relative_urls` | `false`       | Allows protocol-relative URLs (e.g., `//www.example.com`).                                  |
| `allow_fragments`              | `true`        | Allows URL fragments (e.g., `#section`).                                                    |
| `allow_query_components`       | `true`        | Allows query components in the URL (e.g., `?query=value`).                                  |
| `validate_length`              | `true`        | Validates that the URL length does not exceed the maximum allowed length (2083 characters). |

### Usage Example

```javascript
// Usage with options
enforce(url).isURL({
  protocols: ['http', 'https', 'ftp'],
  require_tld: true,
  require_protocol: false,
  require_host: true,
  require_port: false,
  require_valid_protocol: true,
  allow_underscores: false,
  allow_trailing_dot: false,
  allow_protocol_relative_urls: false,
  allow_fragments: true,
  allow_query_components: true,
  validate_length: true,
});
```
