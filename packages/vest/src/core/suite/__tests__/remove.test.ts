import * as vest from 'vest';
import wait from 'wait';

import { dummyTest } from '../../../../testUtils/testDummy';

describe('suite.remove', () => {
  it('Should remove field from validation result', async () => {
    const suite = vest.create(() => {
      dummyTest.failing('field1');
      dummyTest.failing('field1');
      dummyTest.failingAsync('field1', { time: 100 });
      dummyTest.failing('field2');
      dummyTest.passing('field2');
      dummyTest.passing('field1');
    });
    suite();
    expect(suite.get().testCount).toBe(6);
    expect(suite.get().tests.field1.testCount).toBe(4);
    expect(suite.get().tests.field2.testCount).toBe(2);
    suite.remove('field1');
    expect(suite.get().testCount).toBe(2);
    expect(suite.get().tests.field1).toBeUndefined();
    await wait(150);
    expect(suite.get().testCount).toBe(2);
    expect(suite.get().tests.field1).toBeUndefined();
  });

  it('Should clear the cache when removing a field', () => {
    const suite = vest.create(() => {
      dummyTest.failing('field1');
      dummyTest.failing('field2');
    });
    suite();
    const res = suite.get();
    suite.remove('field2');
    expect(suite.get()).not.toBe(res);
  });

  it('Should return silently when removing a field that does not exist', () => {
    const suite = vest.create(() => {
      dummyTest.failing('field1');
      dummyTest.passing('field2');
    });
    suite();
    const res = suite.get();
    suite.remove('field3');
    expect(suite.get()).toBe(res);
  });
});
