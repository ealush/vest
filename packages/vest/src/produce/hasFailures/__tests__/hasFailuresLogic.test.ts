import faker from 'faker';

import VestTest from 'VestTest';
import hasFailuresLogic from 'hasFailuresLogic';

const fieldName: string = faker.random.word();

describe('hasFailuresLogic', () => {
  let testObject: VestTest;

  beforeEach(() => {
    const fieldName: string = faker.random.word();
    testObject = new VestTest(fieldName, jest.fn());
  });

  describe('When test did not fail', () => {
    it('Should return false', () => {
      expect(hasFailuresLogic(testObject, 'errors')).toBe(false);
      expect(hasFailuresLogic(testObject, 'warnings')).toBe(false);
      expect(hasFailuresLogic(testObject, 'errors', fieldName)).toBe(false);
    });
  });

  describe('When the test did fail', () => {
    beforeEach(() => {
      testObject.fail();
    });
    describe('When field name is not provided', () => {
      describe('When non matching severity profile', () => {
        it('should return false', () => {
          expect(hasFailuresLogic(testObject, 'warnings')).toBe(false);
          testObject.warn();
          expect(hasFailuresLogic(testObject, 'errors')).toBe(false);
        });
      });

      describe('When matching severity profile', () => {
        it('Should return true', () => {
          expect(hasFailuresLogic(testObject, 'errors')).toBe(true);
          testObject.warn();
          expect(hasFailuresLogic(testObject, 'warnings')).toBe(true);
        });
      });
    });
    describe('When field name is provided', () => {
      describe('When field name matches', () => {
        it('should return false', () => {
          expect(hasFailuresLogic(testObject, 'errors', 'non_matching')).toBe(
            false
          );
        });
      });

      describe('When field name matches', () => {
        it('Should continue with normal flow', () => {
          expect(hasFailuresLogic(testObject, 'warnings')).toBe(false);
          testObject.warn();
          expect(hasFailuresLogic(testObject, 'errors')).toBe(false);
          testObject.fail();
          expect(hasFailuresLogic(testObject, 'warnings')).toBe(true);
        });
      });
    });
  });
});
