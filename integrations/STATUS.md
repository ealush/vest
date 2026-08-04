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
- [ ] Merge the infrastructure PR before beginning an upstream contribution.

## Integration inventory

No third-party integration workspace is registered yet. Standard Schema is the first implementation target after this infrastructure slice is reviewed.
