/**
 * gate:schema-performance — paired throughput gate for schema-relationship
 * benchmarks (production acceptance plan: PF01-PF06).
 *
 * Method (see the retired >10x/>20x analysis): Vest's per-run cost is
 * dominated by declaring and reconciling the whole suite, so cross-process
 * throughput comparisons drown in process noise. This gate instead runs
 * packages/vest/perf-gate/perf-pairs.test.ts, which measures
 * full-vs-changed pairs in-process (warmup, then interleaved batches in
 * alternating order) and prints one PERF_PAIR JSON line per workload.
 * It enforces revised floors (C13/D13 changed/full >= 1x target, 0.9x hard
 * floor; G1 related/plain 0.80 floor with 0.90 target, warn-band passing
 * only with the 5us/edge absolute ceiling; A1 creation-vs-base bounded
 * absolutely at 500ms per 20k-shape batch), fails closed on missing rows,
 * thin samples (< 7 batches), mismatched lengths, non-positive samples,
 * NaN samples, and breached floors, and treats excess dispersion (after up
 * to two bounded head+baseline retries) as inconclusive-fail. The relative base
 * budget is exactly 10% latency growth (head <= base * 1.10). With
 * --baseline <dir> (a built checkout, e.g. CI's .benchmark-baseline), the
 * same file is copied there (pre-existing bytes restored afterward) and
 * C12full/D13full regressions beyond the limit fail. A1 needs no baseline
 * and is enforced in head-only mode too. --self-test exercises the pure
 * parse/evaluate logic on synthetic data. Measurement subprocess failures
 * print captured sample stdout before failing. Exit nonzero on any
 * violation.
 */
/* eslint-disable no-console */
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const REPO_ROOT = path.resolve(__dirname, '..');
const VITEST_BIN = path.join(REPO_ROOT, 'node_modules', '.bin', 'vitest');
const PAIRS_FILE = path.join(
  'packages',
  'vest',
  'perf-gate',
  'perf-pairs.test.ts',
);

const STABILITY_MAX_CV = 0.2;
// Relative base comparison is a latency-growth budget: head batch medians
// may grow at most 10% over base (head <= base * 1.10). Named precisely —
// the previous `base / 0.9` formulation permitted 11.11% growth.
const BASE_LATENCY_GROWTH_LIMIT = 1.1;
// Documented minimum interleaved batches per pair workload. Fewer samples
// fail closed instead of passing on thin evidence.
const MIN_PAIR_BATCHES = 7;

const PAIRS = [
  { floor: 0.9, id: 'G4', label: 'C13', target: 1.0 },
  { floor: 0.9, id: 'G6', label: 'D13', target: 1.0 },
  { floor: 0.8, id: 'G1', label: 'G1', target: 0.9 },
];

// Absolute per-edge creation overhead ceiling (microseconds, median of
// batch deltas). The G1 ratio floor above guards relative regressions;
// this guards pathological absolute blowups on any machine. Calibrated
// with wide headroom over the observed ~1-2us/edge range so ordinary
// machine variance cannot trip it. See the G1 evidence note in
// SCHEMA_RELATIONSHIPS_DESIGN.md.
const G1_ABSOLUTE_US_PER_EDGE = 5;
const G1_CREATIONS_PER_BATCH = 20000;

// Feature-free single workloads, comparable against a base checkout that
// predates the relationships feature.
const SINGLES = ['C12full', 'D13full', 'A1'];
// A1 is creation-only: the pre-feature base lacks the relationship
// machinery entirely, so a relative A1 comparison measures feature
// existence (~11x: ~290ms vs ~25ms per 20k plain shapes), not regression.
// A1 is therefore bounded absolutely instead: one-time cost per shape with
// wide headroom over the observed ~290ms. C12full/D13full measure run
// behavior comparable across versions and keep the relative blocker.
const SINGLES_ABSOLUTE_MS = { A1: 500 };

function vestConfigFor(cwd) {
  return path.join(
    cwd,
    'packages',
    'vest',
    'perf-gate',
    'vitest.perf.config.ts',
  );
}

function measurementFileFor(cwd) {
  return path.join(cwd, PAIRS_FILE);
}

