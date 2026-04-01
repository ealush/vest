import { beforeAll, describe, expect, it, vi } from 'vitest';

import { enforce } from '../n4s';

declare global {
  namespace n4s {
    interface EnforceMatchers {
      isAsyncPositive: (value: number) => Promise<{ pass: boolean }>;
      isAsyncEven: (
        value: number,
      ) => Promise<{ pass: boolean; message: () => string }>;
      isAsyncInRange: (
        value: number,
        min: number,
        max: number,
      ) => Promise<{ pass: boolean; message: string }>;
      isAsyncBool: (value: unknown) => Promise<boolean>;
      isDelayedPass: (value: string) => Promise<{ pass: boolean }>;
    }
  }
}

beforeAll(() => {
  enforce.extend({
    isAsyncPositive: async (value: number) => ({
      pass: value > 0,
    }),
    isAsyncEven: async (value: number) => ({
      pass: value % 2 === 0,
      message: () => `${value} is not even`,
    }),
    isAsyncInRange: async (value: number, min: number, max: number) => ({
      pass: value >= min && value <= max,
      message: `${value} is not between ${min} and ${max}`,
    }),
    isAsyncBool: async (value: unknown) => typeof value === 'number',
    isDelayedPass: async (value: string) => {
      await new Promise(resolve => setTimeout(resolve, 10));
      return { pass: value.length > 0 };
    },
  });
});

