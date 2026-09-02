# Benchmark Design — Schema Relationships (`dependsOn` / `revalidates` + `suite.changed()`)

> **Status:** Design only. No `.bench.ts` files written yet.
> **Author:** Benchmark Designer (workflow child parallel-4)
> **Date:** 2026-09-02
> **Scope:** Proposal for `packages/vest/bench/` (primary) + optional `packages/n4s/bench/` leaf

---

## 1 — Discovery — What Exists Today

### 1.1 No top-level `benchmarks/` folder

```
ls /Users/ealush/Code/vest/benchmarks  →  No such file or directory
ls /Users/ealush/Code/vest/packages/*/benchmark*  →  only packages/vest/bench
```

All benchmarks live in **`packages/vest/bench/`** (17 files + `granular/` subfolder with 7 more). `packages/n4s` has no bench folder at all.

### 1.2 Runner = `vitest bench` (tinybench under the hood)

| Layer | Detail |
|---|---|
| Engine | `vitest@4.0.18` `bench()` / `describe()` — wraps `tinybench@2.9.0` (found in `node_modules/tinybench` + `.yarn/cache/tinybench-…zip`) |
| Config | Root `vitest.config.ts` + per-package `packages/vest/vitest.config.ts` (`include: packages/**/__tests__/*.test.ts`) — bench discovery is via CLI flag, not include glob |
| CLI | `yarn vitest bench --run --config packages/vest/vitest.config.ts --passWithNoTests --no-color "<file>"` (see `vx/scripts/benchmark-reporter.ts:runBenchmarkFile`) |
| npm script | `packages/vest/package.json → "bench": "vitest bench --run --config ./vitest.config.ts"` and root `package.json → "bench": "npx tsx vx/scripts/benchmark-reporter.ts --update"` |
| CI | `.github/workflows/benchmark.yml` — PR-triggered interlaced run: builds `latest` baseline vs PR, runs `npx tsx vx/scripts/benchmark-reporter.ts --interlace .benchmark-baseline`, posts diff table to `benchmark-results.md` (current file: 74 lines, 60+ rows) |
| Parser | `benchmark-reporter.ts:parseOutput` regex `· <name> <hz> … <p99> ±<rme>% <samples>` — extracts `hz` (ops/sec), `p99` (ms), `rme` (margin of error) |
| Diff logic | `calculateDiffs` — suppresses diff if `|Δ%| < max(5, rme%)` |

No `benchmark.js`, no `vitest bench --reporter=json` customisation, no separate `bench.config.ts`. Adding one is out of scope — reuse existing harness.

### 1.3 Existing bench pattern (what to copy)

```ts
// packages/vest/bench/suite-focus.bench.ts — canonical shape
import { bench, describe } from 'vitest';
import { create, enforce, group, test } from '../src/vest';

// Suite created ONCE at module scope, pre-warmed with .run() if stateful
const focusSuite = create(() => { group('g', () => { test('f', () => enforce(1).equals(1)); }); });

describe('suite.focus modifiers', () => {
  bench('no focus modifiers', () => { focusSuite.run(); }, { time: 150, iterations: 15 });
  bench('onlyGroup: limit to one group', () => { focusSuite.focus({ onlyGroup: 'g' }).run(); }, { time: 150, iterations: 15 });
});
```

Granular benches live in `bench/granular/*.bench.ts` and import from `../../src/vest` with same API.

Common timing knobs observed:

| Knob | Typical value | When used |
|---|---|---|
| `time` | `150` (fast focus), `250` (matrix), `1000` (field-volume stress) | total bench budget ms |
| `iterations` | `15` (focus), `5`/`3`/`2` (heavy nesting) | samples |
| `warmupTime` / `warmupIterations` | `50` / `1` | only for very heavy nesting (`nesting-fields-hooks.bench.ts`) |
| `runSuiteTimes(suite, N)` helper | loop `N` runs per `bench()` iteration | amortise tiny suites |

Suites pre-populate state outside `bench()` (e.g. `suite.run(list100)` before describe) so reordering/retain/error-survival semantics are realistic.

### 1.4 Domain to benchmark — where it came from

The new functionality spans two packages:

