import { CB } from 'vest-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import wait from 'wait';

import { dummyTest } from '../testUtils/testDummy';
import { TestPromise } from '../testUtils/testPromise';

import { TIsolateTest } from 'IsolateTest';
import { Modes } from 'Modes';
import { TFieldName, TGroupName } from 'SuiteResultTypes';
import { VestTest } from 'VestTest';
import * as vest from 'vest';

type SuiteParams = { skip?: string; skipGroup?: true };

const genSuite = () =>
  vest.create(({ skip, skipGroup }: SuiteParams = {}) => {
    vest.mode(Modes.ALL);
    vest.skip(skip);

    vest.group('group', () => {
      vest.skip(skipGroup);

      dummyTest.failingAsync('field_1', { message: 'field_1_group_message' });
      dummyTest.failingAsync('field_4', { message: 'field_4_group_message' });
    });

    dummyTest.failing('field_1', 'field_message_1');

    dummyTest.failingAsync('field_2', {
      time: 50,
      message: 'rejection_message_1',
    });

    dummyTest.passing('field_2', 'field_message_2');

    dummyTest.passingAsync('field_3', { message: 'field_message_3' });
    dummyTest.failingAsync('field_3', { message: 'field_message_3' });
  });

let suite: vest.Suite<TFieldName, TGroupName, CB>;
let callback_1 = vi.fn(),
  callback_2 = vi.fn(),
  callback_3 = vi.fn(),
  callback_4 = vi.fn(),
  control = vi.fn();

describe('Stateful async tests', () => {
  beforeEach(() => {
    callback_1 = vi.fn();
    callback_2 = vi.fn();
    callback_3 = vi.fn();
    callback_4 = vi.fn();
    control = vi.fn();
    suite = genSuite();
  });

  it('Should only run callbacks for last suite run', () =>
    TestPromise(done => {
      suite.after(callback_1).after('field_3', callback_2).run({});
      expect(callback_1).not.toHaveBeenCalled();
      expect(callback_2).not.toHaveBeenCalled();
      suite.after(callback_3).after('field_3', callback_4).run({});
      expect(callback_3).not.toHaveBeenCalled();
      expect(callback_4).not.toHaveBeenCalled();
      setTimeout(() => {
        expect(callback_1).not.toHaveBeenCalled();
        expect(callback_2).not.toHaveBeenCalled();
        expect(callback_3).not.toHaveBeenCalled();
        expect(callback_4).toHaveBeenCalled();
        control();
      });
      setTimeout(() => {
        expect(callback_1).not.toHaveBeenCalled();
        expect(callback_2).not.toHaveBeenCalled();
        expect(callback_3).toHaveBeenCalledTimes(1);
        expect(control).toHaveBeenCalled();
        done();
      }, 50);
    }));

  it('Merges skipped validations from previous suite', () =>
    TestPromise(done => {
      const res = suite.run({ skipGroup: true, skip: 'field_3' });
      expect(res.testCount).toBe(3);
      expect(res.errorCount).toBe(1);
      expect(res.warnCount).toBe(0);
      expect(res.hasErrors('field_1')).toBe(true);
      expect(res.tests.field_1.errorCount).toBe(1);
      expect(res.hasErrors('field_2')).toBe(false);
      expect(res.hasErrors('field_3')).toBe(false);
      expect(res.hasErrors('field_4')).toBe(false);
      expect(res).toMatchSnapshot();
      setTimeout(() => {
        const res = suite.get();

        expect(res.testCount).toBe(3);
        expect(res.errorCount).toBe(2);
        expect(res.warnCount).toBe(0);
        expect(res.tests.field_1.errorCount).toBe(1);
        expect(res.hasErrors('field_2')).toBe(true);
        expect(res.hasErrors('field_3')).toBe(false);
        expect(res.hasErrors('field_4')).toBe(false);
        expect(res).toMatchSnapshot();

        suite
          .after(() => {
            expect(suite.get().testCount).toBe(7);
            expect(suite.get().errorCount).toBe(5);
            expect(suite.get().warnCount).toBe(0);
            expect(suite.get().tests.field_1.errorCount).toBe(2);
            expect(suite.hasErrors('field_2')).toBe(true);
            expect(suite.hasErrors('field_3')).toBe(true);
            expect(suite.hasErrors('field_4')).toBe(true);
            expect(suite.get()).toMatchSnapshot();
            done();
          })
          .run({ skip: 'field_2' });
      }, 50);
    }));

  it('Should discard of re-tested async tests', async () => {
    const tests: Array<TIsolateTest> = [];
    const control = vi.fn();
    const suite = vest.create(() => {
      tests.push(
        vest.test('field_1', tests.length.toString(), async () => {
          await wait(100);
          throw new Error();
        }),
      );
    });
    suite
      .after(() => {
        control(0);
      })
      .run();
    await wait(5);
    suite
      .after(() => {
        control(1);
      })
      .run();
    await wait(100);
    expect(control).toHaveBeenCalledTimes(1);
    expect(control).toHaveBeenCalledWith(1);

    expect(VestTest.isCanceled(tests[0])).toBe(true);
    expect(VestTest.isFailing(tests[1])).toBe(true);
  });
});
