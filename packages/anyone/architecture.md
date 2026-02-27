# anyone architecture

## Package identity
- **Name:** `anyone`
- **Description:** No package description is declared in package.json.
- **Private:** `False`

## Entrypoints and exports
- `./anyone` -> `{'types': './types/anyone.d.cts', 'require': './dist/anyone.cjs', 'import': './dist/anyone.mjs'}`
- `./exports/all` -> `{'types': './types/exports/all.d.cts', 'require': './dist/exports/all.cjs', 'import': './dist/exports/all.mjs'}`
- `./exports/any` -> `{'types': './types/exports/any.d.cts', 'require': './dist/exports/any.cjs', 'import': './dist/exports/any.mjs'}`
- `./exports/none` -> `{'types': './types/exports/none.d.cts', 'require': './dist/exports/none.cjs', 'import': './dist/exports/none.mjs'}`
- `./exports/one` -> `{'types': './types/exports/one.d.cts', 'require': './dist/exports/one.cjs', 'import': './dist/exports/one.mjs'}`
- `./*` -> `{'types': './types/anyone.d.cts', 'default': './*'}`
- `.` -> `{'types': './types/anyone.d.cts', 'require': './dist/anyone.cjs', 'import': './dist/anyone.mjs'}`
- `./package.json` -> `./package.json`
- `./all` -> `{'types': './types/exports/all.d.cts', 'require': './dist/exports/all.cjs', 'import': './dist/exports/all.mjs'}`
- `./any` -> `{'types': './types/exports/any.d.cts', 'require': './dist/exports/any.cjs', 'import': './dist/exports/any.mjs'}`
- `./none` -> `{'types': './types/exports/none.d.cts', 'require': './dist/exports/none.cjs', 'import': './dist/exports/none.mjs'}`
- `./one` -> `{'types': './types/exports/one.d.cts', 'require': './dist/exports/one.cjs', 'import': './dist/exports/one.mjs'}`
- `main`: `./dist/anyone.cjs`
- `module`: `./dist/anyone.mjs`
- `types`: `./types/anyone.d.cts`

## Source architecture snapshot
- Production source files (`src/**/*.ts`, excluding tests): **6**
- Test files under `src/`: **6**
- Top-level source distribution:
  - `(root)`: 1 files
  - `exports`: 4 files
  - `runner`: 1 files

## Key files for maintainers
- `src/anyone.ts`
- `src/anyone.ts`
- `README.md`
- `package.json`
- `tsconfig.json`
- `vitest.config.ts`

## Test architecture
- Vitest is the package-local test runner (`vitest.config.ts` where present).
- Tests are primarily colocated under `src/**/__tests__` and validate runtime behavior and exported API contracts.
- Representative test files:
  - `src/__tests__/all.test.ts`
  - `src/__tests__/any.test.ts`
  - `src/__tests__/anyoneTestValues.ts`
  - `src/__tests__/none.test.ts`
  - `src/__tests__/one.test.ts`
  - `src/__tests__/runAnyoneMethods.test.ts`

## Folder structure (top-level)
- `all/`
- `any/`
- `none/`
- `one/`
- `src/`
- `types/`

## Maintenance notes
- Update this document when adding new architectural subsystems or moving primary entrypoints.
- Keep key-file pointers synchronized with public API changes and test location changes.