- **n4s** — `enforce.shape({ field: enforce.isString().dependsOn($ => $.other) })` + `revalidates` alias + `describe()` metadata + rebasing (nested reuse, `isArrayOf($item)`, `$.root`, 3-level nesting, cyclic, bracket keys, `loose`/`partial` notes). Evidence: `packages/n4s/src/__tests__/schemaRelationships*.test.ts` (4 files, ~218 + composition + interaction + acceptance-10), `packages/n4s/src/schema/{SchemaRelationship,SchemaPath,dependencyResolver,rebase,scopeProxy}.ts`.
- **vest** — `suite.changed('field')` incremental re-run (merge gate, deduped affected set = changed + direct dependents, non-transitive, same-item array scoping, reusable-nested isolation, async, `skipWhen`/`only` authority). Evidence: `packages/vest/src/suite/changed.ts`, `packages/vest/src/suite/__tests__/changed.integration.test.ts` (13 cases), `schemaRelationships.suite.test.ts` (V1 `only()` does NOT auto-expand).

The prompt's "23-list" has no single canonical file; it is the union of: 10 acceptance cases (RFC rev2) + 13 changed-integration cases = 23. Composition/interaction files add variants but collapse to the same 23. This design maps every bench row back to that 23.

---

## 2 — Goals & Non-Goals

**Prove (must):**

1. `changed('field')` is **minimal** — runs only changed + direct dependents, not the whole suite. Not a rebrand of `run()`. Needs side-by-side rate comparison vs `run()` and `only()`.
2. **No regression** — `describe()` and schema creation with relationships is not materially slower than without them (`describe()` is a cold metadata read, creation is one-time).
3. **Scale** — nested (3-level), reusable (billing+shipping shared schema), array same-item (100 travelers), multi-dependent fan-out, 10→1000-field volume, all stay proportionate.

**Not doing:**

- Correctness assertions inside bench (count of ran fields) beyond a smoke guard — correctness is the test files' job. Bench proves throughput; a tiny `if (log.length !== expected) throw` is okay as a guard but not as the primary check.
- `benchmark.js` / `tinybench` direct import — stay on `vitest bench` so CI parser works unchanged.
- Copying baseline output files by hand — reporter generates `benchmark-results.md`; we just add rows.

---

## 3 — Proposed File Structure

### 3.1 One new top-level bench file + one granular file (preferred)

```
packages/vest/bench/
├── SCHEMA_RELATIONSHIPS_DESIGN.md        ← this file
├── schema-relationships.bench.ts         ← NEW — primary (n4s + suite)
└── granular/
    └── schema-relationships-changed.bench.ts  ← NEW — deep changed() matrix (optional split)
```

Rationale:

- Single top-level file keeps discovery trivial for `benchmark-reporter.ts:getBenchFiles` (recursive readdir of `packages/vest/bench` picks up both). Splitting is for ergonomics if the file exceeds ~500 lines.
- `packages/n4s/bench/` is **not** needed — n4s schema creation is exercised via vest suites (the real cost is in suite integration, not n4s alone). A lone n4s micro-bench (schema creation + `describe()`) lives as the first `describe` in the same file and imports from `n4s` directly, avoiding a second bench harness.
- If n4s later wants standalone bench, add `packages/n4s/bench/schema-relationships.bench.ts` with `vitest --config packages/n4s/vitest.config.ts` — no duplication needed now.

### 3.2 Alternative considered and rejected

| Alternative | Why rejected |
|---|---|
| `benchmarks/` at repo root | Repo convention is package-scoped bench; root would need new vitest workspace entry + reporter patch |
| One bench file per topology (flat.bench.ts, nested.bench.ts, array.bench.ts) | 4 files for 23 cases fragments CI table and duplicates helpers — one file with 4 `describe` groups is clearer |
| Doing it in `feature-matrix.bench.ts` | That file is at capacity (4131 bytes, approve-matrix + flow suites); relationships deserve isolated reporting |

### 3.3 File imports & scope setup

