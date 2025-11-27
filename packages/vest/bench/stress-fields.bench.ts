import { bench, describe } from 'vitest';

import { create, enforce, test } from '../src/vest';

const createFieldSuite = (fieldCount: number) =>
  create(() => {
    for (let i = 0; i < fieldCount; i++) {
      test(`field_${i}`, () => {
        enforce(i).isNumber();
      });
    }
  });

const suite10 = createFieldSuite(10);
const suite500 = createFieldSuite(500);
const suite1000 = createFieldSuite(1000);

function runSuiteTimes(
  suite: ReturnType<typeof createFieldSuite>,
  iterations: number,
): void {
  for (let i = 0; i < iterations; i++) {
    suite.run();
  }
}

describe('Field Volume Stress', () => {
  bench(
    '10 fields',
    () => {
      runSuiteTimes(suite10, 5);
    },
    { time: 1000 },
  );

  bench(
    '500 fields',
    () => {
      runSuiteTimes(suite500, 3);
    },
    { time: 1000 },
  );

  bench(
    '1000 fields',
    () => {
      runSuiteTimes(suite1000, 2);
    },
    { time: 1000 },
  );
});
