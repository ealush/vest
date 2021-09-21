# Contributing to the project

This repository is the home of multiple packages, all are either used by Vest or can be used with Vest. They are grouped in this repo to allow simpler configurations.

The repo uses yarn, make sure you have yarn installed when you contribute to the repo.

## Repo structure

The structure of the repo is as follows

```
├── packages
│   ├── */                      # Source code of the packages
│   │   ├── src
│   │   │   ├── **/__tests__    # Tests are being looked for in this directory
│   │   │   ├── exports         # Secondary entries for the package
│   │   └── types               # Generated declarations files
│   ├── shared/                 # Shared code between packages
├── vx                          # Repo setup and CI config
│   ├── commands                # All the supported cli commands
│   ├── config
│   │   ├── jest
│   │   └── rollup
│   │       ├── plugins
│   ├── scripts                 # All the scripts used to build and release the packages
```

## Working on a feature or a bug fix.

Before working on a big change on Vest’s codebase, it is a good idea to first discuss the change in an issue to make sure it fits the project’s goals and future plans.

This project uses `yarn`. When working on this project you should first clone it locally, install its dependencies and run the tests (`yarn test`) to make sure everything works. You should regularly run the tests during development to make sure they still pass and no functionality has been affected by your changes.

Vest’s functionality is fully documented and fully tested. Please make sure to update the documentation and tests when making a functional change.

The code in this repo is written with typescript and complied to javascript on build.

### File import conventions

Source files are globally and uniquely named in the repo, meaning that there cannot be two files with the same name in the repo. Files are imported using their unique name and that's it. no need for relative path.

`import name from 'fileName'`

### Adding new files

When you add new files, they need to be added to the list of files so the aliasing works. You can run `yarn dev` while developing to continuously update the list of files upon change.

### Testing your changes

#### Test directory

To test your changes, you need to create a test file inside a `__tests__` directory. Tests files are only looked for there.

#### Test filename

The naming convention for a test file is `moduleName.test.ts`.

#### Running tests

To run tests, you need to run `yarn test`. This will run all tests in all packages. The tests are being run by jest.

You can narrow it down by specifying the package name:

`yarn test -p vest`

Normal jest options can be passed to the test command.

`yarn test -p vest --watch someFileName`

### Building your changes

To build your changes, you need to run `yarn build`. This will build all packages.
You can also run `yarn build -p packageName` to build only one package.

This will generate all distribution files and type declarations.

## Branching strategy

The repo's main branch is `latest`. It contains the latest unreleased changes. PRs are merged into this branch.

| Branch Name | Role           | Description                                         |
| ----------- | -------------- | --------------------------------------------------- |
| `latest`    | Main (master)  | Contains latest unreleased changes                  |
| `stable`    | Current/stable | Current version released version to npm             |
| `release`   | CI             | Triggers ci build that merges from latest to stable |
