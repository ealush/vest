import faker from 'faker';
import enforce from 'n4s';
import collector from '../../../testUtils/collector';
import resetState from '../../../testUtils/resetState';
import runSpec from '../../../testUtils/runSpec';
import { dummyTest } from '../../../testUtils/testDummy';
import singleton from '../../lib/singleton';
import group from '.';

let suiteName = 'suite_name';
let groupName = 'group_name_1';

runSpec(vest => {
  const topLevelTestObjects = {};
  const groupTestObjects = {};
  const validation = () =>
    vest.create(suiteName, ({ only, skip } = {}) => {
      vest.only(only);
      vest.skip(skip);

      topLevelTestObjects['field_1'] = dummyTest.failing('field_1');
      topLevelTestObjects['field_1'] = dummyTest.failing('field_1');
      topLevelTestObjects['field_2'] = dummyTest.passing('field_2');
      topLevelTestObjects['field_3'] = dummyTest.failingWarning('field_3');
      topLevelTestObjects['field_4'] = dummyTest.passingWarning('field_4');
      topLevelTestObjects['field_5'] = dummyTest.failing('field_5');

      group(groupName, () => {
        groupTestObjects['field_1'] = dummyTest.failing('field_1');
        groupTestObjects['field_2'] = dummyTest.passing('field_2');
        groupTestObjects['field_3'] = dummyTest.failingWarning('field_3');
        groupTestObjects['field_4'] = dummyTest.passingWarning('field_4');
        groupTestObjects['field_6'] = dummyTest.failing('field_6');
      });
    });
  describe('group: exclusion', () => {
    let res, validate;

    beforeEach(() => {
      suiteName = faker.random.word();
      groupName = faker.random.word();
      validate = validation();
    });

    afterEach(() => {
      resetState();
    });

    describe('When skipped', () => {
      beforeEach(() => {
        res = validate({ skip: groupName });
      });
      it('produce result object without group', () => {
        expect(res.groups[groupName]).toBeUndefined();
      });

      it('Should skip tests within group', () => {
        Object.values(groupTestObjects).forEach(testObject => {
          expect(testObject.testFn).not.toHaveBeenCalled();
        });
      });

      it('Should run tests outside of group', () => {
        Object.values(topLevelTestObjects).forEach(testObject => {
          expect(testObject.testFn).toHaveBeenCalled();
        });
      });
    });

    describe('When `only`ed', () => {
      beforeEach(() => {
        res = validate({ only: groupName });
      });
      it('produce result object with group', () => {
        expect(res.groups).toHaveProperty(groupName);
      });

      it('produce correct result object', () => {
        expect(res.tests['field_1'].errorCount).toBe(1);
        expect(res.tests['field_1'].warnCount).toBe(0);
        expect(res.tests['field_2'].errorCount).toBe(0);
        expect(res.tests['field_2'].warnCount).toBe(0);
        expect(res.tests['field_3'].errorCount).toBe(0);
        expect(res.tests['field_3'].warnCount).toBe(1);
        expect(res.tests['field_4'].errorCount).toBe(0);
        expect(res.tests['field_4'].warnCount).toBe(0);
        expect(res.tests['field_5']).toBeUndefined();
        expect(res.tests['field_5']).toBeUndefined();
        expect(res.tests['field_6'].errorCount).toBe(1);
        expect(res.tests['field_6'].warnCount).toBe(0);
      });

      it('Should run tests within group', () => {
        Object.values(groupTestObjects).forEach(testObject => {
          expect(testObject.testFn).toHaveBeenCalled();
        });
      });

      it('Should skip tests outside of group', () => {
        Object.values(topLevelTestObjects).forEach(testObject => {
          expect(testObject.testFn).not.toHaveBeenCalled();
        });
      });
    });

    describe('When skipped field inside `only`ed group', () => {
      beforeEach(() => {
        res = validate({ skip: 'field_1', only: groupName });
      });
      it('produce result object with group', () => {
        expect(res.groups).toHaveProperty(groupName);
      });

      it('Should run all tests within group but skipped test', () => {
        Object.values(groupTestObjects)
          // all but skipped test
          .filter(({ fieldName }) => fieldName !== 'field_1')
          .forEach(testObject => {
            expect(testObject.testFn).toHaveBeenCalled();
          });

        Object.values(groupTestObjects)
          // only skipped test
          .filter(({ fieldName }) => fieldName === 'field_1')
          .forEach(testObject => {
            expect(testObject.testFn).not.toHaveBeenCalled();
          });
      });
      it('Should skip all tests outside group', () => {
        Object.values(topLevelTestObjects).forEach(testObject => {
          expect(testObject.testFn).not.toHaveBeenCalled();
        });
      });
    });
  });
});
runSpec(vest => {
  const validation = () =>
    vest.create(suiteName, () => {
      dummyTest.failing('field_1');
      dummyTest.failing('field_1');
      dummyTest.passing('field_2');
      dummyTest.failingWarning('field_3');
      dummyTest.passingWarning('field_4');
      dummyTest.failing('field_5');

      group(groupName, () => {
        dummyTest.failing('field_1');
        dummyTest.passing('field_2');
        dummyTest.failingWarning('field_3');
        dummyTest.passingWarning('field_4');
        dummyTest.failing('field_6');
      });
    });
  describe('group: base case', () => {
    let res;
    beforeEach(() => {
      suiteName = faker.random.word();
      groupName = faker.random.word();
      const validate = validation();
      res = validate();
    });

    afterEach(() => {
      resetState();
    });

    it('Should contain all tests in tests object', () => {
      expect(res.tests).toHaveProperty('field_1');
      expect(res.tests).toHaveProperty('field_2');
      expect(res.tests).toHaveProperty('field_3');
      expect(res.tests).toHaveProperty('field_4');
      expect(res.tests).toHaveProperty('field_5');
      expect(res.tests).toHaveProperty('field_6');
    });

    it('Should contain only group test in group object', () => {
      expect(res.groups[groupName]).toHaveProperty('field_1');
      expect(res.groups[groupName]).toHaveProperty('field_2');
      expect(res.groups[groupName]).toHaveProperty('field_3');
      expect(res.groups[groupName]).toHaveProperty('field_4');
      expect(res.groups[groupName]).not.toHaveProperty('field_5');
      expect(res.groups[groupName]).toHaveProperty('field_6');
    });

    it('Should have all group errors inside test object', () => {
      expect(res.tests['field_1'].errors).toEqual(
        expect.arrayContaining(res.groups[groupName]['field_1'].errors)
      );

      // This one is equal because it has no errors and no warnings - so both represent the base object
      expect(res.tests['field_2']).toEqual(res.groups[groupName]['field_2']);

      expect(res.tests['field_3'].warnings).toEqual(
        expect.arrayContaining(res.groups[groupName]['field_3'].warnings)
      );

      // This one is equal since it has no tests outside the group
      expect(res.tests['field_6']).toEqual(res.groups[groupName]['field_6']);
    });

    test('Group object is a subset of test object (negating previous test)', () => {
      expect(res.groups[groupName]['field_1'].errors).not.toEqual(
        expect.arrayContaining(res.tests['field_1'].errors)
      );

      enforce(res.groups[groupName]['field_1'].errorCount).lte(
        res.tests['field_1'].errorCount
      );

      expect(res.groups[groupName]['field_3'].warnings).not.toEqual(
        expect.arrayContaining(res.tests['field_3'].warnings)
      );
      enforce(res.groups[groupName]['field_3'].warnCount).lte(
        res.tests['field_3'].warnCount
      );
    });
  });
});

