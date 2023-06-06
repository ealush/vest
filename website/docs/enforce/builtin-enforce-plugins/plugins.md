---
sidebar_position: 0
title: Builtin enforce plugins
description: Builtin plugins that are included by default
keywords: [Vest, enforce, plugins, n4s]
---

# Builtin enforce plugins

In order to save up on bundle size, enforce ships with a minimal set of rules. These rules are the most common ones, and are used in most projects. Some rules, such as isEmail, or other schema rules may be useful but less common. These are supported as plugins and can be consumed directly from the `vest/enforce` directory.

The following documents in this section describe the builtin plugins that are included by default and are ready to use.

To consume any of these plugins, simply import them in your project:

```js
import 'vest/enforce/isEmail';
```
