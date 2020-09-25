import { dummyTest } from '../../../testUtils/testDummy';
import produce from '../../core/produce';
import create from '../../core/suite/create';
import * as suiteState from '../../core/suite/suiteState';
import get from '.';

const suiteId = 'form-name';

const validation = () =>
  create(suiteId, () => {
    dummyTest.passing('f1', 'msg');
    dummyTest.failing('f2', 'msg');
    dummyTest.failingWarning('f2', 'msg');
  });

describe('hook: vest.get()', () => {
  describe('When called without suite id', () => {
    it('Should throw an error', () => {
      expect(get).toThrow(
        '[Vest]: `get` hook was called without a suite name.'
      );
    });
  });

  describe('When suite id does not exist', () => {
    it('Should throw an error', () => {
      expect(() => get('I do not exist')).toThrow();
    });
  });

  describe('When suite exists', () => {
    let validate;

    beforeEach(() => {
      validate = validation();
    });

    afterEach(() => {
      suiteState.remove(suiteId);
    });

    it('Should return produced result', () => {
      validate();
      expect(produce(suiteState.getState(suiteId), { draft: true })).toBe(
        get(suiteId)
      );
      expect(get(suiteId)).toMatchSnapshot();
    });
  });
});
