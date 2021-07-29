import enforce from 'enforce';
import faker from 'faker';
import _ from 'lodash';
import * as vest from 'vest';

import { dummyTest } from '../../../testUtils/testDummy';

import VestTest from 'VestTest';
import group from 'group';

let groupName = 'group_name_1';
const groupName2 = 'group_name_2';

const topLevelTestObjects: Record<string, VestTest> = {};
const groupTestObjects: Record<string, VestTest> = {};

describe('group: exclusion', () => {
  const validation = () =>
    vest.create(
      ({
        only,
        skip,
        skipGroup,
        onlyGroup,
      }: {
        only?: string;
        skip?: string;
        skipGroup?: string;
        onlyGroup?: string;
      } = {}) => {
        vest.only(only);
        vest.skip(skip);
        vest.only.group(onlyGroup);
        vest.skip.group(skipGroup);

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

        group(groupName2, () => {
          groupTestObjects['field_6'] = dummyTest.failing('field_6');
          groupTestObjects['field_7'] = dummyTest.failing('field_7');
          groupTestObjects['field_8'] = dummyTest.passing('field_8');
        });
      }
    );
  let res, validate;

  beforeEach(() => {
    groupName = faker.random.word();
    validate = validation();
  });

  describe('When skipped', () => {
    beforeEach(() => {
      res = validate({ skipGroup: groupName });
    });

    it('produce result object with the group', () => {
      expect(res.groups[groupName]).toBeDefined();
      expect(res.groups[groupName]).toMatchInlineSnapshot(`
        Object {
          "field_1": Object {
            "errorCount": 0,
            "testCount": 0,
            "warnCount": 0,
          },
          "field_2": Object {
            "errorCount": 0,
            "testCount": 0,
            "warnCount": 0,
          },
          "field_3": Object {
            "errorCount": 0,
            "testCount": 0,
            "warnCount": 0,
          },
          "field_4": Object {
            "errorCount": 0,
            "testCount": 0,
            "warnCount": 0,
          },
          "field_6": Object {
            "errorCount": 0,
            "testCount": 0,
            "warnCount": 0,
          },
        }
      `);
    });

    it('Should skip tests within group', () => {
      Object.values(groupTestObjects).forEach(testObject => {
        if (testObject.groupName === groupName) {
          expect(testObject.testFn).not.toHaveBeenCalled();
        }
      });
    });

    it('Should run all tests outside of the group', () => {
      Object.values(topLevelTestObjects).forEach(testObject => {
        expect(testObject.testFn).toHaveBeenCalled();
      });
      Object.values(groupTestObjects).forEach(testObject => {
        if (testObject.groupName !== groupName) {
          expect(testObject.testFn).toHaveBeenCalled();
        } else {
          expect(testObject.testFn).not.toHaveBeenCalled();
        }
      });
    });
  });

  describe('When `only`ed', () => {
    beforeEach(() => {
      res = validate({ onlyGroup: groupName });
    });
    it('produce result object with group', () => {
      expect(res.groups).toHaveProperty(groupName);
    });

    it('produce correct result object', () => {
      expect(res.testCount).toBe(11);
      expect(res.errorCount).toBe(5);
      expect(res.warnCount).toBe(2);
      expect(res.tests['field_1'].errorCount).toBe(3);
      expect(res.tests['field_1'].warnCount).toBe(0);
      expect(res.tests['field_2'].errorCount).toBe(0);
      expect(res.tests['field_2'].warnCount).toBe(0);
      expect(res.tests['field_3'].errorCount).toBe(0);
      expect(res.tests['field_3'].warnCount).toBe(2);
      expect(res.tests['field_4'].errorCount).toBe(0);
      expect(res.tests['field_4'].warnCount).toBe(0);
      expect(res.tests['field_5'].errorCount).toBe(1);
      expect(res.tests['field_5'].warnCount).toBe(0);
      expect(res.tests['field_6'].errorCount).toBe(1);
      expect(res.tests['field_6'].warnCount).toBe(0);
    });

    it('Should run tests within group', () => {
      Object.values(groupTestObjects).forEach(testObject => {
        if (testObject.groupName === groupName) {
          expect(testObject.testFn).toHaveBeenCalled();
        } else if (testObject.groupName) {
          expect(testObject.testFn).not.toHaveBeenCalled();
        }
      });
    });

    it('Should only run tests outside of the group that are not in another group', () => {
      Object.values(topLevelTestObjects).forEach(testObject => {
        expect(testObject.testFn).toHaveBeenCalled();
      });
      let count = 0;
      Object.values(groupTestObjects).forEach(testObject => {
        if (testObject.groupName !== groupName) {
          count++;
          expect(testObject.testFn).not.toHaveBeenCalled();
        }
      });
      expect(count).toBe(3);
    });
  });

  describe('When skipped field inside `only`ed group', () => {
    beforeEach(() => {
      res = validate({ skip: 'field_1', onlyGroup: groupName });
    });
    it('produce result object with group', () => {
      expect(res.groups).toHaveProperty(groupName);
    });

    it('Should run all tests within group but skipped test', () => {
      Object.values(groupTestObjects)
        // all but skipped test
        .filter(({ fieldName }) => fieldName !== 'field_1')
        .filter(testObject => testObject.groupName === groupName)
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
    it('Should skip all matching tests outside group', () => {
      Object.values(topLevelTestObjects).forEach(testObject => {
        if (testObject.fieldName === 'field_1') {
          expect(testObject.testFn).not.toHaveBeenCalled();
        } else {
          expect(testObject.testFn).toHaveBeenCalled();
        }
      });
    });
  });
});

describe('group: base case', () => {
  let inGroup, outsideGroup;
  const validation = () =>
    vest.create(() => {
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
        inGroup = dummyTest.failing('field_6');
      });

      outsideGroup = dummyTest.failing('last');
    });
  let res;
  beforeEach(() => {
    groupName = faker.random.word();
    const validate = validation();
    res = validate();
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
    // The test count is different, though
    expect(_.omit(res.tests['field_2'], 'testCount')).toMatchObject(
      _.omit(res.groups[groupName]['field_2'], 'testCount')
    );

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

  describe('Test object creation', () => {
    it('when in group, should create test with matching group property', () => {
      expect(inGroup.groupName).toBe(groupName);
    });

    it('after exiting group, should create est without group property', () => {
      expect(outsideGroup).not.toHaveProperty('groupName');
    });
  });
});