```ts
// packages/vest/bench/schema-relationships.bench.ts
import { bench, describe } from 'vitest';
import { create, test, enforce, group, skipWhen, only, skip } from '../src/vest';
import { enforce as n4sEnforce } from '../../n4s/src/n4s'; // for pure schema-creation benches
import { each } from '../src/isolates/each';
import { TFieldName, TGroupName } from '../src/suiteResult/SuiteResultTypes';
```

Create shared helpers once:

```ts
function makeLog() { const a: string[] = []; return { push(s: string){a.push(s)}, reset(){a.length=0}, snap(){return [...a]} }; }
const travelers = (n: number) => Array.from({ length: n }, (_, i) => ({ country: 'US', passportNumber: `P${i}` }));
```

---

## 4 — Metric Contract — What to Measure and How

### 4.1 Primary metrics (what reporter already captures)

| Metric | Source | Unit | Why |
|---|---|---|---|
| **ops/sec (Hz)** | `tinybench` `hz` — parsed by `resultRegex` group 2 | higher=better | Main comparison vs baseline; PR diff table uses this for `Diff (Abs)` / `Diff (%)` |
| **rme (relative margin of error)** | `±X%` group 4 | lower=better | Gate: if `|Δ%| < max(5, rme)` diff is masked to 0 — so keep `rme` low or accept 5% noise floor |
| **p99 (ms)** | column 3 → `p99` | lower=better | Tail latency; important for 1000-field stress |
| **samples** | trailing number in bench line | — | Diagnostics only; reporter drops it |

We do **not** need to invent throughput-counting; `tinybench` already counts inner `bench()` iterations per `time` budget. Ensure each `bench()` body is non-trivial (≥1 `suite.run()`) so `hz` is meaningful.

### 4.2 vitest bench knobs to use

| Scenario | `time` | `iterations` | `warmup*` | Notes |
|---|---|---|---|---|
| Fast path (flat, nested shallow, describe) | `150` | `15` | default | Matches `suite-focus.bench.ts` / `focus-filters.bench.ts` |
| Medium (reusable 2×, array 10, fan-out) | `250` | `10` | default | Matches `feature-matrix.bench.ts` |
| Heavy (array 100, 3-level nesting, 500–1000 fields, realistic flow) | `1000` | `3` | `warmupTime:50, warmupIterations:1` | Matches `stress-fields.bench.ts` / `nesting-fields-hooks.bench.ts` |
| Micro (schema creation, describe serialisation) | `200` | `20` | default | Creation is cheap — more iterations needed for stable hz |

### 4.3 Assertions inside bench (light)

- A `beforeAll` smoke-run checks `log` length (minimality) once; bench bodies **do not** assert per-iteration (would pollute timing). Example:

```ts
// one-time guard, not inside bench()
{
  const g = makeLog();
  const s = makeSuite(g);
  await s.run(baseData);
  g.reset();
  await s.changed('password').run(nextData);
  if (g.snap().length !== 2) throw new Error('changed() minimality broken — bench would be meaningless');
}
```

---

## 5 — Scenario Matrix — Every Required Bench Row

Rows are ordered to tell a story: (A) schema cost → (B) describe cost → (C) suite run modes comparison → (D) full 23-list integration. Each row maps to its source case.

### 5.1 Group A — Schema creation with relationships (n4s isolated)

`describe 'Schema creation — with vs without relationships'`