function runMeasurement(cwd) {
  try {
    const output = execFileSync(
      VITEST_BIN,
      ['run', '--config', vestConfigFor(cwd), measurementFileFor(cwd)],
      { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
    );
    return parsePairs(output);
  } catch (error) {
    printCapturedEvidence(error);
    throw error;
  }
}

/**
 * Subprocess/parse failures still emit available evidence: print any
 * captured sample stdout before failing so a red gate never hides data.
 */
function printCapturedEvidence(error) {
  const stdout = capturedStdout(error);
  if (stdout.trim().length > 0) {
    console.log('--- captured measurement stdout (failing run) ---');
    console.log(stdout);
    console.log('--- end captured measurement stdout ---');
  }
}

function capturedStdout(error) {
  if (error === null || typeof error !== 'object' || !('stdout' in error)) {
    return '';
  }
  return String(error.stdout ?? '');
}

function parsePairs(output) {
  const samples = new Map();
  const singles = new Map();
  for (const line of output.split('\n')) {
    const pair = parsePairLine(line);
    if (pair) samples.set(pair.label, pair);
    const single = parseSingleLine(line);
    if (single) singles.set(single.label, single);
  }
  return { samples, singles };
}

function parsePairLine(line) {
  const index = line.indexOf('PERF_PAIR');
  if (index === -1) return null;
  let sample = null;
  try {
    sample = JSON.parse(line.slice(index + 'PERF_PAIR'.length).trim());
  } catch {
    return null;
  }
  if (!isPairSample(sample)) return null;
  return sample;
}

function isPairSample(sample) {
  return (
    sample !== null &&
    typeof sample === 'object' &&
    typeof sample.label === 'string' &&
    hasSampleArrays(sample)
  );
}

function hasSampleArrays(sample) {
  return (
    Array.isArray(sample.ratios) &&
    Array.isArray(sample.full) &&
    Array.isArray(sample.changed)
  );
}

function validPositive(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function cv(values) {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  if (!(mean > 0)) return NaN;
  const variance =
    values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance) / mean;
}

function evaluatePair(ratios, pair) {
  if (!hasUsableRatios(ratios)) {
    return { cv: NaN, median: NaN, verdict: 'fail-missing' };
  }
  const med = median(ratios);
  const stability = cv(ratios);
  // Zero variance is perfect stability, not missing data: only NaN (no
  // measurable mean) is inconclusive here.
  if (!Number.isFinite(stability) || stability > STABILITY_MAX_CV) {
    return { cv: stability, median: med, verdict: 'unstable' };
  }
  return { cv: stability, median: med, verdict: classifyMedian(med, pair) };
}

function hasUsableRatios(ratios) {
  return (
    Array.isArray(ratios) &&
    ratios.length >= MIN_PAIR_BATCHES &&
    ratios.every(validPositive)
  );
}

function hasValidPairTimings(sample) {
  if (!sample) return false;
  const { full, changed, ratios } = sample;
  if (!hasAlignedPairArrays(full, changed, ratios)) return false;
  return full.every(validPositive) && changed.every(validPositive);
}

function hasAlignedPairArrays(full, changed, ratios) {
  if (!Array.isArray(full) || !Array.isArray(changed)) return false;
  if (!Array.isArray(ratios)) return false;
  return full.length === changed.length && full.length === ratios.length;
}

function classifyMedian(med, pair) {
  if (med < pair.floor) return 'fail-breach';
  if (med < pair.target) return 'warn-below-target';
  return 'pass';
}

function gatePair(pair, initial, remeasure) {
  let samples = initial;
  let evaluated = evaluateGatedPair(pair, samples);
  let retried = false;
  if (evaluated.verdict === 'unstable') {
    retried = true;
    samples = remeasure();
    evaluated = evaluateGatedPair(pair, samples);
  }
  const times = sampleTimes(samples, pair.label);
  return {
    ...evaluated,
    retried,
    sample: samples.get(pair.label) ?? null,
    ...times,
  };
}

function evaluateGatedPair(pair, samples) {
  const sample = samples.get(pair.label);
  // Raw-time validation precedes arithmetic: mismatched lengths or
  // non-positive samples fail closed even when ratios look plausible.
  if (!hasValidPairTimings(sample)) {
    return { cv: NaN, median: NaN, verdict: 'fail-missing' };
  }
  // Ratios are derived from raw timings, never trusted from the sample:
  // a supplied ratio contradicting full/changed would otherwise pass.
  return evaluatePair(deriveRatios(sample), pair);
}

function deriveRatios(sample) {
  return sample.full.map((fullMs, index) => fullMs / sample.changed[index]);
}

function sampleTimes(samples, label) {
  const sample = samples.get(label);
  if (!sample) return { changedMs: NaN, fullMs: NaN };
  return { changedMs: median(sample.changed), fullMs: median(sample.full) };
}

function parseSingleLine(line) {
  const index = line.indexOf('PERF_SINGLE');
  if (index === -1) return null;
  const sample = parseJsonLine(line, index + 'PERF_SINGLE'.length);
  if (!isSingleSample(sample)) return null;
  return sample;
}

function parseJsonLine(line, start) {
  try {
    return JSON.parse(line.slice(start).trim());
  } catch {
    return null;
  }
}

function isSingleSample(sample) {
  return (
    sample !== null &&
    typeof sample === 'object' &&
    typeof sample.label === 'string' &&
    Array.isArray(sample.times)
  );
}

function checkBaseRegression(headMs, baseMs) {
  if (!validPositive(headMs) || !validPositive(baseMs) || !(baseMs > 0)) {
    return 'fail-missing';
  }
  return headMs > baseMs * BASE_LATENCY_GROWTH_LIMIT
    ? 'fail-regression'
    : 'pass';
}

function withBaselineFile(baselineDir, fn) {
  const dest = path.join(baselineDir, PAIRS_FILE);
  const configSrc = path.join(
    REPO_ROOT,
    'packages',
    'vest',
    'perf-gate',
    'vitest.perf.config.ts',
  );
  const configDest = path.join(
    baselineDir,
    'packages',
    'vest',
    'perf-gate',
    'vitest.perf.config.ts',
  );
  // A pre-existing injected file is byte-restored (not deleted) on success
  // and failure alike: the gate must never mutate baseline sources.
  const priorDest = readExistingFile(dest);
  const priorConfig = readExistingFile(configDest);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(REPO_ROOT, PAIRS_FILE), dest);
  if (priorConfig === null) {
    fs.mkdirSync(path.dirname(configDest), { recursive: true });
    fs.copyFileSync(configSrc, configDest);
  }
  try {
    return fn();
  } finally {
    restoreInjectedFile(dest, priorDest);
    if (priorConfig === null) {
      fs.rmSync(configDest, { force: true });
    } else {
      restoreInjectedFile(configDest, priorConfig);
    }
  }
}

