import faker from 'faker';

import { dummyTest } from '../../../../../../testUtils/testDummy';

import * as vest from 'vest';

describe('produce method: hasFailures', () => {
  const fieldName = faker.random.word();

  describe(`hasErrors`, () => {
    describe('When no test objects', () => {
      it('should return false', () => {
        const suite = vest.create(() => {});
        const res = suite();
        expect(res.hasErrors(fieldName)).toBe(false);
        expect(suite.get().hasErrors(fieldName)).toBe(false);
        expect(res.hasErrors()).toBe(false);
        expect(suite.get().hasErrors()).toBe(false);
      });
    });

    describe('When no failing test objects', () => {
      it('should return false', () => {
        const suite = vest.create(() => {
          dummyTest.passing(fieldName);
          dummyTest.passing('field_1');
          dummyTest.passing('field_2');
        });
        const res = suite();
        expect(res.hasErrors(fieldName)).toBe(false);
        expect(suite.get().hasErrors(fieldName)).toBe(false);
        expect(res.hasErrors()).toBe(false);
        expect(suite.get().hasErrors()).toBe(false);
      });
    });

    describe('When failed fields are warning', () => {
      it('should return false', () => {
        const suite = vest.create(() => {
          dummyTest.failingWarning();
          dummyTest.passing(fieldName);
        });
        const res = suite();
        expect(res.hasErrors(fieldName)).toBe(false);
        expect(suite.get().hasErrors(fieldName)).toBe(false);
        expect(res.hasErrors()).toBe(false);
        expect(suite.get().hasErrors()).toBe(false);
      });
    });

    describe('When field has an error', () => {
      it('Should return true when some of the tests of the field are erroring', () => {
        const suite = vest.create(() => {
          dummyTest.passing();
          dummyTest.failing(fieldName);
        });
        const res = suite();
        expect(res.hasErrors(fieldName)).toBe(true);
        expect(suite.get().hasErrors(fieldName)).toBe(true);
        expect(res.hasErrors()).toBe(true);
        expect(suite.get().hasErrors()).toBe(true);
      });

      it('should return true', () => {
        const suite = vest.create(() => {
          dummyTest.failing(fieldName);
        });
        const res = suite();
        expect(res.hasErrors(fieldName)).toBe(true);
        expect(suite.get().hasErrors(fieldName)).toBe(true);
        expect(res.hasErrors()).toBe(true);
        expect(suite.get().hasErrors()).toBe(true);
      });
    });
  });

  describe(`hasWarnings`, () => {
    describe('When no test objects', () => {
      it('should return false', () => {
        const suite = vest.create(() => {});
        const res = suite();
        expect(res.hasWarnings(fieldName)).toBe(false);
        expect(suite.get().hasWarnings(fieldName)).toBe(false);
        expect(res.hasWarnings()).toBe(false);
        expect(suite.get().hasWarnings()).toBe(false);
      });
    });

    describe('When no failing test objects', () => {
      it('should return false', () => {
        const suite = vest.create(() => {
          dummyTest.passingWarning(fieldName);
          dummyTest.passing('field_1');
        });
        const res = suite();
        expect(res.hasWarnings(fieldName)).toBe(false);
        expect(suite.get().hasWarnings(fieldName)).toBe(false);
        expect(res.hasWarnings()).toBe(false);
        expect(suite.get().hasWarnings()).toBe(false);
      });
    });

    describe('When failed fields is not warning', () => {
      it('should return false', () => {
        const suite = vest.create(() => {
          dummyTest.failing(fieldName);
        });
        const res = suite();
        expect(res.hasWarnings(fieldName)).toBe(false);
        expect(suite.get().hasWarnings(fieldName)).toBe(false);
        expect(res.hasWarnings()).toBe(false);
        expect(suite.get().hasWarnings()).toBe(false);
      });
    });

    describe('When field is warning', () => {
      it('Should return true when some of the tests of the field are warning', () => {
        const suite = vest.create(() => {
          dummyTest.passingWarning();
          dummyTest.failingWarning(fieldName);
        });
        const res = suite();
        expect(res.hasWarnings(fieldName)).toBe(true);
        expect(suite.get().hasWarnings(fieldName)).toBe(true);
        expect(res.hasWarnings()).toBe(true);
        expect(suite.get().hasWarnings()).toBe(true);
      });

      it('should return false', () => {
        const suite = vest.create(() => {
          dummyTest.failingWarning(fieldName);
        });
        const res = suite();
        expect(res.hasWarnings(fieldName)).toBe(true);
        expect(suite.get().hasWarnings(fieldName)).toBe(true);
        expect(res.hasWarnings()).toBe(true);
        expect(suite.get().hasWarnings()).toBe(true);
      });
    });
  });
});
