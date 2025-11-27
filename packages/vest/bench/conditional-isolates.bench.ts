import { bench, describe } from 'vitest';

import { create, enforce, omitWhen, skipWhen, test } from '../src/vest';

type ConditionalData = {
  skipEven: boolean;
  omitModulo?: number;
};

const conditionalSuite = create((data: ConditionalData) => {
  for (let i = 0; i < 10; i++) {
    skipWhen(data.skipEven && i % 2 === 0, () => {
      test(`skip_${i}`, () => {
        enforce(i).isNumber();
      });
    });

    omitWhen(
      data.omitModulo !== undefined && i % (data.omitModulo || 1) === 0,
      () => {
        test(`omit_${i}`, () => {
          enforce(i).isNumber();
        });
      },
    );

    test(`base_${i}`, () => {
      enforce(i).lessThan(20);
    });
  }
});

describe('Conditional isolates', () => {
  bench(
    'skip even indices',
    () => {
      conditionalSuite.run({ skipEven: true, omitModulo: 3 });
    },
    { time: 120, iterations: 10 },
  );

  bench(
    'omit multiples of 4',
    () => {
      conditionalSuite.run({ skipEven: false, omitModulo: 4 });
    },
    { time: 120, iterations: 10 },
  );
});