function readExistingFile(filePath) {
  try {
    return fs.readFileSync(filePath);
  } catch {
    return null;
  }
}

function restoreInjectedFile(filePath, priorBytes) {
  if (priorBytes === null) {
    fs.rmSync(filePath, { force: true });
    return;
  }
  fs.writeFileSync(filePath, priorBytes);
}

function reportPair(pair, head) {
  console.log(
    `${pair.id} ${pair.label}: median ratio ${fmt(head.median)} ` +
      `(cv ${fmt(head.cv)}) -> ${head.verdict}${head.retried ? ' (retried)' : ''}`,
  );
  recordPairEvidence(pair, head);
}

function reportCreationOverhead(head) {
  const perEdgeUs = creationOverheadUs(head.sample);
  const verdict = classifyOverhead(perEdgeUs);
  console.log(
    `  G1 absolute overhead: ${fmt(Math.max(perEdgeUs, 0))}us/edge ` +
      `(ceiling ${G1_ABSOLUTE_US_PER_EDGE}us) -> ${verdict}`,
  );
  return verdict;
}

function classifyOverhead(perEdgeUs) {
  if (!Number.isFinite(perEdgeUs)) return 'fail-missing';
  if (perEdgeUs <= G1_ABSOLUTE_US_PER_EDGE) return 'pass';
  return 'fail-breach';
}

function pairFailed(entry) {
  return entry.verdict !== 'pass' && entry.verdict !== 'warn-below-target';
}

function creationOverheadUs(sample) {
  if (!isOverheadSample(sample)) return NaN;
  const diffs = sample.full.map((plainMs, index) =>
    batchOverheadUs(plainMs, sample.changed[index]),
  );
  if (diffs.some(value => !Number.isFinite(value))) return NaN;
  return median(diffs);
}

function isOverheadSample(sample) {
  return (
    !!sample &&
    Array.isArray(sample.full) &&
    Array.isArray(sample.changed) &&
    sample.full.length === sample.changed.length &&
    sample.full.length > 0
  );
}

function batchOverheadUs(plainMs, relatedMs) {
  if (!validPositive(plainMs) || !validPositive(relatedMs)) return NaN;
  return ((relatedMs - plainMs) / G1_CREATIONS_PER_BATCH) * 1000;
}

function fmt(value) {
  return validPositive(value) ? value.toFixed(3) : String(value);
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--self-test')) return selfTest() ? 0 : 1;
  const failed = runGate(parseBaselineDir(args));
  if (failed) throw new Error('gate:schema-performance failed');
  console.log('gate:schema-performance passed');
  return 0;
}

function parseBaselineDir(args) {
  const baselineIndex = args.indexOf('--baseline');
  return baselineIndex === -1 ? null : path.resolve(args[baselineIndex + 1]);
}

const EVIDENCE_FILE = path.join(REPO_ROOT, 'schema-perf-results.json');

function runGate(baselineDir) {
  resetEvidence();
  const head = runMeasurement(REPO_ROOT);
  const base = measureBaseline(baselineDir);
  // Pairs and singles are always both evaluated: a breached pair must not
  // hide base-regression evidence (or vice versa). Proven by the
  // no-short-circuit self-test.
  const remeasureSingles = () => ({
    head: runMeasurement(REPO_ROOT),
    base: measureBaseline(baselineDir),
  });
  const outcome = decideGateOutcome(head, base, [], remeasureSingles);
  // Evidence persists on pass AND failure: the CI artifact carries gate
  // measurements and verdicts separately from the earlier benchmark report.
  writeEvidenceFile(EVIDENCE_FILE, buildEvidence(outcome, baselineDir));
  return outcome.failed;
}

