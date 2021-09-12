import wait from 'wait';

import { dummyTest } from '../../testUtils/testDummy';

import * as vest from 'vest';

const suite = ({ create, ...vest }) =>
  create(({ skip, skipGroup }) => {
    vest.skip(skip);
    vest.skip.group(skipGroup);

    vest.group('group', () => {
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

let validate, callback_1, callback_2, callback_3, callback_4, control;

describe('Stateful async tests', () => {
  beforeEach(() => {
    callback_1 = jest.fn();
    callback_2 = jest.fn();
    callback_3 = jest.fn();
    callback_4 = jest.fn();
    control = jest.fn();
    validate = suite(vest);
  });

  it('Should only run callbacks for last suite run', () =>
    new Promise<void>(done => {
      validate(vest).done(callback_1).done('field_3', callback_2);
      expect(callback_1).not.toHaveBeenCalled();
      expect(callback_2).not.toHaveBeenCalled();
      validate(vest).done(callback_3).done('field_3', callback_4);
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
    new Promise<void>(done => {
      const res = validate({ skipGroup: 'group', skip: 'field_3' });
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
        const res = validate.get();

        expect(res.testCount).toBe(3);
        expect(res.errorCount).toBe(2);
        expect(res.warnCount).toBe(0);
        expect(res.tests.field_1.errorCount).toBe(1);
        expect(res.hasErrors('field_2')).toBe(true);
        expect(res.hasErrors('field_3')).toBe(false);
        expect(res.hasErrors('field_4')).toBe(false);
        expect(res).toMatchSnapshot();

        validate({ skip: 'field_2' }).done(res => {
          expect(res.testCount).toBe(7);
          expect(res.errorCount).toBe(5);
          expect(res.warnCount).toBe(0);
          expect(res.tests.field_1.errorCount).toBe(2);
          expect(res.hasErrors('field_2')).toBe(true);
          expect(res.hasErrors('field_3')).toBe(true);
          expect(res.hasErrors('field_4')).toBe(true);
          expect(res).toMatchSnapshot();
          done();
        });
      }, 50);
    }));

  it('Should discard of re-tested async tests', async () => {
    const tests = [];
    const control = jest.fn();
    const suite = vest.create(() => {
      tests.push(
        vest.test('field_1', async () => {
          await wait(100);
          throw new Error();
        })
      );
    });
    suite().done(() => {
      control(0);
    });
    await wait(5);
    suite().done(() => {
      control(1);
    });
    await wait(100);
    expect(control).toHaveBeenCalledTimes(1);
    expect(control).toHaveBeenCalledWith(1);

    expect(tests[0].status).toBe('CANCELED');
    expect(tests[1].status).toBe('FAILED');
  });
});
