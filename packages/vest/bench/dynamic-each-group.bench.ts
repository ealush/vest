import { bench, describe } from 'vitest';

import { TFieldName, TGroupName } from '../src/suiteResult/SuiteResultTypes';
import { create, each, enforce, group, test } from '../src/vest';

const eachSuite = create((items: number[]) => {
  group('numbers' as TGroupName, () => {
    each(items, (value, index) => {
      test(
        `item_${index}` as TFieldName,
        () => {
          enforce(value).isNumber().greaterThanOrEquals(0);
        },
        `key_${index}`,
      );
    });
  });
});

const shortList = [1, 2, 3, 4, 5];
const longList = Array.from({ length: 50 }, (_, i) => i * 2);

describe('Dynamic each and groups', () => {
  bench(
    'small list',
    () => {
      eachSuite.run(shortList);
    },
    { time: 120, iterations: 20 },
  );

  bench(
    'longer list',
    () => {
      eachSuite.run(longList);
    },
    { time: 120, iterations: 8 },
  );
});
