import { bench, describe } from 'vitest';

import { enforce } from '../src/vest';

enforce.extend({
  isEven: value => typeof value === 'number' && value % 2 === 0,
  isCapitalized: value => typeof value === 'string' && /^[A-Z]/.test(value),
});

function exerciseEnforceChains(values: Array<number | string>): void {
  for (const value of values) {
    enforce(value).notEquals(null);
    if (typeof value === 'number') {
      enforce(value).isNumber().greaterThanOrEquals(0).lessThan(1_000_000);
      enforce(value).isEven();
    } else {
      // @ts-expect-error - custom rule
      enforce(value).isString().isCapitalized().shorterThanOrEquals(20);
    }
  }
}

describe('Advanced enforce and debounce coverage', () => {
  bench(
    'enforce chains with custom rules',
    () => {
      exerciseEnforceChains([1, 2, 3, 'Alpha', 'Beta', 255, 1024]);
    },
    { time: 150, iterations: 20 },
  );
});