function resetEvidence() {
  evidence.pairs = [];
  evidence.singles = [];
}

const evidence = { pairs: [], singles: [] };

function recordPairEvidence(pair, entry) {
  evidence.pairs.push({
    changedMs: entry.changedMs,
    cv: entry.cv,
    floor: pair.floor,
    fullMs: entry.fullMs,
    id: pair.id,
    label: pair.label,
    median: entry.median,
    retried: entry.retried,
    target: pair.target,
    verdict: entry.verdict,
  });
}

function recordSingleEvidence(label, result, retried, kind) {
  evidence.singles.push({
    baseCv: result.baseCv,
    baseMs: result.baseMs,
    headCv: result.headCv,
    headMs: result.headMs,
    kind,
    label,
    retried,
    verdict: result.verdict,
  });
}

function buildEvidence(outcome, baselineDir) {
  return {
    baseline: baselineDir,
    failed: outcome.failed,
    generatedAt: new Date().toISOString(),
    node: process.version,
    pairs: evidence.pairs,
    sha: revisionSha(REPO_ROOT),
    singles: evidence.singles,
    trace: outcome.trace,
  };
}

function revisionSha(cwd) {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd,
      encoding: 'utf8',
    }).trim();
  } catch {
    return null;
  }
}

function writeEvidenceFile(filePath, payload) {
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`gate evidence written to ${filePath}`);
}

function decideGateOutcome(head, base, trace = [], remeasureSingles = null) {
  trace.push('pairs');
  const pairsFailed = evaluatePairs(head);
  trace.push('singles');
  const singlesFailed = evaluateAllSingles(head, base, remeasureSingles);
  return { failed: pairsFailed || singlesFailed, trace };
}

function evaluateAllSingles(head, base, remeasureSingles) {
  // Absolute singles (A1) need no baseline and are enforced in every mode;
  // relative singles additionally require a baseline. Every required row
  // evaluates despite another failure: an A1 breach must not suppress
  // relative evidence, or vice versa.
  const absoluteFailed = evaluateAbsoluteSingles(head);
  const relativeFailed =
    base !== null && evaluateSingles(head, base, remeasureSingles);
  return absoluteFailed || relativeFailed;
}

function evaluateAbsoluteSingles(head) {
  let failed = false;
  for (const label of Object.keys(SINGLES_ABSOLUTE_MS)) {
    if (evaluateAbsoluteSingle(label, head.singles)) failed = true;
  }
  return failed;
}

function measureBaseline(baselineDir) {
  if (!baselineDir) return null;
  return withBaselineFile(baselineDir, () => runMeasurement(baselineDir));
}

function evaluatePairs(head) {
  let failed = false;
  for (const pair of PAIRS) {
    if (evaluateGatePair(pair, head.samples)) failed = true;
  }
  return failed;
}

function evaluateSingles(head, base, remeasureSingles = null) {
  let failed = false;
  for (const label of SINGLES) {
    // Absolute-ceiling singles are enforced separately in every mode.
    if (Object.hasOwn(SINGLES_ABSOLUTE_MS, label)) continue;
    if (evaluateSingleGate(label, head.singles, base.singles, remeasureSingles))
      failed = true;
  }
  return failed;
}

function evaluateGatePair(pair, headSamples) {
  const entry = gatePair(
    pair,
    headSamples,
    () => runMeasurement(REPO_ROOT).samples,
  );
  reportPair(pair, entry);
  if (pair.id === 'G1') {
    return reportCreationOverhead(entry) !== 'pass' || pairFailed(entry);
  }
  return pairFailed(entry);
}

const MAX_SINGLE_RETRIES = 2;

function evaluateSingleGate(
  label,
  headSingles,
  baseSingles,
  remeasureSingles = null,
) {
  let result = checkSingle(label, headSingles, baseSingles);
  let retries = 0;
  // Bounded retries for inconclusive evidence only: stable breaches never
  // retry. Baseline instability cannot be fixed by remeasuring head alone:
  // remeasure both sides so a noisy baseline gets a fresh sample.
  while (result.verdict === 'unstable' && retries < MAX_SINGLE_RETRIES) {
    retries += 1;
    if (remeasureSingles) {
      const fresh = remeasureSingles();
      result = checkSingle(label, fresh.head.singles, fresh.base.singles);
    } else {
      const fresh = runMeasurement(REPO_ROOT);
      result = checkSingle(label, fresh.singles, baseSingles);
    }
  }
  reportSingle(label, result, retries > 0);
  return result.verdict !== 'pass';
}

/**
 * Absolute ceiling for creation-only singles (A1). Retries head once on
 * instability, then fails inconclusive — never success. The base sample is
 * reported for context but does not gate: see SINGLES_ABSOLUTE_MS.
 */
