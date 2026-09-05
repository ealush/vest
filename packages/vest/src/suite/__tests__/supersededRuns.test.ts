import { describe, expect, it } from 'vitest';

import { create, enforce, test } from '../../vest';

type Deferred = {
  promise: Promise<void>;
  release: () => void;
};

function createDeferred(): Deferred {
  let release: () => void = () => {};
  const promise = new Promise<void>(resolve => {
    release = resolve;
  });
  return { promise, release };
}

function flushAsyncWork(): Promise<void> {
  return new Promise<void>(resolve => setImmediate(resolve));
}

describe('superseded suite.run() ownership', () => {
  it('makes a pending plain run adopt its plain successor outcome', async () => {
    const gate = createDeferred();
    const firstDone = createDeferred();
    const suite = create((data: { tag: string }) => {
      test('tag', async () => {
        try {
          if (data.tag === 'first') await gate.promise;
          enforce(data.tag).isNotBlank();
        } finally {
          if (data.tag === 'first') firstDone.release();
        }
      });
    });

    const first = suite.run({ tag: 'first' });
    const second = suite.run({ tag: 'second' });
    const secondResult = await second;
    gate.release();
    await firstDone.promise;
    await flushAsyncWork();

    expect(await first).toBe(secondResult);
    expect(suite.get().hasErrors('tag')).toBe(false);
  });

  it('chains ownership independently for interleaved suites', async () => {
    const firstGate = createDeferred();
    const secondGate = createDeferred();
    const createGatedSuite = (gate: Deferred, expected: string) =>
      create((data: { tag: string }) => {
        test('tag', async () => {
          await gate.promise;
          enforce(data.tag).equals(expected);
        });
      });
    const firstSuite = createGatedSuite(firstGate, 'a');
    const secondSuite = createGatedSuite(secondGate, 'b');

    const staleFirst = firstSuite.run({ tag: 'a' });
    const secondRun = secondSuite.run({ tag: 'b' });
    const latestFirst = firstSuite.run({ tag: 'a' });
    firstGate.release();
    const latestFirstResult = await latestFirst;

    expect(await staleFirst).toBe(latestFirstResult);
    secondGate.release();
    expect((await secondRun).hasErrors('tag')).toBe(false);
  });
});
