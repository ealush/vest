# Contributing guide to Vest.

## Working on a feature or a bug fix.

Before working on a big change on Vest’s codebase, it is a good idea to first discuss the change in an issue to make sure it fits the project’s goals and future plans.

This project uses `yarn`. When working on this project you should first clone it locally, install its dependencies and run the tests (`yarn test`) to make sure everything works. You should regularly run the tests during development to make sure they still pass and no functionality has been affected by your changes.

Vest’s functionality is fully documented and fully tested. Please make sure to update the documentation and tests when making a functional change.


## Versioning strategy
When making a change you should never manually update Vest’s version in its `package.json` file. Instead, you should prefix your commits with the change level, for example: `major:` for breaking changes, `minor:` for new features, and `patch:` for fixes within the code. If your changes are not in the code itself (documentation, for example), you should prefix your commits with `config:` or `docs:`. The next version number will be calculated from the sum of all commits in a release.

## Repository structure 
Vest’s structure is fairly simple. To help you familiarize with the project, see this mapping:
```sh
vest/
├── config/ # Contains build and test configurations.
├── docs/   # Vest's documentation.
├── src/    # Vest's prebuilt source code.
│   └── core/  # Modules required for vest's functionality.
│       └── Context/     # Vest's shared runtime, Used across the whole library.
│       └── suiteResult/ # The output object is generated here.
│       └── test/        # Contains the test function and its lifecycle.
│       └── validate/    # Initializes the suite and creates a context.
│   └── hooks/ # Functions that extend vest's functionality. They all use Context.
│       └── draft/       # Allows access to the intermediate test result.
│       └── exclusive/   # Allows including or excluding fields in runtime.
│       └── warn/        # Allows setting warn-only fields.
│   └── lib/  # Shared helper functions.
```

## Branching strategy
Vest’s default (and latest) branch is master, but our development branch is `next`. We do not release a new version of Vest for every single change, instead, we gather changes in the `next` branch and periodically create a new release.

When working on a feature, you should branch off `next`, and base your pull requests to the `next` branch.