function evaluateAbsoluteSingle(label, headSingles) {
  const ceiling = SINGLES_ABSOLUTE_MS[label];
  const first = readAbsoluteSample(headSingles, label);
  if (first.times === null) {
    reportAbsoluteSingle(label, NaN, NaN, ceiling, false, 'fail-missing');
    return true;
  }
  const sample = stabilizeAbsoluteSample(first, label);
  const verdict = classifyAbsoluteSample(sample, ceiling);
  reportAbsoluteSingle(
    label,
    sample.headMs,
    sample.headCv,
    ceiling,
    sample.retried,
    verdict,
  );
  return verdict !== 'pass';
}

function readAbsoluteSample(headSingles, label) {
  return { label, times: timesOf(headSingles, label) };
}

function stabilizeAbsoluteSample(first, label) {
  if (!isUnstableTimes(first.times)) {
    return { ...describeTimes(first.times), retried: false };
  }
  const fresh = runMeasurement(REPO_ROOT);
  return { ...describeTimes(timesOf(fresh.singles, label)), retried: true };
}

function isUnstableTimes(times) {
  return times === null || unstableCv(cv(times));
}

function describeTimes(times) {
  if (times === null || times.length < MIN_PAIR_BATCHES) {
    return { headCv: NaN, headMs: NaN };
  }
  return { headCv: cv(times), headMs: median(times) };
}

function classifyAbsoluteSample(sample, ceiling) {
  if (isUnstableAbsoluteSample(sample)) return 'unstable';
  return sample.headMs <= ceiling ? 'pass' : 'fail-breach';
}

function isUnstableAbsoluteSample(sample) {
  return (
    !validPositive(sample.headMs) ||
    !Number.isFinite(sample.headCv) ||
    sample.headCv > STABILITY_MAX_CV
  );
}

function reportAbsoluteSingle(
  label,
  headMs,
  headCv,
  ceiling,
  retried,
  verdict,
) {
  console.log(
    `single ${label}: head ${fmt(headMs)}ms (cv ${fmt(headCv)}) ` +
      `vs absolute ceiling ${ceiling}ms -> ${verdict}` +
      `${retried ? ' (retried)' : ''}`,
  );
  recordSingleEvidence(
    label,
    { baseCv: NaN, baseMs: NaN, headCv, headMs, verdict },
    retried,
    'absolute',
  );
}

function checkSingle(label, headSingles, baseSingles) {
  const headTimes = timesOf(headSingles, label);
  const baseTimes = timesOf(baseSingles, label);
  if (!headTimes || !baseTimes) {
    return {
      baseCv: NaN,
      baseMs: NaN,
      headCv: NaN,
      headMs: NaN,
      verdict: 'fail-missing',
    };
  }
  return checkSingleTimes(headTimes, baseTimes);
}

function checkSingleTimes(headTimes, baseTimes) {
  // Thin evidence fails closed: a single timing per side cannot establish
  // stability, even when the medians agree.
  if (
    headTimes.length < MIN_PAIR_BATCHES ||
    baseTimes.length < MIN_PAIR_BATCHES
  ) {
    return {
      baseCv: NaN,
      baseMs: NaN,
      headCv: NaN,
      headMs: NaN,
      verdict: 'fail-missing',
    };
  }
  const headCv = cv(headTimes);
  const baseCv = cv(baseTimes);
  const headMs = median(headTimes);
  const baseMs = median(baseTimes);
  if (unstableCv(headCv) || unstableCv(baseCv)) {
    return { baseCv, baseMs, headCv, headMs, verdict: 'unstable' };
  }
  return {
    baseCv,
    baseMs,
    headCv,
    headMs,
    verdict: checkBaseRegression(headMs, baseMs),
  };
}

function unstableCv(value) {
  return !Number.isFinite(value) || value > STABILITY_MAX_CV;
}

function timesOf(singles, label) {
  const sample = singles.get(label);
  if (!sample || !Array.isArray(sample.times) || sample.times.length === 0) {
    return null;
  }
  return sample.times;
}

function reportSingle(label, result, retried) {
  console.log(
    `single ${label}: head ${fmt(result.headMs)}ms (cv ${fmt(result.headCv)}) ` +
      `vs base ${fmt(result.baseMs)}ms (cv ${fmt(result.baseCv)}) -> ${result.verdict}` +
      `${retried ? ' (retried)' : ''}`,
  );
  recordSingleEvidence(label, result, retried, 'relative');
}

function selfTest() {
  const results = [
    ...selfTestEvaluate(),
    ...selfTestParse(),
    ...selfTestDuplicateRows(),
    ...selfTestBase(),
    ...selfTestPairEvidence(),
    ...selfTestSingles(),
    ...selfTestSinglesNoShortCircuit(),
    ...selfTestNoShortCircuit(),
    ...selfTestHeadOnlyAbsolute(),
    ...selfTestInjectedFileRestore(),
    ...selfTestEvidenceWriteFailure(),
    ...selfTestEvidenceFile(),
  ];
  const ok = results.every(Boolean);
  console.log(ok ? 'self-test passed' : 'self-test FAILED');
  return ok;
}

