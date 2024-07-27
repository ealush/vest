---
sidebar_position: 6
title: Enforce Rules Composition
description: When you have rules that you often use together or different groups of rules that describe the same behavior, you can compose them into a single rule for easier reuse.
keywords: [Vest, enforce, rules, composition, shape, loose, schema, compose]
---

# Composing enforce rules

When you have rules that you often use together or different groups of rules that describe the same behavior, you can compose them into a single rule for easier reuse.

`compose` allows us to create an "AND" relationship wrapper around multiple rules which acts like the regular enforce function.

A simple use-case example:
Let's say we have multiple entities in our app that share some common characteristics, but some that are unique. We can compose the different validation rules for the common characteristics into a single rule that we can reuse across multiple entities.

Let's assume the following:

- Some of the entities in our app have an `id` property.
- The person entity has a `name` property that includes a first, middle and last name.
- The user entity has both an `id` and a `name` property. It also has a `username` property.
- Users can also have a `friends` property, which is an array of other users.

Expressing this with basic enforce rules is easy, but can be cumbersome, and also not very reusable.

```js
import { enforce } from 'vest';
import 'vest/enforce/schema'; // for the schema rules

enforce(userObj).shape({
  id: enforce.number(),
  name: enforce.shape({
    first: enforce.string(),
    middle: enforce.optional(enforce.string()),
    last: enforce.string(),
  }),
  username: enforce.string(),
  friends: enforce.optional(
    enforce.arrayOf(
      enforce.shape({
        id: enforce.number(),
        username: enforce.string(),
        name: enforce.shape({
          first: enforce.string(),
          middle: enforce.optional(enforce.string()),
          last: enforce.string(),
        }),
      }),
    ),
  ),
});
```

Instead, we can compose these different characteristics into composites that can later on be further reused.

```js
import compose from 'vest/enforce/compose';
import 'vest/enforce/schema'; // for the schema rules

const Entity = compose(
  enforce.loose({
    id: enforce.number(),
  }),
);

const Person = compose(
  enforce.loose({
    name: enforce.shape({
      first: enforce.string(),
      middle: enforce.optional(enforce.string()),
      last: enforce.string(),
    }),
  }),
);

const User = compose(
  Entity,
  Person,
  enforce.loose({
    username: enforce.string(),
    friends: enforce.optional(enforce.arrayOf(User)),
  }),
);
```

This way, each composite can be used individually, but can also be composed together to create a more complex rule that can be easily reused.

Using these composites is as easy as either calling the from within other compound rules, or calling them directly within a Vest test just like the regular enforce function:

```js
User(userObj); // Throws an error when failing
```

## Some notes

When composing rules, be mindful when you are composing rules that have a `shape` rule inside of them. If these shape extend one another, you should probably use [loose](./builtin-enforce-plugins/schema_rules.md#enforceloose---loose-shape-matching) so they allow for extended properties.
