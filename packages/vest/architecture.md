# vest architecture

## Package identity
- **Name:** `vest`
- **Description:** Declarative Form Validations Framework
- **Private:** `False`

## Entrypoints and exports
- `./exports/classnames` -> `{'types': './types/exports/classnames.d.cts', 'require': './dist/exports/classnames.cjs', 'import': './dist/exports/classnames.mjs'}`
- `./exports/date` -> `{'types': './types/exports/date.d.cts', 'require': './dist/exports/date.cjs', 'import': './dist/exports/date.mjs'}`
- `./exports/debounce` -> `{'types': './types/exports/debounce.d.cts', 'require': './dist/exports/debounce.cjs', 'import': './dist/exports/debounce.mjs'}`
- `./exports/email` -> `{'types': './types/exports/email.d.cts', 'require': './dist/exports/email.cjs', 'import': './dist/exports/email.mjs'}`
- `./exports/isURL` -> `{'types': './types/exports/isURL.d.cts', 'require': './dist/exports/isURL.cjs', 'import': './dist/exports/isURL.mjs'}`
- `./exports/memo` -> `{'types': './types/exports/memo.d.cts', 'require': './dist/exports/memo.cjs', 'import': './dist/exports/memo.mjs'}`
- `./exports/parser` -> `{'types': './types/exports/parser.d.cts', 'require': './dist/exports/parser.cjs', 'import': './dist/exports/parser.mjs'}`
- `./exports/SuiteSerializer` -> `{'types': './types/exports/SuiteSerializer.d.cts', 'require': './dist/exports/SuiteSerializer.cjs', 'import': './dist/exports/SuiteSerializer.mjs'}`
- `./vest` -> `{'types': './types/vest.d.cts', 'require': './dist/vest.cjs', 'import': './dist/vest.mjs'}`
- `./*` -> `{'types': './types/vest.d.cts', 'default': './*'}`
- `.` -> `{'types': './types/vest.d.cts', 'require': './dist/vest.cjs', 'import': './dist/vest.mjs'}`
- `./package.json` -> `./package.json`
- `main`: `./dist/vest.cjs`
- `module`: `./dist/vest.mjs`
- `types`: `./types/vest.d.cts`

## Source architecture snapshot
- Production source files (`src/**/*.ts`, excluding tests): **78**
- Test files under `src/`: **76**
- Top-level source distribution:
  - `(root)`: 1 files
  - `core`: 27 files
  - `errors`: 1 files
  - `exports`: 8 files
  - `hooks`: 12 files
  - `isolates`: 4 files
  - `suite`: 9 files
  - `suiteResult`: 10 files
  - `testUtils`: 6 files

## Key files for maintainers
- `src/vest.ts`
- `src/vest.ts`
- `README.md`
- `package.json`
- `tsconfig.json`
- `vitest.config.ts`
- `src/core/Runtime.ts`
- `src/core/StateMachines/IsolateTestStateMachine.ts`
- `src/core/VestBus/BusEvents.ts`
- `src/core/VestBus/VestBus.ts`
- `src/core/__tests__/runtime.test.ts`
- `src/core/context/SuiteContext.ts`

## Test architecture
- Vitest is the package-local test runner (`vitest.config.ts` where present).
- Tests are primarily colocated under `src/**/__tests__` and validate runtime behavior and exported API contracts.
- Representative test files:
  - `src/__tests__/NestedTests_fail_fast.test.ts`
  - `src/__tests__/SuiteResult_cache_expiration.test.ts`
  - `src/__tests__/SuiteResult_during_run.test.ts`
  - `src/__tests__/integration.async-tests.test.ts`
  - `src/__tests__/integration.base.test.ts`
  - `src/__tests__/integration.byGroup.test.ts`
  - `src/__tests__/integration.exclusive.test.ts`
  - `src/__tests__/integration.stateful-async.test.ts`
  - `src/__tests__/integration.stateful-tests.test.ts`
  - `src/__tests__/isolate.test.ts`

## Folder structure (top-level)
- `SuiteSerializer/`
- `bench/`
- `classnames/`
- `date/`
- `debounce/`
- `docs/`
- `email/`
- `isURL/`
- `memo/`
- `parser/`
- `src/`
- `types/`

## Maintenance notes
- Update this document when adding new architectural subsystems or moving primary entrypoints.
- Keep key-file pointers synchronized with public API changes and test location changes.