function checkCase(label, pass) {
  console.log(`self-test ${label}: ${pass ? 'pass' : 'FAIL'}`);
  return pass;
}

function selfTestEvaluate() {
  const cases = [
    { ratios: [1.4, 1.5, 1.45, 1.5, 1.42, 1.48, 1.46], verdict: 'pass' },
    {
      ratios: [0.95, 0.96, 0.94, 0.95, 0.97, 0.95, 0.96],
      verdict: 'warn-below-target',
    },
    {
      ratios: [0.8, 0.82, 0.79, 0.81, 0.8, 0.82, 0.81],
      verdict: 'fail-breach',
    },
    {
      ratios: [1.4, NaN, 1.45, 1.5, 1.42, 1.48, 1.46],
      verdict: 'fail-missing',
    },
    { ratios: [1.0, 2.0, 1.0, 2.0, 1.0, 2.0, 1.0], verdict: 'unstable' },
    { ratios: [], verdict: 'fail-missing' },
    { ratios: [1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5], verdict: 'pass' },
  ];
  const results = cases.map(({ ratios, verdict }, index) =>
    checkCase(
      `evaluate ${index} (expect ${verdict})`,
      evaluatePair(ratios, { floor: 0.9, target: 1.0 }).verdict === verdict,
    ),
  );
  results.push(
    checkCase(
      'evaluate G1 warn band (0.85 vs floor 0.8)',
      evaluatePair([0.85, 0.86, 0.84, 0.85, 0.87, 0.85, 0.86], {
        floor: 0.8,
        target: 0.9,
      }).verdict === 'warn-below-target',
    ),
    checkCase(
      'G1 below floor fails even with absolute ceiling passing',
      pairFailed(
        evaluatePair([0.75, 0.76, 0.74, 0.75, 0.77, 0.75, 0.76], {
          floor: 0.8,
          target: 0.9,
        }),
      ) === true && classifyOverhead(1.5) === 'pass',
    ),
    checkCase(
      'creation overhead within ceiling',
      classifyOverhead(0.5) === 'pass' &&
        classifyOverhead(0) === 'pass' &&
        classifyOverhead(-0.2) === 'pass',
    ),
    checkCase(
      'creation overhead breach/missing',
      classifyOverhead(5.9) === 'fail-breach' &&
        classifyOverhead(NaN) === 'fail-missing',
    ),
  );
  return results;
}

function selfTestDuplicateRows() {
  // Duplicate row labels resolve deterministically (last row wins): the
  // measurement file must still emit each label exactly once per run.
  const parsed = parsePairs(
    'PERF_SINGLE {"label":"A1","times":[100]}\nPERF_SINGLE {"label":"A1","times":[200]}\n',
  );
  return [
    checkCase(
      'duplicate rows resolve last-wins',
      parsed.singles.get('A1')?.times?.[0] === 200,
    ),
  ];
}

function selfTestParse() {
  const good = parsePairs(
    'noise\nPERF_PAIR {"label":"X","ratios":[1.5],"full":[2],"changed":[1]}\nPERF_SINGLE {"label":"Y","times":[3]}\ntail',
  );
  const cases = [
    { pass: good.samples.has('X'), label: 'json pair line' },
    { pass: good.singles.has('Y'), label: 'json single line' },
    {
      pass: !parsePairs('no rows here').samples.has('X'),
      label: 'missing row',
    },
    {
      pass: !parsePairs('PERF_PAIR not-json').samples.has('X'),
      label: 'malformed row ignored',
    },
  ];
  return cases.map(({ pass, label }) => checkCase(`parse ${label}`, pass));
}

function selfTestBase() {
  // Latency-growth budget is exactly 10%: 110/100 passes, 111/100 fails.
  const cases = [
    { args: [100, 100], want: 'pass' },
    { args: [110, 100], want: 'pass' },
    { args: [111, 100], want: 'fail-regression' },
    { args: [NaN, 100], want: 'fail-missing' },
  ];
  return cases.map(({ args, want }, index) =>
    checkCase(
      `base ${index} (expect ${want})`,
      checkBaseRegression(args[0], args[1]) === want,
    ),
  );
}