| # | Bench name | What it does | Knob | Maps to |
|---|---|---|---|---|
| A1 | `create flat (no rel)` | `enforce.shape({ a: isString(), b: isString() })` | micro | baseline |
| A2 | `create flat with dependsOn` | same + `b: isString().dependsOn($=>$.a)` | micro | acceptance-1, flat-scenarios |
| A3 | `create flat with revalidates (alias)` | `a: isString().revalidates($=>$.b)` vs A2 — should be same hz | micro | acceptance-10, revalidates.test |
| A4 | `create flat with multi-source` | `total: isNumber().dependsOn($=>[%.quantity, %.unitPrice, %.currency])` | micro | dependsOn multi-source test |
| A5 | `create nested (3 levels) with rebase` | `outer{ middle{ inner{ zip dependsOn city }}}` — 3-level rebase cost | micro | composition three-level |
| A6 | `create reusable (shared address ×2)` | `address={country,state dependsOn country}; checkout={billing:address,shipping:address}` — purity check (child not mutated) | micro | composition reusable, acceptance-3 |
| A7 | `create array same-item (one traveler)` | `travelers: isArrayOf(traveler{ passportNumber dependsOn passportCountry })` — single $item binding | micro | composition array item, acceptance-4 |
| A8 | `create $.root escape` | `company.taxId dependsOn [$.country, $.root.accountType]` | micro | composition $.root, acceptance-5/8 |
| A9 | `create nested arrays (orders→items)` | `orders: isArrayOf(order{ items: isArrayOf(item{ discount dependsOn name }) })` — 2× $item bindings | micro | composition nested arrays, acceptance-6 |
| A10 | `create cyclic (2-node)` | `start dependsOn end, end dependsOn start` — legal | micro | acceptance-7 |
| A11 | `create fan-out (1→2)` | `a, b dependsOn a, c dependsOn a` — 1 source, 2 targets | micro | changed-integration-7 dedupe |
| A12 | `create large (100-field chain Pain)` | 100 keys, every 10th with dependsOn predecessor | heavy-micro | stress — ensures creation scales |

Expectation: A2 ≈ A1 within 5% (metadata-only V1). If A2 regresses >10% this is a release-blocker. A5–A9 measure rebase overhead, not validation.

### 5.2 Group B — `describe()` with and without relationships

`describe 'describe() — metadata read'`

| # | Bench name | What it does | Knob | Maps to |
|---|---|---|---|---|
| B1 | `describe flat no rel` | `enforce.shape({a,b}).describe()` baseline | micro | — |
| B2 | `describe flat with one edge` | same as A2 then `.describe()` | micro | schemaRelationships.test flat |
| B3 | `describe nested rebased (2×)` | A6 checkout `.describe()` — expect 2 edges | micro | composition reusable |
| B4 | `describe array same-item` | A7 booking `.describe()` — check binding identity | micro | composition array binding |
| B5 | `describe serialize (JSON round-trip)` | `JSON.parse(JSON.stringify(schema.describe()))` — tests requirement "describe is serializable" | micro | schemaRelationships.test serializable |
| B6 | `describe repeated (cache hit?)` | `describe(); describe(); describe()` ×3 — measures idempotency cost (stable after repeated runs) | micro | vest suite repeated-runs test |

Expectation: `describe()` is cold read; all B rows within same order of magnitude. JSON round-trip (B5) is expected to be ~2× B2 but still microsecond-range.

### 5.3 Group C — `suite.changed()` vs `suite.only()` vs `suite.run()` — Head-to-Head

This is the **core proof** that `changed()` is minimal. Each topology gets a triplet (and where meaningful a `run()`-only traffic).

`describe 'changed() vs only() vs run() — minimality proof'`

| # | Bench name | Body | Knob | Proves |
|---|---|---|---|---|
| C1 | `flat: run() full (3 fields)` | `suite.run(data)` — baseline (runs 3) | fast | denominator |
| C2 | `flat: only(password) — 1 field` | `suite.only('password').run(data)` — 1 field | fast | only is explicit (does NOT expand) |
| C3 | `flat: changed(password) — 2 fields` | `suite.changed('password').run(data)` — 2 fields (password + confirm) | fast | minimal: `C2 < C3 < C1` in *work* but `hz(C3) > hz(C1)` since fewer tests |
| C4 | `flat: changed(confirmPassword) — 1 field` | directionality — should equal C2 in work | fast | integration-2 |
| C5 | `flat: changed(email) — 1 field (retains errors)` | unrelated field; changed must retain prior errors | fast | integration-3 |
| C6 | `nested: run() (profile.country + profile.state + email)` | full run | fast | — |
| C7 | `nested: changed(profile.country) — 2 fields` | `changed('profile.country')` → country+state | fast | integration-4 |
| C8 | `reusable: run() (billing×2 + shipping×2 =4)` | full 4-field run | medium | — |
| C9 | `reusable: changed(billing.country) — 2 fields, isolated` | should NOT touch shipping | medium | integration-5 |
| C10 | `array(3): run() — 6 fields (3×country+passport)` | full array run | medium | — |
| C11 | `array(3): changed(travelers.1.country) — 2 fields same-item` | only index 1 affected | medium | integration-6 |
| C12 | `array(100): run() — 200 fields` | full 100-traveler run | heavy | scale |
| C13 | `array(100): changed(travelers.50.country) — 2 fields` | **key regression gate** — `hz(C13) / hz(C12)` should be >> `10×` (200 vs 2). If ratio < 5×, flags that `changed()` is looping whole array. | heavy | minimality at scale |
| C14 | `fan-out: run() (password + 2 dependents + email =4)` | full | medium | — |
| C15 | `fan-out: changed(password) — 3 fields deduped` | 1→2 fan-out | medium | integration-7 |
| C16 | `chain: changed(a) where a→b→c non-transitive — 2 fields not 3` | ensures no cascade | fast | integration-8 |
| C17 | `skipWhen: changed(country) where country≠US→US flips state visibility` | candidate set vs Vest skip authority | fast | integration-10 |
| C18 | `async: changed(organizationId) — reruns username (pending)` | async dependent | medium | integration-11 |

