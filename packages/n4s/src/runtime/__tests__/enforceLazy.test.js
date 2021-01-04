import enforce from 'enforce';
import { RUN_RULE } from 'enforceKeywords';
import rules from 'rules';

const allRules = Object.keys(rules());

describe('lazy enforcements', () => {
  it('Should expose all rules on top of the enforce function', () => {
    allRules.forEach(rule => expect(typeof enforce[rule]).toBe('function'));

    expect(enforce.isAbc).toBeUndefined();
    enforce.extend({ isAbc: v => v === 'abc' });
    expect(typeof enforce.isAbc).toBe('function');
  });

  it('Should retain all lazy functions in an array as a property of the returned object', () => {
    expect(enforce.isEmpty()[RUN_RULE]).toBeInstanceOf(Function);
    expect(enforce.isEmpty().isArray()[RUN_RULE]).toBeInstanceOf(Function);
  });

  it('Should run all chained rules with the test function', () => {
    const r1 = jest.fn(() => true);
    const r2 = jest.fn(() => true);
    const r3 = jest.fn(() => true);
    enforce.extend({
      r1,
      r2,
      r3,
    });
    enforce.r1().r2().r3()[RUN_RULE]('some_value');
    expect(r1).toHaveBeenCalledWith('some_value');
    expect(r2).toHaveBeenCalledWith('some_value');
    expect(r3).toHaveBeenCalledWith('some_value');
  });

  it('Should produce correct result when run', () => {
    expect(enforce.isEmpty()).toPassWith([]);
    expect(enforce.isNumeric()).toPassWith('555');
    expect(enforce.greaterThan(10)).toPassWith(20);
    expect(enforce.isEmpty()).not.toPassWith([1, 2, 3]);
    expect(enforce.greaterThan(20)).not.toPassWith(10);
    expect(enforce.greaterThan(10)).not.toPassWith(4);
    const fn = jest.fn(() => true);
    enforce.extend({
      getArgs: fn,
    });
    enforce.getArgs(2, 3, 4, 5, 6, 7)[RUN_RULE](1);
    // // One should be first
    expect(fn).toHaveBeenCalledWith(1, 2, 3, 4, 5, 6, 7);
  });

  describe('When an error is thrown inside a rule', () => {
    beforeAll(() => {
      enforce.extend({
        throws: () => {
          throw new Error();
        },
      });
    });

    it('Should catch errors', () => {
      enforce.throws().run();
      enforce.shape({ user: enforce.throws() }).run({ user: 'example' });
      enforce.throws().test();
      enforce.shape({ user: enforce.throws() }).test({ user: 'example' });
    });
  });
});
