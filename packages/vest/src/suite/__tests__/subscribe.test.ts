import { enforce } from 'n4s';
import { describe, it, expect, vi } from 'vitest';
import wait from 'wait';

import { SuiteSerializer } from '../../exports/SuiteSerializer';
import * as vest from '../../vest';

describe('suite.subscribe', () => {
  it('should be a function', () => {
    const suite = vest.create(() => {});

    expect(typeof suite.subscribe).toBe('function');
  });

  it('should call the callback on suite updates', async () => {
    const cb = vi.fn(() => {
      dumps.push(SuiteSerializer.serialize(suite));
    });
    let callCount = cb.mock.calls.length;

    const suite = vest.create(() => {
      expect(cb.mock.calls.length).toBeGreaterThan(callCount);
      callCount = cb.mock.calls.length;
      vest.test('field', () => {});
      expect(cb.mock.calls.length).toBeGreaterThan(callCount);
      callCount = cb.mock.calls.length;
      vest.test('field2', () => {});
      expect(cb.mock.calls.length).toBeGreaterThan(callCount);
      callCount = cb.mock.calls.length;
      vest.test('field3', () => false);
      expect(cb.mock.calls.length).toBeGreaterThan(callCount);
      callCount = cb.mock.calls.length;
      vest.test('field4', async () => Promise.reject<undefined>());
      expect(cb.mock.calls.length).toBeGreaterThan(callCount);
      callCount = cb.mock.calls.length;
    });

    const dumps: string[] = [];

    suite.subscribe(cb);
    expect(cb.mock.calls).toHaveLength(0);
    suite.run();
    expect(cb.mock.calls.length).toBeGreaterThan(callCount);
    callCount = cb.mock.calls.length;

    // expect some of the dumps to be different
    expect(dumps.some((dump, i) => dump !== dumps[i - 1])).toBe(true);

    await wait(10);

    // now also after resolving the async test
    expect(cb.mock.calls.length).toBeGreaterThan(callCount);
  });

  describe('Subscribe with event name', () => {
    it('should only call the callback on the specified event', () => {
      const cbAllDone = vi.fn();
      const testDone = vi.fn();
      const testStarted = vi.fn();
      const suiteStart = vi.fn();

      const suite = vest.create(() => {
        vest.test('field1', () => false);
        vest.test('field2', () => true);
        vest.test('field3', () => false);
      });

      suite.subscribe('ALL_RUNNING_TESTS_FINISHED', cbAllDone);
      suite.subscribe('TEST_COMPLETED', testDone);
      suite.subscribe('TEST_RUN_STARTED', testStarted);
      suite.subscribe('SUITE_RUN_STARTED', suiteStart);

      suite.run();
      expect(cbAllDone).toHaveBeenCalledTimes(1);
      expect(testDone).toHaveBeenCalledTimes(3);
      expect(testStarted).toHaveBeenCalledTimes(3);
      expect(suiteStart).toHaveBeenCalledTimes(1);
    });
  });

  describe('unsubscribe', () => {
    it('should unsubscribe future events', () => {
      const cb = vi.fn();
      const suite = vest.create(() => {
        vest.test('field', () => {});
      });

      const unsubscribe = suite.subscribe(cb);
      suite.run();
      let callCount = cb.mock.calls.length;
      enforce(callCount).greaterThan(1);
      suite.run();
      enforce(cb.mock.calls.length).greaterThan(callCount);
      callCount = cb.mock.calls.length;
      unsubscribe();
      suite.run();
      enforce(cb.mock.calls.length).equals(callCount);
    });
  });
});

describe('#1157 (@codrin-iftimie) suite.get() in subscribe() skips the first validation of the field', () => {
  it('should fail for the first field in both runs', () => {
    const suite = vest.create(data => {
      vest.test('a', 'Enter a value', () => {
        enforce(data.a).isNotEmpty();
      });

      vest.test('a', 'Enter a value 2', () => {
        enforce(data.a).isNotEmpty();
      });
    });

    suite.subscribe(() => {
      suite.get();
    });

    suite.run({ a: '' });
    expect(suite.getErrors('a')).toEqual(['Enter a value']);
    suite.run({ a: '' });
    expect(suite.getErrors('a')).toEqual(['Enter a value']);
  });
});
