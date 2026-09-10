import { describe, expect, it, vi } from 'vitest';
import { enforce } from 'n4s';

import { invokeWithUnknown } from '../../__tests__/runtimeTestUtils';

import { create, mode, Modes, test } from '../../vest';

function deferred() {
  let release: () => void = () => {};
  const promise = new Promise<void>(resolve => {
    release = resolve;
  });
  return { promise, release };
}

// Drain the reconciler after a deliberately controlled settlement, without sleeps.
const flush = () =>
  new Promise<void>(resolve => {
    setImmediate(resolve);
  });
const schema = enforce.shape({
  p: enforce.shape({
    source: enforce.isString(),
    target: enforce.isString().dependsOn($ => $.source),
  }),
  other: enforce.isString(),
});

describe('schema contracts: async interactions', () => {
  it.each([false, true])(
    '[SC-ASYNC] parent supersession wins over the opposite stale verdict (latest valid=%s)',
    async latestValid => {
      const gate = deferred();
      const entered = vi.fn();
      const suite = create(data => {
        mode(Modes.ALL);
        test('p.target', async () => {
          entered(data.p.source);
          if (data.p.source === 'old') await gate.promise;
          enforce(
            data.p.source === 'old' ? !latestValid : latestValid,
          ).isTruthy();
        });
        test('other', () => true);
      }, schema);
      const old = suite.run({ p: { source: 'old', target: 'x' }, other: 'ok' });
      const current = suite
        .changed('p')
        .run({ p: { source: 'new', target: 'x' }, other: 'ok' });
      try {
        // This assertion also ensures a broken parent selector cannot leave us
        // awaiting the stale promise forever.
        expect(entered.mock.calls).toEqual([['old'], ['new']]);
        const result = await current;
        expect(result.hasErrors('p.target')).toBe(!latestValid);
        gate.release();
        await flush();
        expect(await old).toBe(result);
        expect(suite.get().hasErrors('p.target')).toBe(!latestValid);
        expect(suite.get().isPending()).toBe(false);
      } finally {
        gate.release();
        await flush();
      }
    },
  );

  it('[SC-ASYNC] an unrelated edit keeps pending work and receives its eventual error', async () => {
    const gate = deferred();
    const calls = vi.fn();
    const suite = create(() => {
      mode(Modes.ALL);
      test('p.target', async () => {
        calls();
        await gate.promise;
        enforce(false).isTruthy();
      });
      test('other', () => true);
    }, schema);
    suite.run({ p: { source: 'same', target: 'x' }, other: 'before' });
    const current = suite
      .changed('other')
      .run({ p: { source: 'same', target: 'x' }, other: 'after' });
    try {
      expect(calls).toHaveBeenCalledTimes(1);
      expect(current.isPending()).toBe(true);
      expect(current.value).toBeUndefined();
      gate.release();
      const result = await current;
      expect(result.hasErrors('p.target')).toBe(true);
      expect(result.isPending()).toBe(false);
      expect(result.value).toBeUndefined();
    } finally {
      gate.release();
      await flush();
    }
  });

  it.each(['reset', 'remove', 'resetField'] as const)(
    '[SC-ASYNC-LIFECYCLE] %s prevents late work from resurrecting a field failure',
    async operation => {
      const gate = deferred();
      const suite = create(() => {
        test('p.target', async () => {
          await gate.promise;
          enforce(false).isTruthy();
        });
      }, schema);
      suite.run({ p: { source: 'same', target: 'x' }, other: 'ok' });
      try {
        expect(suite.get().isPending()).toBe(true);
        if (operation === 'reset') suite.reset();
        else invokeWithUnknown(suite[operation], 'p.target');
        gate.release();
        await flush();
        expect(suite.get().hasErrors('p.target')).toBe(false);
        expect(suite.get().isPending()).toBe(false);
      } finally {
        gate.release();
        await flush();
      }
    },
  );

  it('[SC-ASYNC] suites sharing schema metadata retain independent async state', async () => {
    const gate = deferred();
    const make = () =>
      create(data => {
        test('p.target', async () => {
          if (data.p.source === 'slow') await gate.promise;
          enforce(data.p.source).notEquals('slow');
        });
      }, schema);
    const slow = make();
    const fast = make();
    const pending = slow
      .changed('p.source')
      .run({ p: { source: 'slow', target: 'x' }, other: 'ok' });
    try {
      const result = await fast
        .changed('p.source')
        .run({ p: { source: 'fast', target: 'x' }, other: 'ok' });
      expect(result.isValid()).toBe(true);
      expect(slow.get().isPending()).toBe(true);
      gate.release();
      await pending;
      expect(slow.get().hasErrors('p.target')).toBe(true);
      expect(fast.get().isValid()).toBe(true);
    } finally {
      gate.release();
      await flush();
    }
  });
});
