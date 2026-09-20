import { describe, expect, it } from 'vitest';

import { create, enforce, test } from '../src/vest';
import { each } from '../src/isolates/each';

/**
 * Paired full-vs-changed throughput measurement for gate:schema-performance.
 * Runs in-process (no cross-process noise): warmup, then interleaved
 * full/changed batches in alternating order, printing one PERF_PAIR JSON
 * line per workload. Budgets live in scripts/gate-schema-performance.js;
 * this file asserts only structural sanity (finite positive ratios).
 */

const BATCHES = 30;
const WARMUP = 5;
// Singles compare absolute medians across two checkouts, so they need
// tighter dispersion estimates than interleaved pairs: twice the batches
// at the same budgets (floors, CV limit, and retry policy unchanged).
const SINGLE_BATCHES = 60;
// Full-run singles are short enough for scheduler/GC outliers to dominate a
// raw sample. Each of the frozen 60 samples is therefore the median of five
// independent timings. This is applied identically to head and baseline; it
// changes no threshold, sample count, retry count, or 10% regression budget.
const FULL_RUN_REPETITIONS_PER_SAMPLE = 5;

type PairSample = {
  changed: number[];
  full: number[];
  label: string;
  ratios: number[];
};

type SingleSample = {
  label: string;
  skipped?: string;
  times: number[];
};

function printSample(sample: PairSample | SingleSample) {
  // eslint-disable-next-line no-console
  console.log(
    `${'ratios' in sample ? 'PERF_PAIR' : 'PERF_SINGLE'} ${JSON.stringify(sample)}`,
  );
}

function hasDependsOn(): boolean {
  return (
    typeof (enforce.isString() as unknown as Record<string, unknown>)
      .dependsOn === 'function'
  );
}

function measureSingle(
  label: string,
  fn: () => void,
  repetitions = 1,
): SingleSample {
  for (let i = 0; i < WARMUP; i += 1) fn();
  const times: number[] = [];
  for (let i = 0; i < SINGLE_BATCHES; i += 1) {
    times.push(medianTiming(fn, repetitions));
  }
  const sample: SingleSample = { label, times };
  printSample(sample);
  return sample;
}

function skipPair(label: string, reason: string): void {
  printSample({ changed: [], full: [], label, ratios: [], skipped: reason });
}

function measure(
  label: string,
  full: () => void,
  changed: () => void,
): PairSample {
  for (let i = 0; i < WARMUP; i += 1) {
    full();
    changed();
  }
  const fullTimes: number[] = [];
  const changedTimes: number[] = [];
  for (let i = 0; i < BATCHES; i += 1) {
    if (i % 2 === 0) {
      fullTimes.push(timed(full));
      changedTimes.push(timed(changed));
    } else {
      changedTimes.push(timed(changed));
      fullTimes.push(timed(full));
    }
  }
  const ratios = fullTimes.map((fullTime, index) => {
    const changedTime = changedTimes[index] as number;
    return fullTime / changedTime;
  });
  const sample = { changed: changedTimes, full: fullTimes, label, ratios };
  printSample(sample);
  return sample;
}

function timed(fn: () => void): number {
  const start = performance.now();
  fn();
  return performance.now() - start;
}

function medianTiming(fn: () => void, repetitions: number): number {
  const times: number[] = [];
  for (let i = 0; i < repetitions; i += 1) times.push(timed(fn));
  times.sort((a, b) => a - b);
  return times[Math.floor(times.length / 2)] as number;
}

function travelers(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    country: 'US',
    passportNumber: `P${i}`,
  }));
}

