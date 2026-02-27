import { bench, describe } from 'vitest';

import { TestFnPayload } from '../src/core/test/TestTypes';
import debounce from '../src/exports/debounce';
import { enforce } from '../src/vest';

describe('Debounce coverage', () => {
  bench(
    'debounced invocation',
    async () => {
      const debounced = debounce(() => Promise.resolve(true), 0);
      await debounced({
        signal: new AbortController().signal,
      } as TestFnPayload);

      const debouncedEven = debounce(
        () => Promise.resolve(enforce(4).greaterThan(2)),
        0,
      );
      await debouncedEven({
        signal: new AbortController().signal,
      } as TestFnPayload);
    },
    { time: 150, iterations: 10, warmupTime: 50 },
  );
});