Interpretation of C3 vs C1: `changed()` must have **higher hz** than full `run()` (less work → more ops/sec). Absolute hz is not the claim — *ratio* is. Report both raw hz and log length in bench name comment (e.g. `changed(password) [2/3 fields]`). The grant of "proving changed() is minimal" is satisfied by the **side-by-side hz ratio**, not by in-bench asserts.

### 5.4 Group D — Integration Matrix (`changed()` under Vest features) & Realistic Flow

`describe 'Integration matrix — changed() meets Vest features'`

| # | Bench name | Scenario (all from changed.integration + acceptance) | Knob | Maps to |
|---|---|---|---|---|
| D1 | `skipWhen: state skipped when country≠US — changed touches but Vest skips` | state `skipWhen(country!=='US')`, changed(country CA→US) | fast | integration-10 variant |
| D2 | `omitWhen: field omitted — changed still candidate but omitted` | — | fast | composition omitWhen |
| D3 | `optional (suite): password optional — changed keeps graph` | `optional('password')` | fast | interaction optional |
| D4 | `optional (n4s): b: optional(isString().dependsOn($.a))` | does not throw, graph intact | micro | interaction n4s optional |
| D5 | `warn: changed triggers warn+optional intersection` | — | fast | interaction warn |
| D6 | `group: changed inside group + each combination` | `group → each → test` mix | medium | advanced control flow |
| D7 | `each + group: 10 items each with group wrapper` | — | medium | expert Each+Group |
| D8 | `mode: ALL vs ONE under changed` | ensure semantics unchanged | fast | feature-matrix flow control |
| D9 | `async waterfall: 2 async tests under changed` | pending semantics | medium | advanced Async & Concurrency |
| D10 | `serialize large after changed — retain + serialize cost` | `suite.changed(...).run(); SuiteSerializer.serialize(res)` | medium | advanced State Management |
| D11 | `realistic registration flow — 6 scenarios in sequence` | email→password→confirm→org→country — single suite, sequential `changed()` steps (mirrors integration-13) | heavy | **acceptance big picture** (the 23rd scenario) |
| D12 | `realistic checkout flow — billing+shipping+travelers interleaved` | checkout(A7) + vest `group/each` — stresses reusable+array together | heavy | cross of acceptance 3+4 |
| D13 | `volatility stress: 100 fields only 1 changed — changed ratio` | 100 flat fields, 1 dependsOn, `changed(source)` → 2 vs `run()` → 100. Ratio gate `hz(changed)/hz(run) > 20×` | heavy | stress-fields 100 + relationships |

D11 is the single most valuable bench for stakeholders — run the full registration sequence (initial submit invalid email → fix email via changed → change password → fix confirmation → CA→US flips state) inside one `bench()` iteration so steady-state throughput is measured, not one-shot latency.

### 5.5 Summary counts

| Group | Count | File |
|---|---|---|
| A creation | 12 | top-level |
| B describe | 6 | top-level |
| C head-to-head | 18 | top-level (split to granular if too long) |
| D integration | 13 | granular (`schema-relationships-changed.bench.ts`) |
| **Total** | **49** | |