describe('schema performance pairs', () => {
  it('C13 array(100) changed vs C12 full', () => {
    if (!hasDependsOn()) {
      skipPair('C13', 'no-dependsOn');
      measureSingle(
        'C12full',
        plainArrayRun(),
        FULL_RUN_REPETITIONS_PER_SAMPLE,
      );
      return;
    }
    const itemSchema = enforce.shape({
      country: enforce.isString(),
      passportNumber: enforce.isString().dependsOn($ => $.country),
    });
    const schema = enforce.shape({
      travelers: enforce.isArrayOf(itemSchema),
    });
    const makeSuite = () => {
      const data = { travelers: travelers(100) };
      const suite = create(
        (d: { travelers: { country: string; passportNumber: string }[] }) => {
          each(d.travelers, (t, i) => {
            test(`travelers.${i}.country`, () => {
              enforce(t.country).isString();
            });
            test(`travelers.${i}.passportNumber`, () => {
              enforce(t.passportNumber).isString();
            });
          });
        },
        schema,
      );
      suite.run(data);
      return { data, suite };
    };
    const full = makeSuite();
    const changed = makeSuite();
    const changedData = { travelers: travelers(100) };
    changedData.travelers[50] = { country: 'CA', passportNumber: 'P50' };
    const sample = measure(
      'C13',
      () => void full.suite.run(full.data),
      () => void changed.suite.changed('travelers.50.country').run(changedData),
    );
    assertSample(sample);
    measureSingle('C12full', plainArrayRun(), FULL_RUN_REPETITIONS_PER_SAMPLE);
  }, 120000);

  it('D13 volatility changed vs full', () => {
    if (!hasDependsOn()) {
      skipPair('D13', 'no-dependsOn');
      measureSingle('D13full', plainVolRun(), FULL_RUN_REPETITIONS_PER_SAMPLE);
      return;
    }
    const fields: Record<string, unknown> = {};
    for (let i = 0; i < 100; i += 1) {
      fields[`field_${i}`] = enforce.isString();
    }
    fields.consumer = enforce.isString().dependsOn($ => $.field_0);
    const schema = enforce.shape(fields as never);
    const data: Record<string, string> = {};
    for (let i = 0; i < 100; i += 1) data[`field_${i}`] = `v${i}`;
    data.consumer = 'x';
    const makeSuite = () => {
      const suite = create(d => {
        for (let i = 0; i < 100; i += 1) {
          test(`field_${i}`, () => {
            enforce((d as Record<string, string>)[`field_${i}`]).isString();
          });
        }
        test('consumer', () => {
          enforce((d as Record<string, string>).consumer).isString();
        });
      }, schema);
      suite.run(data as never);
      return suite;
    };
    const fullSuite = makeSuite();
    const changedSuite = makeSuite();
    const changedData = { ...data, field_0: 'changed' };
    const sample = measure(
      'D13',
      () => void fullSuite.run(data as never),
      () => void changedSuite.changed('field_0').run(changedData as never),
    );
    assertSample(sample);
    measureSingle('D13full', plainVolRun(), FULL_RUN_REPETITIONS_PER_SAMPLE);
  }, 120000);

  it('G1 creation with vs without dependsOn', () => {
    // A1 emits exactly once per run: the baseline path emits it here and
    // returns; the feature path emits it after the pair below. Duplicate
    // rows would silently overwrite each other in the gate's sample map.
    if (!hasDependsOn()) {
      measureSingle('A1', plainShapeBatch());
      skipPair('G1', 'no-dependsOn');
      return;
    }
    const plain = () => {
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString(),
      });
    };
    const related = () => {
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString().dependsOn($ => $.a),
      });
    };
    // Microsecond-scale creation timings need high per-batch volume to
    // average out GC/JIT noise; the paired ratio cancels the rest.
    const sample = measure(
      'G1',
      repeatWork(plain, 20000),
      repeatWork(related, 20000),
    );
    assertSample(sample);
    measureSingle('A1', plainShapeBatch());
  }, 180000);
});

function repeatWork(fn: () => void, times: number): () => void {
  return () => {
    for (let i = 0; i < times; i += 1) fn();
  };
}

function plainShapeBatch(): () => void {
  return () => {
    for (let i = 0; i < 20000; i += 1) {
      enforce.shape({
        a: enforce.isString(),
        b: enforce.isString(),
      });
    }
  };
}

function assertSample(sample: PairSample): void {
  expect(sample.ratios).toHaveLength(BATCHES);
  for (const ratio of sample.ratios) {
    expect(Number.isFinite(ratio)).toBe(true);
    expect(ratio).toBeGreaterThan(0);
  }
}

function plainArrayRun(): () => void {
  const data = { travelers: travelers(100) };
  const suite = create(
    (d: { travelers: { country: string; passportNumber: string }[] }) => {
      each(d.travelers, (t, i) => {
        test(`travelers.${i}.country`, () => {
          enforce(t.country).isString();
        });
        test(`travelers.${i}.passportNumber`, () => {
          enforce(t.passportNumber).isString();
        });
      });
    },
    enforce.shape({
      travelers: enforce.isArrayOf(
        enforce.shape({
          country: enforce.isString(),
          passportNumber: enforce.isString(),
        }),
      ),
    }),
  );
  suite.run(data);
  return () => void suite.run(data);
}

function plainVolRun(): () => void {
  const data: Record<string, string> = {};
  for (let i = 0; i < 100; i += 1) data[`field_${i}`] = `v${i}`;
  data.consumer = 'x';
  const members: Record<string, unknown> = {};
  for (let i = 0; i < 100; i += 1) members[`field_${i}`] = enforce.isString();
  members.consumer = enforce.isString();
  const suite = create(
    (d: Record<string, string>) => {
      for (let i = 0; i < 100; i += 1) {
        test(`field_${i}`, () => {
          enforce(d[`field_${i}`]).isString();
        });
      }
      test('consumer', () => {
        enforce(d.consumer).isString();
      });
    },
    enforce.shape(members as never),
  );
  suite.run(data as never);
  return () => void suite.run(data as never);
}
