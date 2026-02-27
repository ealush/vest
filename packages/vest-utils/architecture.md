# vest-utils architecture

## Package identity
- **Name:** `vest-utils`
- **Description:** No package description is declared in package.json.
- **Private:** `False`

## Entrypoints and exports
- `./exports/minifyObject` -> `{'types': './types/exports/minifyObject.d.cts', 'require': './dist/exports/minifyObject.cjs', 'import': './dist/exports/minifyObject.mjs'}`
- `./exports/standardSchemaSpec` -> `{'types': './types/exports/standardSchemaSpec.d.cts', 'require': './dist/exports/standardSchemaSpec.cjs', 'import': './dist/exports/standardSchemaSpec.mjs'}`
- `./vest-utils` -> `{'types': './types/vest-utils.d.cts', 'require': './dist/vest-utils.cjs', 'import': './dist/vest-utils.mjs'}`
- `./*` -> `{'types': './types/vest-utils.d.cts', 'default': './*'}`
- `.` -> `{'types': './types/vest-utils.d.cts', 'require': './dist/vest-utils.cjs', 'import': './dist/vest-utils.mjs'}`
- `./package.json` -> `./package.json`
- `./minifyObject` -> `{'types': './types/exports/minifyObject.d.cts', 'require': './dist/exports/minifyObject.cjs', 'import': './dist/exports/minifyObject.mjs'}`
- `./standardSchemaSpec` -> `{'types': './types/exports/standardSchemaSpec.d.cts', 'require': './dist/exports/standardSchemaSpec.cjs', 'import': './dist/exports/standardSchemaSpec.mjs'}`
- `./vest-utils.d.ts` -> `./types/vest-utils.d.ts`
- `./types/*` -> `./types/*`
- `./dist/*` -> `./dist/*`
- `main`: `./dist/vest-utils.cjs`
- `module`: `./dist/vest-utils.mjs`
- `types`: `./types/vest-utils.d.cts`

## Source architecture snapshot
- Production source files (`src/**/*.ts`, excluding tests): **51**
- Test files under `src/`: **43**
- Top-level source distribution:
  - `(root)`: 49 files
  - `exports`: 2 files

## Key files for maintainers
- `src/vest-utils.ts`
- `src/vest-utils.ts`
- `README.md`
- `package.json`
- `tsconfig.json`
- `vitest.config.ts`

## Test architecture
- Vitest is the package-local test runner (`vitest.config.ts` where present).
- Tests are primarily colocated under `src/**/__tests__` and validate runtime behavior and exported API contracts.
- Representative test files:
  - `src/__tests__/Architecture.test.ts`
  - `src/__tests__/Predicates.test.ts`
  - `src/__tests__/Result.test.ts`
  - `src/__tests__/SimpleStateMachine.test.ts`
  - `src/__tests__/StringObject.test.ts`
  - `src/__tests__/asArray.test.ts`
  - `src/__tests__/bindNot.test.ts`
  - `src/__tests__/bus.test.ts`
  - `src/__tests__/cache.test.ts`
  - `src/__tests__/callEach.test.ts`

## Folder structure (top-level)
- `minifyObject/`
- `src/`
- `standardSchemaSpec/`
- `types/`

## Maintenance notes
- Update this document when adding new architectural subsystems or moving primary entrypoints.
- Keep key-file pointers synchronized with public API changes and test location changes.
