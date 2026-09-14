/**
 * gate:schema-performance — paired throughput gate for schema-relationship
 * benchmarks (production acceptance plan: PF01-PF06).
 *
 * Method (see the retired >10x/>20x analysis): Vest's per-run cost is
 * dominated by declaring and reconciling the whole suite, so cross-process
 * throughput comparisons drown in process noise. This gate instead runs
 * packages/vest/src/__tests__/perf-pairs.test.ts, which measures
 * full-vs-changed pairs in-process (warmup, then interleaved batches in
 * alternating order) and prints one PERF_PAIR JSON line per workload.
 * It enforces revised floors (changed/full >= 1x target, 0.9x hard floor;
 * creation A2/A1 >= 0.90), fails closed on missing rows, NaN samples, and
 * breached floors, and treats excess dispersion (after one retry) as
 * inconclusive-fail. With --baseline <dir> (a built checkout, e.g. CI's
 * .benchmark-baseline), the same file is copied there and per-workload
 * changed-side regressions beyond the predeclared limit fail.
 * --self-test exercises the pure parse/evaluate logic on synthetic data.
 * Exit nonzero on any violation.
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
  'src',
  '__tests__',
  'perf-pairs.test.ts',
);

const STABILITY_MAX_CV = 0.2;
const BASE_REGRESSION_LIMIT = 0.8;

const PAIRS = [
  { floor: 0.9, id: 'G4', label: 'C13', target: 1.0 },
  { floor: 0.9, id: 'G6', label: 'D13', target: 1.0 },
  { floor: 0.9, id: 'G1', label: 'G1', target: 0.9 },
];

// Feature-free single workloads, comparable against a base checkout that
// predates the relationships feature.
const SINGLES = ['C12full', 'D13full', 'A1'];

function vestConfigFor(cwd) {
  return path.join(cwd, 'packages', 'vest', 'vitest.config.ts');
}

function measurementFileFor(cwd) {
  return path.join(cwd, PAIRS_FILE);
}

function runMeasurement(cwd) {
  const output = execFileSync(
    VITEST_BIN,
    ['run', '--config', vestConfigFor(cwd), measurementFileFor(cwd)],
    { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
  );
  return parsePairs(output);
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
  if (!validPositive(stability) || stability > STABILITY_MAX_CV) {
    return { cv: stability, median: med, verdict: 'unstable' };
  }
  return { cv: stability, median: med, verdict: classifyMedian(med, pair) };
}

function hasUsableRatios(ratios) {
  return (
    Array.isArray(ratios) && ratios.length > 0 && ratios.every(validPositive)
  );
}

function classifyMedian(med, pair) {
  if (med < pair.floor) return 'fail-breach';
  if (med < pair.target) return 'warn-below-target';
  return 'pass';
}

function gatePair(pair, initial, remeasure) {
  let samples = initial;
  let evaluated = evaluatePair(samples.get(pair.label)?.ratios, pair);
  let retried = false;
  if (evaluated.verdict === 'unstable') {
    retried = true;
    samples = remeasure();
    evaluated = evaluatePair(samples.get(pair.label)?.ratios, pair);
  }
  return {
    ...evaluated,
    changedMs: pairChangedMs(samples, pair.label),
    retried,
  };
}

function pairChangedMs(samples, label) {
  const sample = samples.get(label);
  if (!sample) return NaN;
  return median(sample.changed);
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

function singleMedianMs(singles, label) {
  const sample = singles.get(label);
  if (!sample) return NaN;
  return median(sample.times);
}

function checkBaseRegression(headMs, baseMs) {
  if (!validPositive(headMs) || !validPositive(baseMs) || !(baseMs > 0)) {
    return 'fail-missing';
  }
  return headMs > baseMs / BASE_REGRESSION_LIMIT ? 'fail-regression' : 'pass';
}

function withBaselineFile(baselineDir, fn) {
  const dest = path.join(baselineDir, PAIRS_FILE);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(REPO_ROOT, PAIRS_FILE), dest);
  try {
    return fn();
  } finally {
    fs.rmSync(dest, { force: true });
  }
}

function reportPair(pair, head) {
  console.log(
    `${pair.id} ${pair.label}: median ratio ${fmt(head.median)} ` +
      `(cv ${fmt(head.cv)}) -> ${head.verdict}${head.retried ? ' (retried)' : ''}`,
  );
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

function runGate(baselineDir) {
  const head = runMeasurement(REPO_ROOT);
  const base = measureBaseline(baselineDir);
  return evaluatePairs(head) || (base !== null && evaluateSingles(head, base));
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

function evaluateSingles(head, base) {
  let failed = false;
  for (const label of SINGLES) {
    if (evaluateSingleGate(label, head.singles, base.singles)) failed = true;
  }
  return failed;
}

function evaluateGatePair(pair, headSamples) {
  const entry = gatePair(pair, headSamples, () => runMeasurement(REPO_ROOT));
  reportPair(pair, entry);
  return entry.verdict !== 'pass' && entry.verdict !== 'warn-below-target';
}

function evaluateSingleGate(label, headSingles, baseSingles) {
  const headMs = singleMedianMs(headSingles, label);
  const baseMs = singleMedianMs(baseSingles, label);
  const verdict = checkBaseRegression(headMs, baseMs);
  console.log(
    `single ${label}: head ${fmt(headMs)}ms vs base ${fmt(baseMs)}ms -> ${verdict}`,
  );
  return verdict !== 'pass';
}

function selfTest() {
  const results = [
    ...selfTestEvaluate(),
    ...selfTestParse(),
    ...selfTestBase(),
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
  ];
  return cases.map(({ ratios, verdict }, index) =>
    checkCase(
      `evaluate ${index} (expect ${verdict})`,
      evaluatePair(ratios, { floor: 0.9, target: 1.0 }).verdict === verdict,
    ),
  );
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
  const cases = [
    { args: [100, 100], want: 'pass' },
    { args: [130, 100], want: 'fail-regression' },
    { args: [NaN, 100], want: 'fail-missing' },
  ];
  return cases.map(({ args, want }, index) =>
    checkCase(
      `base ${index} (expect ${want})`,
      checkBaseRegression(args[0], args[1]) === want,
    ),
  );
}

try {
  process.exitCode = main();
} catch (error) {
  process.stderr.write(`${error.stack ?? error}\n`);
  process.exitCode = 1;
}
