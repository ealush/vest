import { createCascade, createContext, CtxCascadeApi, CtxApi } from 'context';

describe('Context', () => {
  let ctx: CtxApi<any>;

  beforeEach(() => {
    ctx = createContext();
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
          ctx = createContext('i am the default value!');
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
        }).toThrow('Context was used after it was closed');
      });

      it('Should throw an error with a custom message when passed', () => {
        expect(() => {
          ctx.useX('i am the error message!');
        }).toThrow('i am the error message!');
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
    });
  });
});

describe('Cascading Context', () => {
  let ctx: CtxCascadeApi<any>;

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

    it('Should pass no arguments to the callback', () => {
      ctx.run({}, (...args) => {
        expect(args).toHaveLength(0);
      });
    });

    it('Adds provided `ctxref` properties to current context level', () => {
      ctx.run(
        {
          id: 55,
          user: 'boomsa',
        },
        () => {
          expect(ctx.use().id).toBe(55);
          expect(ctx.use().user).toBe('boomsa');
        }
      );
    });

    it('Returns undefined when property is not in context', () => {
      ctx.run(
        {
          id: 55,
        },
        () => {
          expect(ctx.use().id).toBe(55);
          expect(ctx.use().user).toBeUndefined();
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
          () => {
            expect(ctx.use().id).toBe(99);
            expect(ctx.use().name).toBe('watermelonbunny');

            ctx.run(
              {
                name: 'Emanuelle',
                color: 'blue',
              },
              () => {
                expect(ctx.use().id).toBe(99);
                expect(ctx.use().name).toBe('Emanuelle');
                expect(ctx.use().color).toBe('blue');

                ctx.run({}, () => {
                  expect(ctx.use().id).toBe(99);
                  expect(ctx.use().name).toBe('Emanuelle');
                  expect(ctx.use().color).toBe('blue');
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
          () => {
            ctx.run(
              {
                name: 'Emanuelle',
                color: 'blue',
              },
              () => {
                ctx.run({}, () => null);
                expect(ctx.use().id).toBe(99);
                expect(ctx.use().name).toBe('Emanuelle');
                expect(ctx.use().color).toBe('blue');
                expect(ctx.use()).toMatchInlineSnapshot(`
                  Object {
                    "color": "blue",
                    "id": 99,
                    "name": "Emanuelle",
                  }
                `);
              }
            );
            expect(ctx.use().id).toBe(99);
            expect(ctx.use().name).toBe('watermelonbunny');
            expect(ctx.use()).toMatchInlineSnapshot(`
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
      ctx.run({}, () => {
        p1 = ctx.use();
        ctx.run({}, () => null);
      });
      expect(init.mock.calls[0][1]).toBeUndefined();
      expect(init.mock.calls[1][1]).toBe(p1);
    });

    it('When not nullish, should use init value as ctxRef', () => {
      const ctx = createCascade<{ override?: boolean; value?: string }>(() => ({
        override: true,
      }));
      ctx.run({ value: 'x' }, () => {
        expect(ctx.useX().override).toBe(true);
        expect(ctx.useX().value).toBeUndefined();
      });
    });

    it('When nullish, should default to ctxRef', () => {
      const ctx = createCascade(() => null);

      ctx.run({ value: 'x' }, () => {
        expect(ctx.useX().value).toBe('x');
      });
    });
  });
});
