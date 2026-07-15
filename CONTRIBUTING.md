# Contributing to Vest

Thank you for your interest in contributing to Vest! Whether you're fixing a bug, improving documentation, or proposing a new feature, your help is appreciated.

Vest is a monorepo managed by `yarn` and a custom tooling package called `vx`.

## Prerequisites

- **Node.js**: Ensure you have a recent version of Node.js installed.
- **Yarn**: This project uses Yarn (v3+) for package management.

## Getting Started

1. **Fork and Clone** the repository.
2. **Install dependencies** by running `yarn` in the root directory.
3. **Build the workspace once** to ensure internal package dependencies are linked correctly.

```bash
git clone [https://github.com/ealush/vest.git](https://github.com/ealush/vest.git)
cd vest
yarn
yarn build
```

> ℹ️ `yarn` installs dependencies, but a first `yarn build` is required before working with packages that depend on built workspace artifacts.

## Repository Structure

Vest is organized as a monorepo. Here is a high-level overview of the structure:

```
├── packages
│   ├── vest/                # Core Vest library
│   ├── n4s/                 # Enforce rules and assertions
│   ├── vest-utils/          # Shared internal utilities
│   ├── vestjs-runtime/      # The runtime engine powering Vest
│   ├── context/             # Context management package
│   └── anyone/              # Test matching utility
├── vx/                      # Internal tooling, scripts, and configuration
│   ├── commands/            # CLI commands (build, test, release)
│   └── config/              # Build tools configuration (Vitest, Rollup, etc.)
└── website/                 # Documentation website (Docusaurus)
```

## Development Workflow

We use the `vx` CLI (located in the `vx/` folder) to manage tasks across the monorepo. Most common tasks are aliased in the root `package.json`.

### Building the Project

To build all packages in the monorepo:

```bash
yarn build
```

To build a specific package (e.g., only `vest`):

```bash
yarn vx build -p vest
```

### Running Tests

We use **Vitest** for testing. You should run tests regularly to ensure your changes don't break existing functionality.

To run all tests:

```bash
yarn test
```

To run tests for a specific package:

```bash
yarn vx test vest
```

To run tests in watch mode:

```bash
yarn test --watch
```

### Type Checking

Vest is written in TypeScript. Ensure your changes pass type checking before submitting a PR.

To typecheck the source code:

```bash
yarn vx typecheck
```

To typecheck the test files:

```bash
yarn vx typecheck-tests
```

### Documentation

The documentation website is built with Docusaurus and located in the `website/` directory.

To start the documentation server locally:

```bash
yarn website:start
```

To build the documentation for deployment:

```bash
yarn website:build
```

_Note: This command also runs `yarn build:llms` to generate the LLM-friendly documentation files._

#### Executable examples

Non-trivial examples must be exercised as the exact code readers see, rather than copied into a separate test fixture.

- Markdown contracts in `packages/vest/src/suite/__tests__/docsExamples.test.ts` read fenced blocks directly from `website/docs`, transpile them, and execute them against the real Vest implementation.
- Playground contracts in `website/src/components/codePlaygrounds.test.js` read the code strings embedded in the Sandpack components and execute those exact strings.
- Interactive components and full applications keep ordinary colocated behavior tests, such as the async race demo and the production registration example.

When adding or substantially changing a non-trivial example, add a behavioral assertion to the appropriate contract. Small fragments that only demonstrate a selector or call site may rely on the canonical suite test they reference.

Run all executable documentation and demo contracts with:

```bash
yarn docs:examples:test
```

CI runs this command independently, so a displayed example and its behavior cannot drift silently.

## Making Changes

1. **Create a Branch**: Create a new branch for your feature or fix.
2. **Make Changes**: Modify the code in the relevant `packages/` directory.
3. **Add Tests**:
   - Tests are located in `__tests__` directories next to the source files.
   - Test files should be named `*.test.ts`.
   - If you are fixing a bug, please add a regression test.
4. **Verify**: Run `yarn test` and `yarn vx typecheck` to ensure everything is green.

## Branching Strategy

We follow a standard flow for releases:

| Branch Name | Role        | Description                                            |
| :---------- | :---------- | :----------------------------------------------------- |
| `latest`    | **Main**    | The active development branch. Submit all PRs here.    |
| `stable`    | **Release** | The current version published to npm.                  |
| `release`   | **CI**      | Used by CI to merge changes from `latest` to `stable`. |
