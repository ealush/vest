# n4s architecture

## Package identity
- **Name:** `n4s`
- **Description:** typed schema validation version of enforce
- **Private:** `False`

## Entrypoints and exports
- `./exports/date` -> `{'types': './types/exports/date.d.cts', 'require': './dist/exports/date.cjs', 'import': './dist/exports/date.mjs'}`
- `./exports/email` -> `{'types': './types/exports/email.d.cts', 'require': './dist/exports/email.cjs', 'import': './dist/exports/email.mjs'}`
- `./exports/isURL` -> `{'types': './types/exports/isURL.d.cts', 'require': './dist/exports/isURL.cjs', 'import': './dist/exports/isURL.mjs'}`
- `./n4s` -> `{'types': './types/n4s.d.cts', 'require': './dist/n4s.cjs', 'import': './dist/n4s.mjs'}`
- `./*` -> `{'types': './types/n4s.d.cts', 'default': './*'}`
- `.` -> `{'types': './types/n4s.d.cts', 'require': './dist/n4s.cjs', 'import': './dist/n4s.mjs'}`
- `./package.json` -> `./package.json`
- `./date` -> `{'types': './types/exports/date.d.cts', 'require': './dist/exports/date.cjs', 'import': './dist/exports/date.mjs'}`
- `./email` -> `{'types': './types/exports/email.d.cts', 'require': './dist/exports/email.cjs', 'import': './dist/exports/email.mjs'}`
- `./isURL` -> `{'types': './types/exports/isURL.d.cts', 'require': './dist/exports/isURL.cjs', 'import': './dist/exports/isURL.mjs'}`
- `./n4s.d.ts` -> `./types/n4s.d.ts`
- `./types/*` -> `./types/*`
- `main`: `./dist/n4s.cjs`
- `module`: `./dist/n4s.mjs`
- `types`: `./types/n4s.d.cts`

## Source architecture snapshot
- Production source files (`src/**/*.ts`, excluding tests): **102**
- Test files under `src/`: **129**
- Top-level source distribution:
  - `(root)`: 8 files
  - `eager`: 5 files
  - `exports`: 3 files
  - `lazy`: 2 files
  - `rules`: 81 files
  - `utils`: 3 files

## Key files for maintainers
- `src/n4s.ts`
- `src/n4s.ts`
- `README.md`
- `package.json`
- `tsconfig.json`
- `vitest.config.ts`
- `src/rules/RuleInstanceBuilder.ts`
- `src/rules/__tests__/booleanRules.test.ts`
- `src/rules/__tests__/compoundAndSchemaRuleTypes.test.ts`
- `src/rules/__tests__/compoundRules.test.ts`
- `src/rules/__tests__/genRuleChain.test.ts`
- `src/rules/__tests__/generalRules.test.ts`

## Test architecture
- Vitest is the package-local test runner (`vitest.config.ts` where present).
- Tests are primarily colocated under `src/**/__tests__` and validate runtime behavior and exported API contracts.
- Representative test files:
  - `src/__tests__/compose.test.ts`
  - `src/__tests__/context.test.ts`
  - `src/__tests__/documentation-examples.test.ts`
  - `src/__tests__/extend.test.ts`
  - `src/__tests__/extend.types.test.ts`
  - `src/__tests__/integration.eager.test.ts`
  - `src/__tests__/integration.lazy.test.ts`
  - `src/__tests__/message.test.ts`
  - `src/__tests__/parse.test.ts`
  - `src/__tests__/ruleResult.test.ts`

## Folder structure (top-level)
- `date/`
- `docs/`
- `email/`
- `isURL/`
- `src/`
- `types/`

## Maintenance notes
- Update this document when adding new architectural subsystems or moving primary entrypoints.
- Keep key-file pointers synchronized with public API changes and test location changes.
