# Packed-consumer strict typing fixtures (plan AC06/BB11)

Strict consumer TYPE fixtures proving the packed `vest` + `n4s` declarations.
They run against PACKED packages (never workspace source aliases).

## Layout

- `suite-consumer.mts` — full matrix, ESM importer (checked with NodeNext).
- `suite-consumer.cts` — byte-identical twin, CJS importer (checked with
  Node16). The twins are intentionally identical: ESM `import` syntax
  typechecks under both module kinds, so the packed declarations are proven
  under both importer kinds. Keep them in sync when editing.
- `setup-packed-consumer.mjs` — packs `vest`, `n4s` (+ workspace deps
  `context`, `vest-utils`, `vestjs-runtime`) via `yarn pack` and copies the
  output into `./node_modules` (physical copies, no symlinks, no aliases).
  Same pack-then-copy pattern as `scripts/gate-schema-boundaries.js`.
- `tsconfig.esm.json` / `tsconfig.cjs.json` — strict, dependency-free
  (`types: []`, no vitest) consumer configs with no `paths` aliases.

`./node_modules` is generated and gitignored. This directory is outside every
existing tsconfig `include` (root, `tsconfig.typecheck.json`,
`tsconfig.eslint.json` only cover `packages/*`/repo TS), so these fixtures
are NOT part of `yarn vx typecheck-tests` — run the exact commands below.

## TypeScript version

- Minimum supported: **5.4.5** (root devDependencies `typescript: ^5.4.5`).
- Verified with: **5.9.3** (`yarn tsc --version`).
- Fixtures stick to pre-5.4 syntax so they check clean on the minimum.

## Run

From the repo root:

```sh
node type-tests/consumer-typing/setup-packed-consumer.mjs
yarn tsc -p type-tests/consumer-typing/tsconfig.esm.json
yarn tsc -p type-tests/consumer-typing/tsconfig.cjs.json
```

The repository wrappers run the same checks against both the installed
compiler and the minimum supported compiler:

```sh
yarn typecheck:consumer
yarn typecheck:consumer:min
```

Both `tsc` invocations must exit 0. Every `@ts-expect-error` marks DELIBERATE
MISUSE; an unused directive fails the check, so the negatives are
self-policing. Supported examples use no `as any` / `as never`.

## Coverage map (sections in `suite-consumer.*`)

1. Native n4s schema suite (`enforce.shape`, draft callback data, complete
   `run`/`validate`/`runStatic` inputs and full-run result values).
2. Hand-written `StandardSchemaV1<I, O>` schema with distinct input/output;
   canonical-helper inference (`InferInput`/`InferOutput`) asserted EXACT and
   non-any via `IsAny` + local `expectTypeOf`.
3. Sync + async `test()` validators; schema-less typed callback.
4. In-callback hooks: broad strings, `skip(true)`, `only(false)`.
5. Suite-level selectors: broad field strings, strict groups (focus/group/
   result selectors + `include` vocabulary).
6. `readonly string[]` variables into `changed`/`focus`/`only`.
7. Nested dotted selectors (`profile.state`) for remove/reset/focus/result.
8. Root-array suites (`enforce.isArrayOf`).
9. Callbacks with extra args threading through `run()`.
10. `valid`-narrowing: complete `value` after a full run, draft `value` after
    a focused run, and `issues` on invalid.
11. `afterEach`/`afterField` chaining through `changed`/`focus`/`only`/`run`.
12. Clear/empty selectors (`changed(undefined)`, `changed([])`, `focus({})`,
    `skip: true/false`).
13. Invalid builder misuse (`@ts-expect-error`): config-generic + schema combo,
    extra `changed()` options arg, `shape` with a non-map.
14. `create<null>` escape hatch without `as any`.
15. Exported subpaths: `n4s/exports/{date,email,isURL}`, `n4s` root,
    `vest/exports/{parser,SuiteSerializer,memo,classnames,debounce,email,date,isURL}`,
    root `Suite`/`SuiteResult`/`FocusedSuiteResult`/`DeepDraft` types.

## Honest gaps

- Both importer kinds resolve the SAME packed `.d.cts` files (verified with
  `tsc --traceResolution`: the packed manifests point every exports-map
  `types` condition at `.d.cts`). The `.d.mts` files shipped under
  `types/` are referenced by zero exports entries, so no consumer resolution
  path reaches them today — they are unproven by these fixtures. If a future
  manifest splits the `types` condition per importer kind, re-verify with
  `--traceResolution`.
- On the config-generic overload (`create<{ fields; groups }>`), the callback
  type parameter keeps its default, so `run()` still takes a loosely-typed
  (`any`) data argument instead of requiring zero args. Observed on packed
  output, matches the shipped overload text; locked in §5 of the fixtures.
- Unknown dotted paths (e.g. `remove('typo.path')`) typecheck by design:
  suite-level field selectors are deliberately broad-string
  (`FieldSelector`), and result selectors accept `` `${F}.${string}` ``, so a
  typo in the dotted tail reports no errors at runtime instead of failing to
  compile. Documented tradeoff, not a regression.
- `n4s/exports/internal` is published but intentionally NOT imported here:
  boundary DD03 reserves it for non-consumer use (adapters must not depend on
  private planner paths).
- The `.cts` twin mirrors the `.mts` matrix instead of duplicating distinct
  CJS-only idioms (e.g. `require()` calls); the full assertion matrix passes
  under each importer kind.
- Runtime behavior is not executed here (`--noEmit` typecheck only); runtime
  parity is covered by the in-repo vitest suites and
  `gate:schema-boundaries`.
