import { dummyTest } from '../../../testUtils/testDummy';
import createSuite from '../../core/createSuite';
import produce from '../../core/produce';
import getSuiteState from '../../core/state/getSuiteState';
import reset from '../../core/state/reset';
import get from '.';

const suiteId = 'form-name';

const validation = () =>
  createSuite(suiteId, () => {
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
      reset(suiteId);
    });

    it('Should return produced result', () => {
      validate();
      expect(produce(getSuiteState(suiteId), { draft: true })).isDeepCopyOf(
        get(suiteId)
      );
      expect(get(suiteId)).toMatchSnapshot();
    });
  });
});
