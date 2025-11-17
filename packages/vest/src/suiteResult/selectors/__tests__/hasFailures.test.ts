import { faker } from '@faker-js/faker';
import { describe, it, expect } from 'vitest';

import { dummyTest } from '../../../testUtils/testDummy';

import * as vest from '../../../vest';

describe('produce method: hasFailures', () => {
  const fieldName = faker.lorem.word();

  describe(`hasErrors`, () => {
    describe('When no test objects', () => {
      it('should return false', () => {
        const suite = vest.create(() => {});
        const res = suite.run();
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
        const res = suite.run();
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
        const res = suite.run();
        expect(res.hasErrors(fieldName)).toBe(false);
        expect(suite.get().hasErrors(fieldName)).toBe(false);
        expect(res.hasErrors()).toBe(false);
        expect(suite.get().hasErrors()).toBe(false);
      });
    });

    describe('When field has an error', () => {
      it('should return true when the field has at least one failing test', () => {
        const suite = vest.create(() => {
          dummyTest.passing();
          dummyTest.failing(fieldName);
        });
        const res = suite.run();
        expect(res.hasErrors(fieldName)).toBe(true);
        expect(suite.get().hasErrors(fieldName)).toBe(true);
        expect(res.hasErrors()).toBe(true);
        expect(suite.get().hasErrors()).toBe(true);
      });

      it('should return true', () => {
        const suite = vest.create(() => {
          dummyTest.failing(fieldName);
        });
        const res = suite.run();
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
        const res = suite.run();
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
        const res = suite.run();
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
        const res = suite.run();
        expect(res.hasWarnings(fieldName)).toBe(false);
        expect(suite.get().hasWarnings(fieldName)).toBe(false);
        expect(res.hasWarnings()).toBe(false);
        expect(suite.get().hasWarnings()).toBe(false);
      });
    });

    describe('When field is warning', () => {
      it('should return true when the field has at least one warning', () => {
        const suite = vest.create(() => {
          dummyTest.passingWarning();
          dummyTest.failingWarning(fieldName);
        });
        const res = suite.run();
        expect(res.hasWarnings(fieldName)).toBe(true);
        expect(suite.get().hasWarnings(fieldName)).toBe(true);
        expect(res.hasWarnings()).toBe(true);
        expect(suite.get().hasWarnings()).toBe(true);
      });

      it('should return true', () => {
        const suite = vest.create(() => {
          dummyTest.failingWarning(fieldName);
        });
        const res = suite.run();
        expect(res.hasWarnings(fieldName)).toBe(true);
        expect(suite.get().hasWarnings(fieldName)).toBe(true);
        expect(res.hasWarnings()).toBe(true);
        expect(suite.get().hasWarnings()).toBe(true);
      });
    });
  });
});
