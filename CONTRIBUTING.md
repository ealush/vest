# Contributing guide to Vest.

## Working on a feature or a bug fix.

Before working on a big change on Vest’s codebase, it is a good idea to first discuss the change in an issue to make sure it fits the project’s goals and future plans.

This project uses `yarn`. When working on this project you should first clone it locally, install its dependencies and run the tests (`yarn test`) to make sure everything works. You should regularly run the tests during development to make sure they still pass and no functionality has been affected by your changes.

Vest’s functionality is fully documented and fully tested. Please make sure to update the documentation and tests when making a functional change.

## Versioning strategy

When making a change you should never manually update Vest’s version in its `package.json` file. Instead, you should prefix your commits with the change level, for example: `major:` (or `breaking:`) for breaking changes, `minor:` (or `feat:`) for new features, and `patch:` (or `fix:`) for fixes within the code. If your changes are not in the code itself (documentation, for example), you should prefix your commits with `conf:` or `docs:`. The next version number will be calculated from the sum of all commits in a release.

A good commit message could look like this:
`breaking: Removed legacy interface.`

When making changes to packages other than vest, you should also add the name of the package in your commit message for changelog generation. A good commit message could look like this:

`fix: [eslint-plugin-vest] fix edge case bug.`

## Repository structure

Vest’s structure is fairly simple. To help you familiarize with the project, see this mapping:

```sh
config/ # Contains build and test configurations.
docs/   # Vest's documentation.
packages/
├── vest/   # Main Vest package.
│   ├── src/    # Vest's prebuilt source code.
│   │   └── core/  # Modules required for vest's functionality.
│   │   │   └── Context/     # Vest's shared runtime. Used across the whole library.
│   │   │   └── createSuite/ # Initializes the suite and creates a context and state.
│   │   │   └── produce/     # Generates the out put object and callbaks.
│   │   │   └── state/       # Vest's persistent state. Used across the whole library.
│   │   │   └── suiteResult/ # The output object is generated here.
│   │   │   └── test/        # Contains the test function and its lifecycle.
│   │   │   └── validate/    # Creates and runs a stateless suite.
│   │   └── hooks/ # Functions that extend vest's functionality. They all use Context.
│   │   │   └── draft/       # Allows access to the intermediate test result.
│   │   │   └── exclusive/   # Allows including or excluding fields in runtime.
│   │   │   └── warn/        # Allows setting warn-only fields.
│   │   │   └── get/         # Enables out-of-context access to validation results.
│   │   │   └── group/       # Adds another nesting level within suites.
│   │   └── lib/  # Shared helper functions.
│   │   └── testUtils/    # Test helper functions.
├── eslint-plugin-vest/   # Eslint plugin with vest specific rules
│   ├── lib/    # Contains all rules
├── n4s/   # Assertion library used by vest
```

## Branching strategy

| Branch Name | Role           | Description                                         |
| ----------- | -------------- | --------------------------------------------------- |
| `master`    | Latest         | Contains latest unreleased changes                  |
| `stable`    | Current/stable | Current version installable by `npm i vest`         |
| `release`   | CI             | Triggers ci build that merges from master to stable |
