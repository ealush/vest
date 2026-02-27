# vast architecture

## Package identity
- **Name:** `vast`
- **Description:** No package description is declared in package.json.
- **Private:** `False`

## Entrypoints and exports
- `.` -> `{'types': './types/vast.d.cts', 'require': './dist/vast.cjs', 'import': './dist/vast.mjs'}`
- `./*` -> `{'types': './types/vast.d.cts', 'default': './*'}`
- `./package.json` -> `./package.json`
- `./vast` -> `./types/vast.d.cts`
- `./vast.d.ts` -> `./types/vast.d.ts`
- `./types/*` -> `./types/*`
- `./dist/*` -> `./dist/*`
- `main`: `./dist/vast.cjs`
- `module`: `./dist/vast.mjs`
- `types`: `./types/vast.d.cts`

## Source architecture snapshot
- Production source files (`src/**/*.ts`, excluding tests): **1**
- Test files under `src/`: **1**
- Top-level source distribution:
  - `(root)`: 1 files

## Key files for maintainers
- `src/vast.ts`
- `src/vast.ts`
- `README.md`
- `package.json`
- `tsconfig.json`
- `vitest.config.ts`

## Test architecture
- Vitest is the package-local test runner (`vitest.config.ts` where present).
- Tests are primarily colocated under `src/**/__tests__` and validate runtime behavior and exported API contracts.
- Representative test files:
  - `src/__tests__/vast.test.ts`

## Folder structure (top-level)
- `src/`
- `types/`

## Maintenance notes
- Update this document when adding new architectural subsystems or moving primary entrypoints.
- Keep key-file pointers synchronized with public API changes and test location changes.
