# context architecture

## Package identity
- **Name:** `context`
- **Description:** No package description is declared in package.json.
- **Private:** `False`

## Entrypoints and exports
- `.` -> `{'types': './types/context.d.cts', 'require': './dist/context.cjs', 'import': './dist/context.mjs'}`
- `./*` -> `{'types': './types/context.d.cts', 'default': './*'}`
- `./package.json` -> `./package.json`
- `./context` -> `./types/context.d.cts`
- `./context.d.ts` -> `./types/context.d.ts`
- `./types/*` -> `./types/*`
- `./dist/*` -> `./dist/*`
- `main`: `./dist/context.cjs`
- `module`: `./dist/context.mjs`
- `types`: `./types/context.d.cts`

## Source architecture snapshot
- Production source files (`src/**/*.ts`, excluding tests): **1**
- Test files under `src/`: **2**
- Top-level source distribution:
  - `(root)`: 1 files

## Key files for maintainers
- `src/context.ts`
- `src/context.ts`
- `README.md`
- `package.json`
- `tsconfig.json`
- `vitest.config.ts`

## Test architecture
- Vitest is the package-local test runner (`vitest.config.ts` where present).
- Tests are primarily colocated under `src/**/__tests__` and validate runtime behavior and exported API contracts.
- Representative test files:
  - `src/__tests__/cascade.test.ts`
  - `src/__tests__/context.test.ts`

## Folder structure (top-level)
- `src/`
- `types/`

## Maintenance notes
- Update this document when adding new architectural subsystems or moving primary entrypoints.
- Keep key-file pointers synchronized with public API changes and test location changes.