function selfTestPairEvidence() {
  const good = {
    changed: [1, 1, 1, 1, 1, 1, 1],
    full: [2, 2, 2, 2, 2, 2, 2],
    label: 'X',
    ratios: [2, 2, 2, 2, 2, 2, 2],
  };
  const thin = { ...good, ratios: [1.4] };
  const mismatched = { ...good, full: [2, 2] };
  const nonPositive = { ...good, changed: [1, 0, 1, 1, 1, 1, 1] };
  const pair = { floor: 0.9, label: 'X', target: 1.0 };
  return [
    checkCase(
      'pair thin sample fails closed',
      evaluateGatedPair(pair, new Map([['X', thin]])).verdict ===
        'fail-missing',
    ),
    checkCase(
      'pair mismatched lengths fail closed',
      evaluateGatedPair(pair, new Map([['X', mismatched]])).verdict ===
        'fail-missing',
    ),
    checkCase(
      'pair non-positive times fail closed',
      evaluateGatedPair(pair, new Map([['X', nonPositive]])).verdict ===
        'fail-missing',
    ),
    checkCase(
      'pair valid evidence passes',
      evaluateGatedPair(pair, new Map([['X', good]])).verdict === 'pass',
    ),
    checkCase(
      'pair ratios derive from timings, not supplied values',
      evaluateGatedPair(
        { floor: 0.9, label: 'X', target: 1.0 },
        new Map([
          [
            'X',
            {
              changed: [200, 200, 200, 200, 200, 200, 200],
              full: [100, 100, 100, 100, 100, 100, 100],
              label: 'X',
              ratios: [2, 2, 2, 2, 2, 2, 2],
            },
          ],
        ]),
      ).verdict === 'fail-breach',
    ),
  ];
}

function selfTestSinglesNoShortCircuit() {
  // An absolute-single failure must not suppress relative-singles
  // evaluation: the retry spy proves the relative stage still ran.
  let relativeEvaluated = false;
  const head = {
    samples: passingPairSamples(),
    singles: new Map([
      ['A1', { label: 'A1', times: [600, 600, 600, 600, 600, 600, 600] }],
      [
        'C12full',
        { label: 'C12full', times: [100, 100, 100, 100, 100, 100, 100] },
      ],
      [
        'D13full',
        { label: 'D13full', times: [100, 100, 100, 100, 100, 100, 100] },
      ],
    ]),
  };
  const base = {
    samples: new Map(),
    singles: new Map([
      [
        'C12full',
        { label: 'C12full', times: [100, 100, 100, 100, 100, 100, 100] },
      ],
      ['D13full', { label: 'D13full', times: [50, 150, 50, 150, 50, 150, 50] }],
    ]),
  };
  const failed = evaluateAllSingles(head, base, () => {
    relativeEvaluated = true;
    return { head, base };
  });
  void failed;
  return [
    checkCase(
      'absolute failure still evaluates relative singles',
      relativeEvaluated === true,
    ),
  ];
}

function passingPairSamples() {
  const good = {
    changed: [1, 1, 1, 1, 1, 1, 1],
    full: [2, 2, 2, 2, 2, 2, 2],
    label: 'C13',
    ratios: [2, 2, 2, 2, 2, 2, 2],
  };
  const g1 = {
    changed: [2, 2, 2, 2, 2, 2, 2],
    full: [2, 2, 2, 2, 2, 2, 2],
    label: 'G1',
    ratios: [1, 1, 1, 1, 1, 1, 1],
  };
  const d13 = { ...good, label: 'D13' };
  return new Map([
    ['C13', good],
    ['D13', d13],
    ['G1', g1],
  ]);
}

function selfTestHeadOnlyAbsolute() {
  // Head-only mode (no baseline) still enforces absolute singles.
  const head = {
    samples: passingPairSamples(),
    singles: absoluteTestSingles(600),
  };
  const trace = [];
  const outcome = decideGateOutcome(head, null, trace);
  const headOk = {
    samples: passingPairSamples(),
    singles: absoluteTestSingles(290),
  };
  const outcomeOk = decideGateOutcome(headOk, null, []);
  return [
    checkCase(
      'head-only trace always covers singles',
      JSON.stringify(trace) === JSON.stringify(['pairs', 'singles']),
    ),
    checkCase('head-only A1 breach fails', outcome.failed === true),
    checkCase('head-only A1 within ceiling passes', outcomeOk.failed === false),
  ];
}

function selfTestEvidenceWriteFailure() {
  let thrown = null;
  try {
    writeEvidenceFile(
      '/nonexistent-dir-xyz/evidence.json',
      buildEvidence({ failed: true, trace: [] }, null),
    );
  } catch (error) {
    thrown = error;
  }
  return [
    checkCase('evidence write failure is visible, not silent', thrown !== null),
  ];
}

