---
sidebar_position: 2
title: Including and Excluding Groups
description: skip.group and only.group allow you to skip and only run groups or tests in a group
keywords: [Vest, Skip, Only, exclude, include, skip.group, only.group, group]
---

# Including and excluding groups

Similar to the way you use `skip` and `only` to include and exclude tests, you can use `skip.group` and `only.group` to exclude and include whole groups.

These two functions are powerful and give you control of whole portions of your suite at once.

```js
import { create, test, group, enforce, skip } from 'vest';

create(data => {
  skip.group(data.userExists ? 'signUp' : 'signIn');

  test('userName', "Can't be empty", () => {
    enforce(data.username).isNotEmpty();
  });
  test('password', "Can't be empty", () => {
    enforce(data.password).isNotEmpty();
  });

  group('signIn', () => {
    test(
      'userName',
      'User not found. Please check if you typed it correctly.',
      findUserName(data.username),
    );
  });

  group('signUp', () => {
    test('email', 'Email already registered', isEmailRegistered(data.email));

    test('age', 'You must be at least 18 years old to join', () => {
      enforce(data.age).largerThanOrEquals(18);
    });
  });
});
```

## Things to note when using these functions

**only.group()**:
When using `only.group`, only tests within the targeted group will be run, all other tests will be skipped - even if they are specifically selected using `only`.

It works like this:
When applied to a suite, `only.group` filters out all possible tests to the tests that are within a certain group. When used in conjunction with `only`, these two filters have and `AND` relationship, meaning that the "onlied" fields will only be selected from within the targeted group.

**skip.group()**

If you combine `skip.group` with `only` your included field declared within the skipped group will be skipped.
