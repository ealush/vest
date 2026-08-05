# Ecosystem integration program status

Last baseline verification: 2026-08-04

Branch: `latest`

Vest package version: `6.3.2`

## Phase 0 baseline

- [x] Read `LLM_INSTRUCTIONS.md`, `CONTRIBUTING.md`, root `package.json`, and `.github/workflows/integration.yml`.
- [x] Inspected the canonical production registration source, tests, Vite build, and Docusaurus embedding.
- [x] `yarn install --immutable` passes (existing peer-dependency warnings only).
- [x] `yarn build` passes.
- [x] `yarn test` passes: 292 files, 2,693 tests, and no type errors.
- [x] `yarn docs:examples:test` passes: 12 Vest documentation tests and 19 website tests.
- [x] Production registration tests, typecheck, and Vite build pass.
- [x] `yarn website:build` passes (existing stale browser-data notices only).
- [x] Confirmed `vx` package generation and release discovery are hard-scoped to `packages/*`; private `integrations/*` workspaces are not publish candidates.

## Phase 1 infrastructure

- [x] Add `integrations/*` workspace support.
- [x] Add the private, framework-agnostic `@vest/integration-kit`.
- [x] Add typed registry, fixtures, contracts, and assertions.
- [x] Add registry-driven test, typecheck, build, docs, verify, and status commands.
- [x] Add deterministic integration index generation and website navigation.
- [x] Add pull-request and scheduled CI coverage.
- [x] Open the first upstream registry contribution after the local proof passed: [standard-schema/standard-schema#177](https://github.com/standard-schema/standard-schema/pull/177).

## Integration inventory

- [x] Standard Schema: local runtime, types, browser demo, and generated website page.
- [x] React Hook Form: local Vest 6 resolver candidate, runtime and type contracts, browser demo, and generated website page. Status downgraded to `local-green` pending resolution of submit-detection heuristic, split-brain state, lifecycle coupling, and Vest core async settlement issues.
- [x] TanStack Form: local runtime, types, React demo, and generated website page.
- [x] Hono: local request tests, types, browser request demo, and generated website page.
- [x] tRPC: local procedure tests, inferred types, browser caller demo, and generated website page.
- [x] T3 Env: local configuration tests, inferred transforms, browser parsing demo, and generated website page.
- [x] TanStack Router: local route tests, inferred search types, browser route demo, and generated website page.
- [ ] Additional Standard Schema consumer libraries that work without upstream package changes.
