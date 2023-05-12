---
title: Vest@5 is ready for testing
description: Excited to announce that Vest@5 is now available for testing!
keywords: [Recipe, any, test, at least, one, must, pass]
---

#### tl;dr

Vest 5 is ready to be used and tested. You can find the upgrade guide [here](/docs/next/upgrade_guide).

# Vest@5 is ready for testing! 🎉

I am excited to announce that Vest@5 is now available for testing! With many months of development, this new version is a game-changer in the world of validation libraries. Vest@5 retains all the existing capabilities of its predecessor, Vest@4, while adding a host of new default settings and usability features that make it more user-friendly than ever before.

## What's New in Vest@5?

Here are just a few of the exciting improvements you can expect in Vest@5:

- **Faster Performance:** By default, Vest@5 now stops after the first failure of each field, reducing overhead and improving performance.
- **Improved Usability:** All suite methods are now directly on the suite object, which means there's almost no need to call `suite.get()`.
- **Better Error Handling:** The suite result now has an ordered list of all failures, making it easier to identify the first error in the suite.
- **Singular `getError` and `getWarning` Methods:** These new methods eliminate the need to get the value from an array.
- **Enhanced TypeScript Support:** Added strict types for field names across the suite, making it easier for developers to write clean and reliable code.

These are just a few of the improvements made to Vest@5. I am excited to hear your feedback on these changes and any other thoughts you may have.

## How You Can Help

As developers, your feedback is crucial to helping us improve Vest@5 and make it the best validation library out there. Here are a few ways you can help:

- **Try it out:** Install Vest@5 using the `next` tag and try it out for yourself. You can find installation instructions on the [GitHub page](https://github.com/ealush/vest).
- **Report Bugs and Issues:** If you encounter any bugs or issues while using Vest@5, please let us know! You can report issues on the [dedicated issue](https://github.com/ealush/vest/issues/1018).
- **Review the Documentation:** The documentation was updated to include both the version 4 and version 5 docs. Please review the documentation and reach out if anything is unclear or needs improvement.
- **Share Your Thoughts:** Whether you have suggestions for new features or behaviors, or simply want to share your overall experience with the API, I want to hear from you! You can provide feedback by writing on the [dedicated issue](https://github.com/ealush/vest/issues/1018), sending a message on the [Vest Discord server](https://discord.com/invite/WmADZpJnSe) or reaching out to us on [Twitter](https://twitter.com/vestjs).

## Getting Started

To get started with Vest@5, simply install it using the `next` tag:

```
npm install vest@next
```

For those who are currently using version 4, migration docs are available to make the transition as smooth as possible. You can find these docs on the [documentation website](/docs/next/upgrade_guide).

Happy Vesting! 🚀