function selfTestEvidenceFile() {
  const fs = require('node:fs');
  const os = require('node:os');
  const filePath = path.join(
    fs.mkdtempSync(path.join(os.tmpdir(), 'gate-evidence-')),
    'evidence.json',
  );
  resetEvidence();
  recordPairEvidence(
    { floor: 0.9, id: 'G4', label: 'C13', target: 1.0 },
    {
      changedMs: 1,
      cv: 0.1,
      fullMs: 2,
      median: 2,
      retried: false,
      verdict: 'pass',
    },
  );
  writeEvidenceFile(
    filePath,
    buildEvidence({ failed: false, trace: ['pairs', 'singles'] }, null),
  );
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  resetEvidence();
  return [
    checkCase(
      'evidence file carries pair verdicts',
      parsed.failed === false &&
        parsed.pairs.length === 1 &&
        parsed.pairs[0].id === 'G4' &&
        parsed.pairs[0].verdict === 'pass' &&
        Array.isArray(parsed.trace),
    ),
  ];
}

function selfTestInjectedFileRestore() {
  const fs = require('node:fs');
  const os = require('node:os');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gate-restore-'));
  const dest = path.join(dir, PAIRS_FILE);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, 'pre-existing');
  withBaselineFile(dir, () => {
    if (fs.readFileSync(dest, 'utf8') === 'pre-existing') {
      throw new Error('injection did not overwrite');
    }
  });
  const restored = fs.readFileSync(dest, 'utf8') === 'pre-existing';
  fs.rmSync(dir, { force: true, recursive: true });
  return [checkCase('injected file bytes restored', restored)];
}

function steadySingles(ms) {
  return new Map([['S', { label: 'S', times: [ms, ms, ms, ms, ms, ms, ms] }]]);
}

function selfTestSingles() {
  const stable = steadySingles(100);
  const regressed = steadySingles(130);
  const unstable = new Map([
    ['S', { label: 'S', times: [50, 150, 50, 150, 50, 150, 50] }],
  ]);
  const missing = new Map();
  function thin(ms) {
    return new Map([['S', { label: 'S', times: [ms] }]]);
  }
  return [
    checkCase(
      'singles stable pass',
      checkSingle('S', stable, stable).verdict === 'pass',
    ),
    checkCase(
      'singles regression',
      checkSingle('S', regressed, stable).verdict === 'fail-regression',
    ),
    checkCase(
      'singles missing',
      checkSingle('S', missing, stable).verdict === 'fail-missing',
    ),
    checkCase(
      'singles unstable',
      checkSingle('S', unstable, stable).verdict === 'unstable',
    ),
    checkCase(
      'singles thin evidence fails closed',
      checkSingle('S', thin(100), thin(100)).verdict === 'fail-missing',
    ),
    checkCase(
      'absolute A1 under ceiling passes',
      evaluateAbsoluteSingle('A1', absoluteTestSingles(290)) === false,
    ),
    checkCase(
      'absolute A1 over ceiling breaches',
      evaluateAbsoluteSingle('A1', absoluteTestSingles(600)) === true,
    ),
    checkCase(
      'absolute A1 missing fails',
      evaluateAbsoluteSingle('A1', new Map()) === true,
    ),
  ];
}

function selfTestNoShortCircuit() {
  // Breaching pairs must not skip singles evaluation: the trace proves
  // both stages ran.
  const breaching = {
    samples: new Map([
      ['C13', { changed: [1], full: [1], label: 'C13', ratios: [0.5] }],
      ['D13', { changed: [1], full: [1], label: 'D13', ratios: [0.5] }],
      ['G1', { changed: [1], full: [1], label: 'G1', ratios: [0.5] }],
    ]),
    singles: new Map([['C12full', { label: 'C12full', times: [10] }]]),
  };
  const base = {
    samples: new Map(),
    singles: new Map([['C12full', { label: 'C12full', times: [10] }]]),
  };
  const trace = [];
  const outcome = decideGateOutcome(breaching, base, trace);
  // Unstable baselines must remeasure both sides: a head-only retry keeps
  // the same noisy baseline and can never stabilize.
  let retriedBase = null;
  const unstableBase = evaluateSingleGate(
    'S',
    steadyTestSingles(100),
    new Map([['S', { label: 'S', times: [50, 150, 50, 150, 50, 150, 50] }]]),
    () => {
      retriedBase = steadyTestSingles(100);
      return {
        head: { singles: steadyTestSingles(100) },
        base: { singles: retriedBase },
      };
    },
  );
  return [
    checkCase(
      'no short-circuit trace',
      JSON.stringify(trace) === JSON.stringify(['pairs', 'singles']),
    ),
    checkCase('breach still fails', outcome.failed === true),
    checkCase(
      'unstable baseline retries both sides',
      retriedBase !== null && unstableBase === false,
    ),
  ];
}

function steadyTestSingles(ms) {
  return new Map([['S', { label: 'S', times: [ms, ms, ms, ms, ms, ms, ms] }]]);
}

function absoluteTestSingles(ms) {
  return new Map([
    ['A1', { label: 'A1', times: [ms, ms, ms, ms, ms, ms, ms] }],
  ]);
}

try {
  process.exitCode = main();
} catch (error) {
  process.stderr.write(`${error.stack ?? error}\n`);
  process.exitCode = 1;
}
