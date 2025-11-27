import { bench, describe } from 'vitest';

import { TFieldName, TGroupName } from '../src/suiteResult/SuiteResultTypes';
import { create, group, omitWhen, skipWhen, test } from '../src/vest';

const createNestedSuite = (depth: number) =>
  create(() => {
    const walk = (level: number) => {
      if (level <= 0) {
        test('leaf' as TFieldName, () => {});
        return;
      }

      group(`group_${level}` as TGroupName, () => {
        skipWhen(level % 5 === 0, () => {
          test(`skipped_${level}` as TFieldName, () => {});
        });

        omitWhen(level % 7 === 0, () => {
          test(`omitted_${level}` as TFieldName, () => {});
        });

        walk(level - 1);
      });
    };

    walk(depth);
  });

const nested10 = createNestedSuite(10);
const nested50 = createNestedSuite(50);
const nested100 = createNestedSuite(100);

describe('Deep Nesting Stress', () => {
  bench(
    'depth 10',
    () => {
      for (let i = 0; i < 10; i++) {
        nested10.run();
      }
    },
    { time: 1000 },
  );

  bench(
    'depth 50',
    () => {
      for (let i = 0; i < 5; i++) {
        nested50.run();
      }
    },
    { time: 1000 },
  );

  bench(
    'depth 100',
    () => {
      for (let i = 0; i < 3; i++) {
        nested100.run();
      }
    },
    { time: 1000 },
  );
});
