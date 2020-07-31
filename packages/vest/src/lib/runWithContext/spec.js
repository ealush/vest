import faker from 'faker';
import Context from '../../core/Context';
import runWithContext from '.';

describe('runWithContext', () => {
  let parent, fn, result;

  beforeEach(() => {
    result = faker.random.word();
    parent = { [faker.random.word()]: faker.lorem.word() };
    fn = jest.fn(() => result);
  });

  it('Should call callback function after creating the context', () => {
    expect(Context.use()).toBeFalsy();
    const fn = jest.fn(() => {
      expect(Context.use()).toMatchObject(parent);
    });

    runWithContext(parent, fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('Should pass context to callback', () => {
    const fn = jest.fn(context => {
      expect(Context.use()).toMatchObject(context);
    });

    runWithContext(parent, fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('Should clear context after running callback', () => {
    const fn = jest.fn(context => {
      expect(Context.use()).toMatchObject(context);
    });

    runWithContext(parent, fn);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(Context.use()).toBeNull();
  });

  it("Should return with the callback function's return value", () => {
    expect(runWithContext(parent, fn)).toBe(result);
  });

  describe('Creates new context', () => {
    // eslint-disable-next-line jest/no-test-callback
    it('Should create a new context with the parent object', done => {
      const parentObject = {
        a: 1,
        b: 2,
      };
      runWithContext(parentObject, ctx => {
        expect(ctx instanceof Context).toBe(true);
        expect(ctx).toMatchObject(parentObject);
        done();
      });
    });
  });

  describe('When an error is thrown inside the callback', () => {
    let cb;

    beforeEach(() => {
      cb = jest.fn(() => {
        throw new Error();
      });
    });

    test('sanity', () => {
      expect(() => cb()).toThrow();
    });

    it('Should catch error', () => {
      expect(() => {
        runWithContext({}, cb);
      }).not.toThrow();

      expect(cb).toHaveBeenCalled();
    });

    it('Should clear the context', () => {
      const context = { [faker.random.word()]: faker.random.word() };
      const done = jest.fn();
      runWithContext(context, () => {
        expect(Context.use()).toMatchObject(context);
        done();
        throw new Error();
      });
      expect(Context.use()).toBeNull();
      expect(done).toHaveBeenCalled();
    });
  });
});
