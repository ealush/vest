import { performance } from 'node:perf_hooks';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import 'vest/relationships';
import { create, enforce, test } from 'vest';
import { resolveAffected } from 'n4s/relationships';

function wideSchema() {
  const fields = { source: enforce.isString() };
  for (let i = 0; i < 2000; i++)
    fields['dependent' + i] = enforce.isString().dependsOn($ => $.source);
  return enforce.shape(fields);
}

function fixture(schema, data, field) {
  const callback = () => test(field, () => true);
  const full = create(callback, schema);
  const changed = create(callback, schema);
  return {
    full: () => full.run(data),
    changed: () => changed.changed(field).run(data),
  };
}

function elapsed(run, count = 200) {
  const start = performance.now();
  for (let i = 0; i < count; i++) run();
  return (performance.now() - start) / count;
}

function median(values) {
  return [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
}

function compare({ full, changed }) {
  for (let i = 0; i < 300; i++) {
    full();
    changed();
  }
  const pairs = Array.from({ length: 9 }, (_, i) => {
    if (i % 2) {
      const b = elapsed(changed);
      return [elapsed(full), b];
    }
    return [elapsed(full), elapsed(changed)];
  });
  const fullMs = median(pairs.map(pair => pair[0]));
  const changedMs = median(pairs.map(pair => pair[1]));
  return { fullMs, changedMs, ratio: changedMs / fullMs };
}

const schema = wideSchema();
const data = Object.fromEntries(
  ['source', ...Array.from({ length: 2000 }, (_, i) => 'dependent' + i)].map(
    key => [key, 'ok'],
  ),
);
const rowSchema = enforce.shape({
  currency: enforce.isString(),
  rows: enforce.isArrayOf(
    enforce.shape({
      price: enforce.isNumber().dependsOn($ => $.root.currency),
    }),
  ),
});
const rows = {
  currency: 'USD',
  rows: Array.from({ length: 1000 }, () => ({ price: 1 })),
};
const cold = Array.from({ length: 7 }, () => {
  const fresh = wideSchema();
  return elapsed(() => resolveAffected(fresh, ['source'], data), 1);
});
const results = {
  I1: compare(fixture(schema, data, 'source')),
  I2: compare(fixture(rowSchema, rows, 'currency')),
  coldGraphMs: median(cold),
  warmPlanningMs: elapsed(() => resolveAffected(schema, ['source'], data)),
  // Full n4s validation fails fast; changed validates every selected top-level
  // field. This exposes the different work without gating an invalid-data ratio.
  invalidWide: compare(
    fixture(wideSchema(), { ...data, dependent0: 1 }, 'source'),
  ),
};
const baselineIndex = process.argv.indexOf('--baseline');
if (baselineIndex >= 0) {
  results.I3 = compareOnlyRows(process.argv[baselineIndex + 1]);
}
process.stdout.write(JSON.stringify(results, null, 2) + '\n');
if (
  results.I1.ratio > 1.5 ||
  results.I2.ratio > 1.5 ||
  results.warmPlanningMs > 10 ||
  (results.I3 && results.I3.ratio > 1.1)
)
  process.exitCode = 1;

function compareOnlyRows(baseline) {
  const directory = path.dirname(fileURLToPath(import.meta.url));
  const worker = path.join(
    directory,
    'fixtures/relationships-only-benchmark.cjs',
  );
  const current = path.resolve(directory, '..');
  const sample = root =>
    Number(execFileSync(process.execPath, [worker, path.resolve(root)]));
  // Isolate package versions and module formats so V8's shared call-site
  // feedback and the opt-in graph allocations cannot contaminate ordinary runs.
  const pairs = Array.from({ length: 9 }, (_, i) => {
    if (i % 2) {
      const b = sample(current);
      return [sample(baseline), b];
    }
    return [sample(baseline), sample(current)];
  });
  const fullMs = median(pairs.map(pair => pair[0]));
  const changedMs = median(pairs.map(pair => pair[1]));
  return { fullMs, changedMs, ratio: changedMs / fullMs };
}
