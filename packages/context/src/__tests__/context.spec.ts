import { createCascade, CtxCascadeReturn } from 'context';

describe('Context', () => {
  let ctx: CtxCascadeReturn<any>;

  beforeEach(() => {
    ctx = createCascade();
  });
  describe('createCascade', () => {
    it('Should return a new context on each run', () => {
      expect(createCascade()).not.toBe(createCascade());
    });

    it('Should return all methods', () => {
      expect(createCascade()).toMatchSnapshot();
    });
  });

  describe('context.run', () => {
    it('Should create a new context instance', () => {
      const top = ctx.use();

      ctx.run({}, () => {
        expect(ctx.use()).not.toBe(top);
      });
    });

    it('Should pass current context as second argument', () => {
      ctx.run({}, context => {
        expect(ctx.use()).toBe(context);
      });
    });

    it('Adds provided `ctxref` properties to current context level', () => {
      ctx.run(
        {
          id: 55,
          user: 'boomsa',
        },
        context => {
          expect(context.id).toBe(55);
          expect(context.user).toBe('boomsa');
        }
      );
    });

    it('Returns undefined when property is not in context', () => {
      ctx.run(
        {
          id: 55,
        },
        context => {
          expect(context.id).toBe(55);
          expect(context.user).toBeUndefined();
        }
      );
    });

    it('Should clear context after callback run', () => {
      expect(ctx.use()).toBeUndefined();
      ctx.run({ a: 1 }, () => {
        expect(ctx.use()).toMatchSnapshot();
        ctx.run({ b: 2 }, () => {
          expect(ctx.use()).toMatchSnapshot();
        });
      });
      expect(ctx.use()).toBeUndefined();
    });

    describe('Context nesting', () => {
      it('Should refer to closest defined value', () => {
        ctx.run(
          {
            id: 99,
            name: 'watermelonbunny',
          },
          context => {
            expect(context.id).toBe(99);
            expect(context.name).toBe('watermelonbunny');

            ctx.run(
              {
                name: 'Emanuelle',
                color: 'blue',
              },
              context => {
                expect(context.id).toBe(99);
                expect(context.name).toBe('Emanuelle');
                expect(context.color).toBe('blue');

                ctx.run({}, context => {
                  expect(context.id).toBe(99);
                  expect(context.name).toBe('Emanuelle');
                  expect(context.color).toBe('blue');
                });
              }
            );
          }
        );
      });

      it('Should return previous context value after nested context run', () => {
        ctx.run(
          {
            id: 99,
            name: 'watermelonbunny',
          },
          context => {
            ctx.run(
              {
                name: 'Emanuelle',
                color: 'blue',
              },
              context => {
                ctx.run({}, () => null);
                expect(context.id).toBe(99);
                expect(context.name).toBe('Emanuelle');
                expect(context.color).toBe('blue');
                expect(context).toMatchInlineSnapshot(`
                  Object {
                    "color": "blue",
                    "id": 99,
                    "name": "Emanuelle",
                  }
                `);
              }
            );
            expect(context.id).toBe(99);
            expect(context.name).toBe('watermelonbunny');
            expect(context).toMatchInlineSnapshot(`
              Object {
                "id": 99,
                "name": "watermelonbunny",
              }
            `);
          }
        );
      });
    });
  });

  describe('context.bind', () => {
    it('Returns a function', () => {
      expect(typeof ctx.bind({}, jest.fn())).toBe('function');
    });

    it('Wraps the function with context', () => {
      return new Promise<void>(done => {
        const fn = () => {
          expect(ctx.use()).toMatchInlineSnapshot(`
            Object {
              "value": 55,
            }
          `);
          done(); // this makes sure the function actually runs
        };
        const bound = ctx.bind({ value: 55 }, fn);
        bound();
      });
    });

    it('Passes runtime arguments to bound function', () => {
      const fn = jest.fn();
      const args = Array.from({ length: 100 }, (_, i) => `${i}`); // 1-100
      ctx.bind({}, fn)(...args);

      expect(fn).toHaveBeenCalledWith(...args);
    });

    it('Maintains normal context behavior when runs within context.run', () => {
      return new Promise<void>(done => {
        const fn = () => {
          expect(ctx.use()).toMatchObject({ value: 200, value2: 300 });
          expect(ctx.use()).toMatchInlineSnapshot(`
            Object {
              "value": 200,
              "value2": 300,
            }
          `);
          done();
        };

        const bound = ctx.bind({ value2: 300 }, fn);
        ctx.run({ value: 200, value2: 200 }, bound);
      });
    });
  });

  describe('context.use', () => {
    describe('When in an active context', () => {
      it('Should return a cloned ctxRef object', () => {
        const ctxRef = { a: 1, b: 2 };

        ctx.run(ctxRef, () => {
          expect(ctx.use()).toEqual(ctxRef);
        });
      });

      it('Should return a frozen context object', () => {
        const ctxRef = { a: 1, b: 2 };

        ctx.run(ctxRef, () => {
          expect(Object.isFrozen(ctx.use())).toBe(true);
        });
      });

      describe('When before running the context', () => {
        it('Should return undefined', () => {
          expect(ctx.use()).toBeUndefined();
        });
      });

      describe('When after closing the context', () => {
        it('Should return undefined', () => {
          ctx.run({}, () => {});
          expect(ctx.use()).toBeUndefined();
        });
      });
    });
  });

  describe('context.useX', () => {
    describe('When in an active context', () => {
      it('Should return a cloned ctxRef object', () => {
        const ctxRef = { a: 1, b: 2 };

        ctx.run(ctxRef, () => {
          expect(ctx.useX()).toEqual(ctxRef);
        });
      });

      it('Should return a frozen context object', () => {
        const ctxRef = { a: 1, b: 2 };

        ctx.run(ctxRef, () => {
          expect(Object.isFrozen(ctx.useX())).toBe(true);
        });
      });

      describe('When before running the context', () => {
        it('Should throw error', () => {
          expect(() => ctx.useX()).toThrow(
            'Context was used after it was closed'
          );
        });

        it('Should allow a custom context message', () => {
          expect(() => ctx.useX('Custom Failure Message')).toThrow(
            'Custom Failure Message'
          );
        });
      });

      describe('When after closing the context', () => {
        beforeEach(() => {
          ctx.run({}, () => {});
        });

        it('Should return undefined', () => {
          expect(() => ctx.useX()).toThrow(
            'Context was used after it was closed'
          );
        });

        it('Should allow a custom context message', () => {
          expect(() => ctx.useX('Custom Failure Message')).toThrow(
            'Custom Failure Message'
          );
        });
      });
    });
  });

  describe('init argument', () => {
    it('Should run init function on every context.run', () => {
      const init = jest.fn();

      const ctx = createCascade(init);

      expect(init).not.toHaveBeenCalled();

      ctx.run({}, () => {
        expect(init).toHaveBeenCalledTimes(1);
        ctx.run({}, () => {
          expect(init).toHaveBeenCalledTimes(2);
          ctx.run({}, () => {
            expect(init).toHaveBeenCalledTimes(3);
          });
        });
      });
      expect(init).toHaveBeenCalledTimes(3);

      ctx.run({}, () => {
        expect(init).toHaveBeenCalledTimes(4);
      });
      expect(init).toHaveBeenCalledTimes(4);
    });

    it('Should accept ctxRef as first argument', () => {
      const init = jest.fn();

      const ctx = createCascade(init);
      const ref1 = { a: 1, b: 2 };
      const ref2 = { a: 2, b: 3 };

      ctx.run(ref1, () => {
        ctx.run(ref2, () => null);
      });
      expect(init.mock.calls[0][0]).toBe(ref1);
      expect(init.mock.calls[1][0]).toBe(ref2);
    });

    it('Should accept parentContext as second argument', () => {
      const init = jest.fn();

      const ctx = createCascade(init);
      let p1;
      ctx.run({}, context => {
        p1 = context;
        ctx.run({}, () => null);
      });
      expect(init.mock.calls[0][1]).toBeUndefined();
      expect(init.mock.calls[1][1]).toBe(p1);
    });

    it('When not nullish, should use init value as ctxRef', () => {
      const ctx = createCascade<{ override?: boolean; value?: string }>(() => ({
        override: true,
      }));
      ctx.run({ value: 'x' }, context => {
        expect(context.override).toBe(true);
        expect(context.value).toBeUndefined();
      });
    });

    it('When nullish, should default to ctxRef', () => {
      const ctx = createCascade(() => null);

      ctx.run({ value: 'x' }, context => {
        expect(context.value).toBe('x');
      });
    });
  });
});
