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

  it('keeps a pending run owned by itself when its successor throws synchronously', async () => {
    const gate = createDeferred();
    const firstDone = createDeferred();
    const suite = create((data: { explode?: boolean; tag: string }) => {
      if (data.explode) throw new Error('boom');
      test('tag', async () => {
        try {
          await gate.promise;
          enforce(data.tag).isNotBlank();
        } finally {
          firstDone.release();
        }
      });
    });

    const first = suite.run({ tag: 'first' });
    expect(() => suite.run({ explode: true, tag: 'second' })).toThrow('boom');

    gate.release();
    await firstDone.promise;
    await flushAsyncWork();

    const outcome = await Promise.race([
      Promise.resolve(first),
      new Promise<'timeout'>(resolve => setImmediate(() => resolve('timeout'))),
    ]);
    expect(outcome).not.toBe('timeout');
    if (outcome !== 'timeout') {
      expect(outcome.hasErrors('tag')).toBe(false);
    }
  });
});

describe('superseded ownership across three generations (BB08)', () => {
  it('[SC-BB08] three pending runs all settle with the latest outcome', async () => {
    const gates = [createDeferred(), createDeferred(), createDeferred()];
    const suite = create((data: { tag: string }) => {
      test('tag', async () => {
        if (data.tag === 'first') await gates[0].promise;
        if (data.tag === 'second') await gates[1].promise;
        enforce(data.tag).isNotBlank();
      });
    });
    const first = suite.run({ tag: 'first' });
    const second = suite.run({ tag: 'second' });
    const third = suite.run({ tag: 'third' });
    const thirdResult = await third;
    gates[0].release();
    gates[1].release();
    await flushAsyncWork();
    // Transitive chaining: twice-superseded handles follow to the latest.
    expect(await first).toBe(thirdResult);
    expect(await second).toBe(thirdResult);
    expect(thirdResult.hasErrors('tag')).toBe(false);
  });

  it('[SC-BB08] rejected late work never resurrects after reset', async () => {
    const gate = createDeferred();
    const suite = create((data: { tag: string }) => {
      test('tag', async () => {
        await gate.promise;
        if (data.tag === 'stale') throw new Error('stale failure');
        enforce(data.tag).isNotBlank();
      });
    });
    const stale = suite.run({ tag: 'stale' });
    const staleSettled = Promise.resolve(stale).then(
      () => 'settled' as const,
      () => 'rejected' as const,
    );
    suite.reset();
    gate.release();
    await flushAsyncWork();
    // The reset suite shows no failure either way; a stale handle that
    // never settles must not publish into the cleared state.
    const outcome = await Promise.race([
      staleSettled,
      new Promise<'pending'>(resolve => setImmediate(() => resolve('pending'))),
    ]);
    expect(['settled', 'rejected', 'pending']).toContain(outcome);
    expect(suite.get().hasErrors('tag')).toBe(false);
    const recovery = suite.run({ tag: 'fresh' });
    expect(recovery.hasErrors('tag')).toBe(false);
  });

  it('[SC-BB08] new-first resolve before old-first leaves latest authoritative', async () => {
    const oldGate = createDeferred();
    const suite = create((data: { tag: string }) => {
      test('tag', async () => {
        if (data.tag === 'old') await oldGate.promise;
        enforce(data.tag).isNotBlank();
      });
    });
    const old = suite.run({ tag: 'old' });
    const latest = suite.run({ tag: 'new' });
    const latestResult = await latest;
    oldGate.release();
    await flushAsyncWork();
    expect(await old).toBe(latestResult);
    expect(suite.get().hasErrors('tag')).toBe(false);
  });
});

describe('superseded ownership across focused runs (BB08)', () => {
  it('[SC-BB08] stale failure settling after a focused run publishes last-finish-wins', async () => {
    let release!: () => void;
    const gate = new Promise<void>(resolve => {
      release = resolve;
    });
    const suite = create((data: { a: string; b: string }) => {
      test('a', async () => {
        if (data.a === 'bad') await gate;
        enforce(data.a).notEquals('bad');
      });
      test('b', () => {
        enforce(data.b).isString();
      });
    });
    // Full run starts slow failing validation of a field the later
    // focused run does not revalidate. Last-finish-wins: the stale
    // failure publishes when it settles; a focused run does not fence it.
    const slow = suite.run({ a: 'bad', b: 'x' });
    const staleSettled = Promise.resolve(slow).then(
      () => 'settled' as const,
      () => 'rejected' as const,
    );
    suite.changed('b').run({ a: 'ok', b: 'y' });
    release();
    await staleSettled;
    await flushAsyncWork();
    expect(suite.get().hasErrors('a')).toBe(true);
    expect(suite.get().hasErrors('b')).toBe(false);
    // A fresh full run with good data clears the stale verdict.
    const recovery = suite.run({ a: 'ok', b: 'y' });
    expect(recovery.hasErrors('a')).toBe(false);
  });
});
