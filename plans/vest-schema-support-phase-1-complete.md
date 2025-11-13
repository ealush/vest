## Phase 1 Complete: Update n4s types and build

Successfully exported schema types from n4s package to enable cross-package usage in vest.

**Files created/changed:**
- `/Users/ealush/dev/vest/packages/n4s/src/n4s.ts` - Added exports for RuleInstance and schema types
- `/Users/ealush/dev/vest/packages/n4s/src/__tests__/schema-exports.test.ts` - Tests verifying type exports

**Functions created/changed:**
- None (type exports only)

**Tests created/changed:**
- 11 tests in `schema-exports.test.ts` all passing:
  - RuleInstance type accessibility (2 tests)
  - schema.infer type inference (4 tests)
  - schema type exports for cross-package usage (3 tests)
  - practical usage scenarios (2 tests)

**Review Status:** APPROVED

**Git Commit Message:**
```
feat: Export schema types from n4s for cross-package usage

- Export RuleInstance class for type constraints
- Export InferShape, SchemaInfer, and ShapeType for type inference
- Add comprehensive tests for schema type exports
- Rebuild n4s package with new type definitions
```