49 rows covers all 23 scenarios with multi-angle depth. Reporter currently emits ~60 rows total — so this adds ~80% more rows, doubling CI time. Mitigation: mark heavy rows (`array 100`, `flow`, `volatility`) with `time: 1000` so tinybench converges quickly; fast rows dominate 150 ms each → estimated **extra CI wall-time ~25–35 s** (acceptable).

---

## 6 — File Skeleton (copy-paste ready)

```ts
// packages/vest/bench/schema-relationships.bench.ts
import { bench, describe } from 'vitest';
import { create, test, enforce, group, skipWhen } from '../src/vest';
import { enforce as n4sEnforce } from '../../n4s/src/n4s';
import { each } from '../src/isolates/each';
import { TFieldName, TGroupName } from '../src/suiteResult/SuiteResultTypes';

// ── shared fixtures ──────────────────────────────────────────────
const addressSchema = n4sEnforce.shape({
  country: n4sEnforce.isString(),
  state: n4sEnforce.isString().dependsOn($ => $.country),
});
const travelerSchema = n4sEnforce.shape({
  country: n4sEnforce.isString(),
  passportNumber: n4sEnforce.isString().dependsOn($ => $.country),
});

// Suite helpers (create once, reuse)
function makeFlatSuite(log: string[]) { /* ... */ }
function makeNestedSuite(log: string[]) { /* ... */ }
// ...

// ── smoke guard (outside bench, once) ───────────────────────────
 // void (async () => { /* assert changed() log lengths once */ })();

// ── Group A — schema creation ───────────────────────────────────
describe('Schema creation — with vs without relationships', () => {
  bench('create flat (no rel)',                () => { /* A1 */ }, { time: 200, iterations: 20 });
  bench('create flat with dependsOn',          () => { /* A2 */ }, { time: 200, iterations: 20 });
  // ... A3–A12
});

// ── Group B — describe() ────────────────────────────────────────
describe('describe() — metadata read', () => {
  const flatWith = n4sEnforce.shape({ password: n4sEnforce.isString(), confirmPassword: n4sEnforce.isString().dependsOn($ => $.password) });
  bench('describe flat no rel',                () => { n4sEnforce.shape({ a: n4sEnforce.isString(), b: n4sEnforce.isString() }).describe(); }, { time: 200, iterations: 20 });
  bench('describe flat with one edge',         () => { (flatWith as any).describe(); }, { time: 200, iterations: 20 });
  // ... B3–B6
});

// ── Group C — changed vs only vs run ────────────────────────────
describe('changed() vs only() vs run() — minimality proof', () => {
  // C1–C18, each bench body runs exactly one suite mode on pre-warmed suite
});

// packages/vest/bench/granular/schema-relationships-changed.bench.ts
// ... Group D only — imports from '../../../src/vest' (granular depth)
```

Benchmark creation pattern to keep naming CI-friendly: append field-count hint in bench name, e.g. `'array(100): changed(travelers.50.country) [2/200 fields]'`. Reporter concatenates `suite :: name`, so `describe` + bench name are both visible in `benchmark-results.md`.

---

## 7 — Regression Gates & How to Read Results

### 7.1 Gates that would fail CI (human-checked, not auto-fail)

These are not encoded in reporter yet — they are review-time rules. If violated, the PR should be blocked:

| Gate | Check | Threshold |
|---|---|---|
| **G1 — creation not regressed** | `hz(A2) / hz(A1) > 0.90` | dependsOn creation within 10% of baseline |
| **G2 — describe not regressed** | `hz(B2) / hz(B1) > 0.85` | metadata read within 15% (JSON round-trip excluded) |
| **G3 — changed beats run (flat)** | `hz(C3) / hz(C1) > 1.2` | changed does less work so faster |
| **G4 — changed beats run (array 100)** | `hz(C13) / hz(C12) > 10` | strong minimality signal at scale |
| **G5 — isolation** | `hz(C9)` ≈ `hz(C7)` floor | reusable not slower than flat |
| **G6 — volatility** | `hz(D13 changed) / hz(D13 run) > 20` | 100-field suite, only 2 run |
| **G7 — stability** | `rme` for all C rows < `10%` | else increase `iterations` or `time` |

