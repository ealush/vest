import _ from 'lodash';

import { dummyTest } from '../../../../../testUtils/testDummy';

import { group } from 'hooks';
import * as vest from 'vest';

const FIELD_NAME_1 = 'field_1';
const FIELD_NAME_2 = 'field_2';
const GROUP_NAME_1 = 'group_1';
const GROUP_NAME_2 = 'group_2';

describe('When previous state exists', () => {
  describe('When no currently skipped fields or groups', () => {
    describe('When skipped field exists in previous state', () => {
      let validate, prevRes, res;

      const validation = () =>
        vest.create((skip?: string | string[]) => {
          vest.skip(skip);
          dummyTest.failingWarning(FIELD_NAME_1, 'warning message');

          group(GROUP_NAME_1, () => {
            dummyTest.failing(FIELD_NAME_2, 'error message');
          });
        });
      beforeEach(() => {
        validate = validation();
        prevRes = _.cloneDeep(validate());
      });

      describe('Warning field', () => {
        it('Should copy prev field state over', () => {
          res = validate(/* skip */ FIELD_NAME_1);

          expect(res.tests[FIELD_NAME_1]).toEqual(prevRes.tests[FIELD_NAME_1]);
        });
      });
      describe('Error field', () => {
        it('Should copy prev field state over', () => {
          res = validate(/* skip */ FIELD_NAME_2);

          expect(res.tests[FIELD_NAME_2]).toEqual(prevRes.tests[FIELD_NAME_2]);
        });
      });
    });
  });

  describe('When skipped group exists in previous state', () => {
    let res, validate;

    const validation = () =>
      vest.create(skip => {
        vest.skip.group(skip);

        dummyTest.failing('f1', 'f1_msg');
        dummyTest.failing('f2', 'f2_msg');
        dummyTest.failing('f3', 'f3_msg');
        dummyTest.failingAsync('f3', { message: 'f3_async_msg' });

        group(GROUP_NAME_1, () => {
          dummyTest.failing('f1', 'f1_group_1_msg');
          dummyTest.failingWarning('f2', 'f2_group_1_msg');
          dummyTest.failing('f3', 'f3_group_1_msg');
          dummyTest.failingAsync('f3', {
            message: 'f3_async_group_1_msg',
          });
          dummyTest.failing('f4', 'f4_group_1_msg');
          dummyTest.passing('f5', 'f5_group_1_msg');
        });

        group(GROUP_NAME_2, () => {
          dummyTest.failing('f1', 'f1_group_2_msg');
          dummyTest.failingAsync('f3', {
            message: 'f3_async_group_2_msg',
          });
          dummyTest.failing('f4', 'f4_group_2_msg');
          dummyTest.failing('f5', 'f5_group_2_msg');
          dummyTest.failingWarning('f6', 'f6_group_2_msg');
          dummyTest.passing('f7', 'f7_group_2_msg');
        });
      });

    beforeEach(() => {
      validate = validation();
    });

    test('sanity: skipped tests are not in initial state', () =>
      new Promise<void>(done => {
        res = _.cloneDeep(validate([GROUP_NAME_1, GROUP_NAME_2]));
        expect(res.tests).toHaveProperty('f1');
        expect(res.tests).toHaveProperty('f2');
        expect(res.tests).toHaveProperty('f3');
        expect(res.errorCount).toBe(3);
        expect(res.warnCount).toBe(0);
        expect(res.testCount).toBe(4);
        expect(res.tests.f1.errorCount).toBe(1);
        expect(res.tests.f1.warnCount).toBe(0);
        expect(res.tests.f1.errorCount).toBe(1);
        expect(res.tests.f2.warnCount).toBe(0);
        expect(res.tests.f3.errorCount).toBe(1);

        // Handling of skipped fields
        expect(res.tests.f4.testCount).toBe(0);
        expect(res.tests.f4.errorCount).toBe(0);
        expect(res.tests.f4.warnCount).toBe(0);
        expect(res.tests.f5.testCount).toBe(0);
        expect(res.tests.f5.errorCount).toBe(0);
        expect(res.tests.f5.warnCount).toBe(0);
        expect(res.tests.f6.testCount).toBe(0);
        expect(res.tests.f6.errorCount).toBe(0);
        expect(res.tests.f6.warnCount).toBe(0);
        expect(res.tests.f7.testCount).toBe(0);
        expect(res.tests.f7.errorCount).toBe(0);
        expect(res.tests.f7.warnCount).toBe(0);
        expect(res).toMatchSnapshot();
        setTimeout(() => {
          res = validate.get();
          expect(res.errorCount).toBe(4);
          expect(res.tests.f3.errorCount).toBe(2);
          done();
        });
      }));

    test('Skipping after initial run: Should copy group state over', () =>
      new Promise<void>(done => {
        // skipping group 2
        res = _.cloneDeep(validate(GROUP_NAME_2));
        expect(res.errorCount).toBe(6);
        expect(res.warnCount).toBe(1);
        expect(res.testCount).toBe(10);
        expect(res.tests.f1.errorCount).toBe(2);
        expect(res.tests.f1.warnCount).toBe(0);
        expect(res.tests.f2.errorCount).toBe(1);
        expect(res.tests.f2.warnCount).toBe(1);
        expect(res.tests.f3.errorCount).toBe(2);
        expect(res.tests.f4.errorCount).toBe(1);
        expect(res.tests.f4.warnCount).toBe(0);
        expect(res.tests.f5.errorCount).toBe(0);
        expect(res.tests.f5.warnCount).toBe(0);
        expect(res).toMatchSnapshot();
        setTimeout(() => {
          res = validate.get();
          // both outer and inner async
          expect(res.tests.f3.errorCount).toBe(4);
          done();
        });
      }));

    test('Skipping after second run: Should copy group state over', () =>
      new Promise<void>(done => {
        _.cloneDeep(validate(GROUP_NAME_2));

        res = _.cloneDeep(validate(GROUP_NAME_1));

        expect(res.errorCount).toBe(9);
        expect(res.warnCount).toBe(2);
        expect(res.testCount).toBe(16);

        expect(res.tests.f2.errorCount).toBe(1);
        expect(res.tests.f2.warnCount).toBe(1);

        expect(res.tests.f3.errorCount).toBe(2);
        expect(res.tests.f3.warnCount).toBe(0);

        expect(res.tests.f4.errorCount).toBe(2);
        expect(res.tests.f4.warnCount).toBe(0);

        expect(res.tests.f5.errorCount).toBe(1);
        expect(res.tests.f5.warnCount).toBe(0);

        expect(res.tests.f6.errorCount).toBe(0);
        expect(res.tests.f6.warnCount).toBe(1);

        expect(res.tests.f7.errorCount).toBe(0);
        expect(res.tests.f7.warnCount).toBe(0);
        expect(res).toMatchSnapshot();

        setTimeout(() => {
          res = validate.get();
          expect(res.tests.f3.errorCount).toBe(5);
          expect(res).toMatchSnapshot();
          done();
        });
      }));
  });
});
