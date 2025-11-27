import { bench, describe } from 'vitest';

import debounce from '../src/exports/debounce';
import { enforce } from '../src/vest';

describe('Debounce coverage', () => {
  bench(
    'debounced invocation',
    async () => {
      const debounced = debounce(() => Promise.resolve(true), 0);
      await debounced({} as any);

      const debouncedEven = debounce(
        () => Promise.resolve(enforce(4).greaterThan(2)),
        0,
      );
      await debouncedEven({} as any);
    },
    { time: 150, iterations: 10, warmupTime: 50 },
  );
});