Gate thresholds use `max(5, rme)` masking in reporter — so a 7% diff tagged `0.00%` is still visible in raw log. Always check CI log raw output, not only masked table.

### 7.2 How to prove "not regressing" historically

Keep rows **additive** — never rename existing bench names. Baseline checkout (`latest` branch) will have no rows for these names; reporter shows them as new (Diff=0). On second run, diffs appear — evolutions are comparable. Pin heavy suites to `time:1000` so tinybench confidence stays high even on noisy CI.

---

## 8 — Risk & Mitigations

| Risk | Mitigation |
|---|---|
| Bench flakiness from `Math.random()` ids (seen in `suiteKeyThrash`) | Use deterministic `travelers(n)` array, not random keys |
| `changed()` body mutates shared suite state across iterations → orders leak | Call `suite.reset()` before suite creation per bench group, or create fresh suite inside bench for heavy cases (cost is negligible vs 200-field run) |
| `only()` vs `changed()` semantics leak across benches in same file | Give each `describe` its own suite instances — don't share `log` array |
| CI duration blow-out (49 benches) | Group D marked `heavy` with few iterations; total extra ≈30 s |
| n4s import path differs (`n4s` vs `../../n4s/src/n4s`) | Use `../../n4s/src/n4s` for consistency with tests; verify with `tsc --noEmit` before merge |

---

## 9 — Next Steps (not executed in this design task)

1. **Author `schema-relationships.bench.ts`** per skeleton §6, Groups A–C.
2. **Author `granular/schema-relationships-changed.bench.ts`** for Group D.
3. Run `yarn vitest bench --run packages/vest/bench/schema-relationships.bench.ts --no-color` locally, sanity-check `rme < 10%`.
4. Run full `npx tsx vx/scripts/benchmark-reporter.ts` and confirm ~49 new rows in local `benchmark-results-local.md`.
5. Open PR — confirm `.github/workflows/benchmark.yml` posts table with `Diff (Abs) | Diff (%)` columns.
6. Optional: add `packages/n4s/bench/` if n4s team wants creation/describe benches isolated from vest suite noise.

---

## 10 — Appendix — Existing Bench Inventory & Conventions

For reference when authoring:

```
packages/vest/bench/
  advanced.bench.ts            — control flow + enforce + serialization + selectors + async + hooks (8 describes)
  complex-flows.bench.ts       — deep nesting with optional/warn/skip
  conditional-isolates.bench.ts— skip/omit even indices
  debounce-coverage.bench.ts   — debounce
  dynamic-each-group.bench.ts  — longer list
  enforce-advanced.bench.ts    — enforce chain
  expert.bench.ts              — mix of everything (largest file)
  feature-matrix.bench.ts      — ALL/EAGER mode matrix
  focus-filters.bench.ts       — only/skip/include
  library.bench.ts             — reordering, reset, message handling
  nesting-fields-hooks.bench.ts— depth 3–5
  optional-warn-mode.bench.ts  — optional/warn
  result-selectors.bench.ts    — hasErrors / getErrors
  stress-fields.bench.ts       — 10/500/1000 fields
  stress-nesting.bench.ts      — depth 10/50/100
  suite-focus.bench.ts         — focus modifiers (skipGroup/onlyGroup)
  granular/
    complex.bench.ts           — async group + skip + deep async
    conditional.bench.ts       — skipWhen/omitWhen/include
    control-flow.bench.ts      — group sync/async, each, only/skip
    core.bench.ts              — sync pass/fail/warn, memo, async, high-volume (1000)
    enforce.bench.ts           — simple/long chain
    optional.bench.ts
    state.bench.ts
```

Naming convention: `describe('<Human Area>', () => { bench('<specific case>', fn, opts) })`. No setup files for bench; uses `vitest bench` globals. Tinybench options per bench: `{ time, iterations, warmupTime, warmupIterations }`.

Reporter output columns (post-run): `| Suite | Benchmark | Ops/sec (Hz) | P99 (ms) | Margin of Error | Diff (Abs) | Diff (%) |`