runSpec(vest => {
  let collect, collection;

  const validation = () =>
    vest.create(suiteName, collect => {
      collect({
        context: singleton.useContext(),
        suiteId: singleton.useContext().suiteId,
        groupName: singleton.useContext().groupName,
      });

      dummyTest.failing();
      dummyTest.failing();

      group(groupName, () => {
        collect({
          context: singleton.useContext(),
          suiteId: singleton.useContext().suiteId,
          groupName: singleton.useContext().groupName,
        });
        dummyTest.failing();
      });
      collect({
        context: singleton.useContext(),
        suiteId: singleton.useContext().suiteId,
        groupName: singleton.useContext().groupName,
      });
    });

  describe('group: Context creation', () => {
    let validate;

    beforeEach(() => {
      suiteName = faker.random.word();
      groupName = faker.random.word();
      collect = collector();
      collection = collect.collection;
      validate = validation();
    });

    afterEach(() => {
      resetState();
    });

    test('Sanity', () => {
      // checking that we have the right context in the right places

      validate(collect);
      expect(collection[1].suiteId).toBe(suiteName);
      expect(collection[1].groupName).toBe(groupName);
      expect(collection[2].suiteId).toBe(suiteName);
      expect(collection[2].groupName).toBeUndefined();
    });

    it('Should initialize suite without group name', () => {
      validate(collect);
      expect(collection[0].suiteId).toBe(suiteName);
      expect(collection[0].groupName).toBeUndefined();
    });

    describe('When in group', () => {
      it('should create child context with group name', () => {
        validate(collect);
        expect(collection[1].context.parentContext).toBe(collection[0].context);
        expect(collection[1].suiteId).toBe(suiteName);
        expect(collection[1].groupName).toBe(groupName);
        expect(collection[1].context.parentContext).toBe(collection[2].context);
      });
    });

    describe('When out of group', () => {
      it('should go back to upper context', () => {
        validate(collect);
        expect(collection[2].groupName).toBeUndefined();
        expect(collection[2].context.parentContext).toBeUndefined();
      });
    });
  });
});
