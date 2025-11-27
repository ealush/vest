import { bench, describe } from 'vitest';

import { TFieldName, TGroupName } from '../src/suiteResult/SuiteResultTypes';
import {
  create,
  enforce,
  group,
  omitWhen,
  optional,
  skipWhen,
  test,
  warn,
} from '../src/vest';

type NestedConfig = {
  depth: number;
  fieldsPerLevel: number;
};

const createNestedFieldsSuite = ({ depth, fieldsPerLevel }: NestedConfig) =>
  create(() => {
    const walk = (level: number) => {
      if (level >= depth) {
        return;
      }

      group(`level_${level}` as TGroupName, () => {
        optional(`optional_${level}` as TFieldName);

        skipWhen(level % 2 === 0, () => {
          test(`skipped_${level}` as TFieldName, () => {});
        });

        omitWhen(level % 3 === 0, () => {
          test(`omitted_${level}` as TFieldName, () => {});
        });

        test(`optional_${level}` as TFieldName, () => {
          enforce(level).isNumber();
        });

        for (let i = 0; i < fieldsPerLevel; i++) {
          test(`field_${level}_${i}` as TFieldName, () => {
            enforce(i + level).isNumber();
          });

          test(`warn_field_${level}_${i}` as TFieldName, () => {
            warn();
            enforce(i + level).isNumber();
          });
        }

        walk(level + 1);
      });
    };

    walk(0);
  });

const nested40x3 = createNestedFieldsSuite({ depth: 3, fieldsPerLevel: 40 });
const nested60x4 = createNestedFieldsSuite({ depth: 4, fieldsPerLevel: 60 });
const nested80x5 = createNestedFieldsSuite({ depth: 5, fieldsPerLevel: 80 });

function runSuiteTimes(
  suite: ReturnType<typeof createNestedFieldsSuite>,
  iterations: number,
): void {
  for (let i = 0; i < iterations; i++) {
    suite.run();
  }
}

describe('Nested Fields with Hooks', () => {
  bench(
    'depth 3 with 40 fields per level',
    () => {
      runSuiteTimes(nested40x3, 3);
    },
    { iterations: 5, time: 100, warmupIterations: 1, warmupTime: 50 },
  );

  bench(
    'depth 4 with 60 fields per level',
    () => {
      runSuiteTimes(nested60x4, 2);
    },
    { iterations: 3, time: 100, warmupIterations: 1, warmupTime: 50 },
  );

  bench(
    'depth 5 with 80 fields per level',
    () => {
      runSuiteTimes(nested80x5, 1);
    },
    { iterations: 2, time: 100, warmupIterations: 1, warmupTime: 50 },
  );
});