describe('Async enforce', () => {
  describe('Basic async rule execution', () => {
    it('should resolve when async rule passes', async () => {
      await expect(enforce(5).isAsyncPositive()).resolves.toBeUndefined();
    });

    it('should reject when async rule fails', async () => {
      await expect(enforce(-1).isAsyncPositive()).rejects.toThrow();
    });

    it('should resolve for async rule returning boolean true', async () => {
      await expect(enforce(42).isAsyncBool()).resolves.toBeUndefined();
    });

    it('should reject for async rule returning boolean false', async () => {
      await expect(enforce('not a number').isAsyncBool()).rejects.toThrow();
    });

    it('should resolve for delayed async rules', async () => {
      await expect(enforce('hello').isDelayedPass()).resolves.toBeUndefined();
    });

    it('should reject for delayed async rules that fail', async () => {
      await expect(enforce('').isDelayedPass()).rejects.toThrow();
    });
  });

  describe('Async rules with arguments', () => {
    it('should pass additional arguments to async rules', async () => {
      await expect(enforce(5).isAsyncInRange(1, 10)).resolves.toBeUndefined();
    });

    it('should fail with correct message when args-based async rule fails', async () => {
      await expect(enforce(15).isAsyncInRange(1, 10)).rejects.toThrow(
        '15 is not between 1 and 10',
      );
    });
  });

  describe('Error messages', () => {
    it('should use the message function from async rule result', async () => {
      await expect(enforce(3).isAsyncEven()).rejects.toThrow('3 is not even');
    });

    it('should use the message string from async rule result', async () => {
      await expect(enforce(100).isAsyncInRange(1, 10)).rejects.toThrow(
        '100 is not between 1 and 10',
      );
    });

    it('should use default message when async rule has no message', async () => {
      await expect(enforce(-1).isAsyncPositive()).rejects.toThrow(
        'enforce/isAsyncPositive',
      );
    });
  });

  describe('Custom messages via .message()', () => {
    it('should use .message() override for async rule failures', async () => {
      await expect(
        enforce(-1).message('Must be positive').isAsyncPositive(),
      ).rejects.toThrow('Must be positive');
    });

    it('should clear .message() after each rule', async () => {
      await expect(
        enforce(3).message('Custom message').isAsyncEven(),
      ).rejects.toThrow('Custom message');
    });

    it('should not carry .message() to subsequent rules', async () => {
      await expect(
        enforce(-3)
          .message('First rule message')
          .isAsyncPositive()
          .isAsyncEven(),
      ).rejects.toThrow('First rule message');
    });
  });

  describe('Chain ordering: sync before async', () => {
    it('should run sync rules immediately before async', async () => {
      await expect(
        enforce(5).isNumber().isAsyncPositive(),
      ).resolves.toBeUndefined();
    });

    it('should fail fast on sync rule before async rule is reached', () => {
      expect(() => {
        enforce('not a number').isNumber().isAsyncPositive();
      }).toThrow();
    });

    it('should run multiple sync rules then async', async () => {
      await expect(
        enforce(4).isNumber().greaterThan(0).isAsyncEven(),
      ).resolves.toBeUndefined();
    });

    it('should fail fast on second sync rule', () => {
      expect(() => {
        enforce(-4).isNumber().greaterThan(0).isAsyncEven();
      }).toThrow();
    });
  });

  describe('Chain ordering: async before sync', () => {
    it('should queue sync rules after async rules', async () => {
      await expect(
        enforce(4).isAsyncEven().isNumber(),
      ).resolves.toBeUndefined();
    });

    it('should reject when queued sync rule fails after async', async () => {
      await expect(enforce(4).isAsyncEven().equals(5)).rejects.toThrow();
    });

    it('should reject with sync rule error when async passes but sync fails', async () => {
      await expect(enforce(4).isAsyncEven().greaterThan(100)).rejects.toThrow();
    });
  });

  describe('Chain ordering: multiple async rules', () => {
    it('should resolve when all async rules pass', async () => {
      await expect(
        enforce(4).isAsyncPositive().isAsyncEven(),
      ).resolves.toBeUndefined();
    });

    it('should reject when first async rule fails', async () => {
      await expect(enforce(-4).isAsyncPositive().isAsyncEven()).rejects.toThrow(
        'enforce/isAsyncPositive',
      );
    });

    it('should reject when second async rule fails', async () => {
      await expect(enforce(3).isAsyncPositive().isAsyncEven()).rejects.toThrow(
        '3 is not even',
      );
    });

    it('should handle three async rules all passing', async () => {
      await expect(
        enforce(4).isAsyncPositive().isAsyncEven().isAsyncInRange(1, 10),
      ).resolves.toBeUndefined();
    });

    it('should reject on the third async rule failure', async () => {
      await expect(
        enforce(4).isAsyncPositive().isAsyncEven().isAsyncInRange(10, 20),
      ).rejects.toThrow('4 is not between 10 and 20');
    });
  });

  describe('Mixed chain: sync-async-sync-async', () => {
    it('should handle interleaved sync and async rules passing', async () => {
      await expect(
        enforce(4).isNumber().isAsyncPositive().greaterThan(0).isAsyncEven(),
      ).resolves.toBeUndefined();
    });

    it('should reject when later sync rule (queued after async) fails', async () => {
      await expect(
        enforce(4).isAsyncPositive().greaterThan(100).isAsyncEven(),
      ).rejects.toThrow();
    });
  });

  describe('.pass property behavior', () => {
    it('should be true before async rule settles', () => {
      const chain = enforce(5).isAsyncPositive();
      expect(chain.pass).toBe(true);
    });

    it('should remain true after async rule resolves', async () => {
      const chain = enforce(5).isAsyncPositive();
      await chain;
      expect(chain.pass).toBe(true);
    });

    it('should be set to false after async rule rejects', async () => {
      const chain = enforce(-1).isAsyncPositive();
      expect(chain.pass).toBe(true);

      await expect(chain).rejects.toThrow();
      expect(chain.pass).toBe(false);
    });

    it('should be false when second async rule in chain rejects', async () => {
      const chain = enforce(3).isAsyncPositive().isAsyncEven();
      expect(chain.pass).toBe(true);

      await expect(chain).rejects.toThrow();
      expect(chain.pass).toBe(false);
    });

    it('should be false when queued sync rule after async rejects', async () => {
      const chain = enforce(4).isAsyncEven().greaterThan(100);
      expect(chain.pass).toBe(true);

      await expect(chain).rejects.toThrow();
      expect(chain.pass).toBe(false);
    });
  });

  describe('Thenable behavior', () => {
    it('sync-only chains should not be thenable', () => {
      const chain = enforce('hello').isString();
      expect(chain.then).toBeUndefined();
      expect(chain.catch).toBeUndefined();
      expect(chain.finally).toBeUndefined();
    });

    it('async chains should be thenable', () => {
      const chain = enforce(5).isAsyncPositive();
      expect(chain.then).toBeInstanceOf(Function);
      expect(chain.catch).toBeInstanceOf(Function);
      expect(chain.finally).toBeInstanceOf(Function);
    });

    it('chain becomes thenable after first async rule', () => {
      const chain = enforce(5).isNumber();
      expect(chain.then).toBeUndefined();

      const asyncChain = chain.isAsyncPositive();
      expect(asyncChain.then).toBeInstanceOf(Function);
    });

    it('should support .then() directly', async () => {
      const result = await enforce(5)
        .isAsyncPositive()
        .then(() => 'done');
      expect(result).toBe('done');
    });

    it('should support .catch() directly', async () => {
      const result = await enforce(-1)
        .isAsyncPositive()
        .catch(() => 'caught');
      expect(result).toBe('caught');
    });

    it('should support .finally()', async () => {
      const spy = vi.fn();
      await enforce(5).isAsyncPositive().finally(spy);
      expect(spy).toHaveBeenCalledOnce();
    });

    it('should call .finally() on rejection too', async () => {
      const spy = vi.fn();
      await enforce(-1)
        .isAsyncPositive()
        .catch(() => {})
        .finally(spy);
      expect(spy).toHaveBeenCalledOnce();
    });

    it('should work with standard await', async () => {
      await enforce(5).isNumber().isAsyncPositive();
    });

    it('should support try/catch for async failures', async () => {
      try {
        await enforce(-1).isAsyncPositive();
        expect.unreachable('should have thrown');
      } catch (e: any) {
        expect(e.message).toContain('isAsyncPositive');
      }
    });
  });

  describe('Lazy API guard', () => {
    it('should throw when async rule is used in lazy API via .run()', () => {
      expect(() => {
        enforce.isAsyncPositive().run(5);
      }).toThrow('returned a Promise');
    });

    it('should throw when async rule is used in lazy API via .test()', () => {
      expect(() => {
        enforce.isAsyncPositive().test(5);
      }).toThrow('returned a Promise');
    });

    it('should include the rule name in the error message', () => {
      expect(() => {
        enforce.isAsyncEven().run(4);
      }).toThrow('isAsyncEven');
    });

    it('should include guidance about using eager API', () => {
      expect(() => {
        enforce.isAsyncPositive().run(5);
      }).toThrow('eager API');
    });
  });

  describe('Execution order guarantees', () => {
    it('should execute queued rules in order', async () => {
      const order: string[] = [];

      enforce.extend({
        asyncTrackOrder: async (_value: unknown, label: string) => {
          order.push(label);
          return { pass: true };
        },
      });

      // @ts-expect-error - testing dynamic rule
      await enforce('test')
        .asyncTrackOrder('first')
        .asyncTrackOrder('second')
        .asyncTrackOrder('third');

      expect(order).toEqual(['first', 'second', 'third']);
    });

    it('should not execute rules after a failure in the chain', async () => {
      const executed: string[] = [];

      enforce.extend({
        asyncTrack: async (
          _value: unknown,
          label: string,
          shouldPass: boolean,
        ) => {
          executed.push(label);
          return { pass: shouldPass };
        },
      });

      await expect(
        enforce('test')
          // @ts-expect-error - testing dynamic rule
          .asyncTrack('first', true)
          .asyncTrack('second', false)
          .asyncTrack('third', true),
      ).rejects.toThrow();

      expect(executed).toEqual(['first', 'second']);
    });
  });

  describe('Independent chain isolation', () => {
    it('should not share async state between separate enforce calls', async () => {
      const chain1 = enforce(5).isAsyncPositive();
      const chain2 = enforce('hello').isString();

      expect(chain1.then).toBeInstanceOf(Function);
      expect(chain2.then).toBeUndefined();

      await chain1;
    });

    it('should not share promise state between separate enforce calls', async () => {
      const chain1 = enforce(-1).isAsyncPositive();
      const chain2 = enforce(5).isAsyncPositive();

      await expect(chain1).rejects.toThrow();
      await expect(chain2).resolves.toBeUndefined();

      expect(chain1.pass).toBe(false);
      expect(chain2.pass).toBe(true);
    });
  });
});
