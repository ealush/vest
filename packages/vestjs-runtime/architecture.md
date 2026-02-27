# vestjs-runtime architecture

## Package identity
- **Name:** `vestjs-runtime`
- **Description:** Internal runtime module used by Vest
- **Private:** `False`

## Entrypoints and exports
- `./exports/IsolateSerializer` -> `{'types': './types/exports/IsolateSerializer.d.cts', 'require': './dist/exports/IsolateSerializer.cjs', 'import': './dist/exports/IsolateSerializer.mjs'}`
- `./exports/test-utils` -> `{'types': './types/exports/test-utils.d.cts', 'require': './dist/exports/test-utils.cjs', 'import': './dist/exports/test-utils.mjs'}`
- `./vestjs-runtime` -> `{'types': './types/vestjs-runtime.d.cts', 'require': './dist/vestjs-runtime.cjs', 'import': './dist/vestjs-runtime.mjs'}`
- `./*` -> `{'types': './types/vestjs-runtime.d.cts', 'default': './*'}`
- `.` -> `{'types': './types/vestjs-runtime.d.cts', 'require': './dist/vestjs-runtime.cjs', 'import': './dist/vestjs-runtime.mjs'}`
- `./package.json` -> `./package.json`
- `./IsolateSerializer` -> `{'types': './types/exports/IsolateSerializer.d.cts', 'require': './dist/exports/IsolateSerializer.cjs', 'import': './dist/exports/IsolateSerializer.mjs'}`
- `./test-utils` -> `{'types': './types/exports/test-utils.d.cts', 'require': './dist/exports/test-utils.cjs', 'import': './dist/exports/test-utils.mjs'}`
- `./vestjs-runtime.d.ts` -> `./types/vestjs-runtime.d.ts`
- `./types/*` -> `./types/*`
- `./dist/*` -> `./dist/*`
- `main`: `./dist/vestjs-runtime.cjs`
- `module`: `./dist/vestjs-runtime.mjs`
- `types`: `./types/vestjs-runtime.d.cts`

## Source architecture snapshot
- Production source files (`src/**/*.ts`, excluding tests): **23**
- Test files under `src/`: **20**
- Top-level source distribution:
  - `(root)`: 6 files
  - `Isolate`: 13 files
  - `Orchestrator`: 1 files
  - `errors`: 1 files
  - `exports`: 2 files

## Key files for maintainers
- `src/vestjs-runtime.ts`
- `src/vestjs-runtime.ts`
- `README.md`
- `package.json`
- `tsconfig.json`
- `vitest.config.ts`
- `src/Isolate/Isolate.ts`
- `src/Isolate/IsolateFocused.ts`
- `src/Isolate/IsolateIndexer.ts`
- `src/Isolate/IsolateInspector.ts`
- `src/Isolate/IsolateKeys.ts`
- `src/Isolate/IsolateMutator.ts`

## Test architecture
- Vitest is the package-local test runner (`vitest.config.ts` where present).
- Tests are primarily colocated under `src/**/__tests__` and validate runtime behavior and exported API contracts.
- Representative test files:
  - `src/Isolate/__tests__/Isolate.test.ts`
  - `src/Isolate/__tests__/IsolateFocused.test.ts`
  - `src/Isolate/__tests__/IsolateInspector.test.ts`
  - `src/Isolate/__tests__/IsolateMutator.test.ts`
  - `src/Isolate/__tests__/IsolatePropagation.test.ts`
  - `src/Isolate/__tests__/IsolateReorderable.test.ts`
  - `src/Isolate/__tests__/IsolateSelectors.test.ts`
  - `src/Isolate/__tests__/IsolateStatus.test.ts`
  - `src/Isolate/__tests__/IsolateTransient.test.ts`
  - `src/Isolate/__tests__/asyncIsolate.test.ts`

## Folder structure (top-level)
- `IsolateSerializer/`
- `docs/`
- `src/`
- `test-utils/`
- `types/`

## Maintenance notes
- Update this document when adding new architectural subsystems or moving primary entrypoints.
- Keep key-file pointers synchronized with public API changes and test location changes.
