import VestTest from 'VestTest';
import nonMatchingSeverityProfile from 'nonMatchingSeverityProfile';

describe('nonMatchingSeverityProfile', () => {
  let testObject: VestTest;

  beforeEach(() => {
    testObject = new VestTest('field', jest.fn());
  });
  describe('When matching', () => {
    describe('When both are warning', () => {
      it('should return false', () => {
        testObject.warn();
        expect(nonMatchingSeverityProfile('warnings', testObject)).toBe(false);
      });
    });

    describe('When both are not warning', () => {
      it('should return false', () => {
        expect(nonMatchingSeverityProfile('errors', testObject)).toBe(false);
      });
    });
  });

  describe('When non matching', () => {
    describe('When test is warning', () => {
      it('should return true', () => {
        testObject.warn();
        expect(nonMatchingSeverityProfile('errors', testObject)).toBe(true);
      });
    });

    describe('When severity is warning', () => {
      it('should return true', () => {
        expect(nonMatchingSeverityProfile('warnings', testObject)).toBe(true);
      });
    });
  });
});
