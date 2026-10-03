import { bench, describe } from 'vitest';

import '../src/exports/relationships';
import { create, enforce, test } from '../src/vest';

const wideFields: Record<string, ReturnType<typeof enforce.isString>> = {
  source: enforce.isString(),
};
for (let i = 0; i < 2000; i++) {
  wideFields[`dependent${i}`] = enforce.isString().dependsOn($ => $.source);
}
const wideData = Object.fromEntries(
  Object.keys(wideFields).map(key => [key, 'ok']),
);
const wideSuite = create(
  () => test('source', () => true),
  enforce.shape(wideFields),
);

const rowsData = {
  currency: 'USD',
  rows: Array.from({ length: 1000 }, () => ({ price: 1 })),
};
const rowsSuite = create(
  () => test('currency', () => true),
  enforce.shape({
    currency: enforce.isString(),
    rows: enforce.isArrayOf(
      enforce.shape({
        price: enforce.isNumber().dependsOn($ => $.root.currency),
      }),
    ),
  }),
);

describe('schema relationships changed run', () => {
  bench('I1 full run: 2,000 dependents', () => {
    wideSuite.run(wideData);
  });
  bench('I1 changed: 2,000 dependents', () => {
    wideSuite.changed('source').run(wideData);
  });
  bench('I2 full run: 1,000 rows', () => {
    rowsSuite.run(rowsData);
  });
  bench('I2 changed: 1,000 rows', () => {
    rowsSuite.changed('currency').run(rowsData);
  });
});
