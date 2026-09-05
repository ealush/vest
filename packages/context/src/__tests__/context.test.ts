import { describe, it, expect, beforeEach } from 'vitest';

import { createContext, CtxApi } from '../context';

type TestContextValue = string | Record<string, string> | undefined;

describe('Context', () => {
  let ctx: CtxApi<TestContextValue>;

  beforeEach(() => {
    ctx = createContext<TestContextValue>();
  });

  describe('Exposed Methods', () => {
    it('should have a use method', () => {
      expect(ctx.use).toBeInstanceOf(Function);
    });

    it('should have a run method', () => {
      expect(ctx.run).toBeInstanceOf(Function);
    });
  });

  describe('use', () => {
    describe('When not inside of an active context', () => {
      describe('When a default value was not provided', () => {
        it('should return undefined', () => {
          expect(ctx.use()).toBeUndefined();
        });
      });

      describe('When a default value was provided', () => {
        beforeEach(() => {
          ctx = createContext<TestContextValue>('i am the default value!');
        });

        it('should return the default value', () => {
          expect(ctx.use()).toBe('i am the default value!');
        });
      });
    });
  });

  describe('useX', () => {
    describe('When not inside of an active context', () => {
      it('Should throw an error', () => {
        expect(() => {
          ctx.useX();
        }).toThrow('Not inside of a running context.');
      });

      it('Should throw an error with a custom message when passed', () => {
        expect(() => {
          ctx.useX('i am the error message!');
        }).toThrow('i am the error message!');
      });

      describe('When a default value was provided', () => {
        beforeEach(() => {
          ctx = createContext<TestContextValue>('i am the default value!');
        });
        it('Should disregard default value', () => {
          expect(() => {
            ctx.useX();
          }).toThrow('Not inside of a running context.');
        });
      });
    });
  });

  describe('run', () => {
    describe('It should set the current context value to the passed value', () => {
      it('should set the current context value to the passed value', () => {
        const value = { some: 'object' };
        ctx.run(value, () => {
          expect(ctx.use()).toBe(value);
        });
      });
    });

    describe('When nesting run calls', () => {
      it("sets each layer's context with its respective value", () => {
        const value_a = { some: 'object' };
        ctx.run(value_a, () => {
          expect(ctx.use()).toBe(value_a);
          const value_b = { another: 'obj' };
          ctx.run(value_b, () => {
            expect(ctx.use()).toBe(value_b);
          });
        });
      });

      it('Restores the previous context value when exiting a context layer', () => {
        const value_a = { some: 'object' };
        ctx.run(value_a, () => {
          const value_b = { another: 'obj' };
          ctx.run(value_b, () => {
            expect(ctx.use()).toBe(value_b);
          });
          expect(ctx.use()).toBe(value_a);
        });
        expect(ctx.use()).toBeUndefined();
      });

      it('restores every context layer when a nested callback throws', () => {
        const outer = { layer: 'outer' };
        const inner = { layer: 'inner' };

        ctx.run(outer, () => {
          expect(() =>
            ctx.run(inner, () => {
              expect(ctx.use()).toBe(inner);
              throw new Error('boom');
            }),
          ).toThrow('boom');
          expect(ctx.use()).toBe(outer);
        });

        expect(ctx.use()).toBeUndefined();
      });
    });

    it('restores the parent context when the callback throws', () => {
      const value = { layer: 'throwing' };

      expect(() =>
        ctx.run(value, () => {
          expect(ctx.use()).toBe(value);
          throw new Error('boom');
        }),
      ).toThrow('boom');

      expect(ctx.use()).toBeUndefined();
    });
  });
});
