import { describe, it, expect } from 'vitest';

import { dummyTest } from '../../../testUtils/testDummy';

import { Modes } from 'Modes';
import * as vest from 'vest';

describe('->getFailures', () => {
  describe(`getErrors`, () => {
    describe('When no tests', () => {
      describe('When no parameters passed', () => {
        it('should return an empty object', () => {
          const suite = vest.create(() => {});

          expect(suite.run().getErrors()).toEqual({});
          expect(suite.get().getErrors()).toEqual({});
        });
      });
      describe('When requesting a fieldName', () => {
        it('should return an empty array', () => {
          const suite = vest.create(() => {});
          expect(suite.run().getErrors()).toEqual({});
          expect(suite.get().getErrors('field_2')).toEqual([]);
        });
      });
    });
    describe('When no errors', () => {
      describe('When no parameters passed', () => {
        it('should return an empty object (no errors)', () => {
          const suite = vest.create(() => {
            dummyTest.passing('f1');
            dummyTest.passing('f2');
          });
          expect(suite.run().getErrors()).toEqual({});
          expect(suite.get().getErrors()).toEqual({});
        });
      });
      describe('When requesting a fieldName', () => {
        it('should return an empty array', () => {
          const suite = vest.create(() => {
            dummyTest.passing('field_1');
            dummyTest.passing();
          });
          expect(suite.run().getErrors('field_1')).toEqual([]);
          expect(suite.get().getErrors('field_1')).toEqual([]);
        });
      });
    });

    describe('When there are errors', () => {
      describe('When no parameters passed', () => {
        it('should return an object mapping each field to its error messages', () => {
          const suite = vest.create(() => {
            vest.mode(Modes.ALL);
            dummyTest.failing('field_1', 'msg_1');
            dummyTest.failing('field_2', 'msg_2');
            dummyTest.failing('field_2', 'msg_3');
            dummyTest.passing('field_1', 'msg_4');
            dummyTest.failingWarning('field_1', 'msg_5');
          });
          expect(suite.run().getErrors()).toEqual({
            field_1: ['msg_1'],
            field_2: ['msg_2', 'msg_3'],
          });
          expect(suite.get().getErrors()).toEqual({
            field_1: ['msg_1'],
            field_2: ['msg_2', 'msg_3'],
          });
        });
      });
      describe('When requesting a fieldName', () => {
        it('should return an array with the field error messages', () => {
          const suite = vest.create(() => {
            dummyTest.failing('field_1', 'msg_1');
            dummyTest.failing('field_2', 'msg_2');
            dummyTest.failing('field_2', 'msg_3');
            dummyTest.passing('field_1', 'msg_4');
            dummyTest.failingWarning('field_1', 'msg_5');
          });
          expect(suite.run().getErrors('field_1')).toEqual(['msg_1']);
          expect(suite.get().getErrors('field_1')).toEqual(['msg_1']);
        });
      });
    });
  });

  describe(`getWarnings`, () => {
    describe('When no testObjects', () => {
      describe('When no parameters passed', () => {
        it('should return an empty object', () => {
          const suite = vest.create(() => {});
          expect(suite.run().getWarnings()).toEqual({});
          expect(suite.get().getWarnings()).toEqual({});
        });
      });
      describe('When requesting a fieldName', () => {
        it('should return an empty array', () => {
          const suite = vest.create(() => {});
          expect(suite.run().getWarnings('field_1')).toEqual([]);
          expect(suite.get().getWarnings('field_1')).toEqual([]);
        });
      });
    });
    describe('When no warnings', () => {
      describe('When no parameters passed', () => {
        it('should return an empty object', () => {
          const suite = vest.create(() => {
            dummyTest.passing('x');
            dummyTest.passing('y');
          });
          expect(suite.run().getWarnings()).toEqual({});
          expect(suite.get().getWarnings()).toEqual({});
        });
      });
      describe('When requesting a fieldName', () => {
        it('should return an empty array', () => {
          const suite = vest.create(() => {
            dummyTest.passing('field_1');
            dummyTest.passing();
          });
          expect(suite.run().getWarnings('field_1')).toEqual([]);
          expect(suite.get().getWarnings('field_1')).toEqual([]);
        });
      });
    });

    describe('When there are warnings', () => {
      describe('When no parameters passed', () => {
        it('should return an object mapping each field to its warning messages', () => {
          const suite = vest.create(() => {
            dummyTest.failingWarning('field_1', 'msg_1');
            dummyTest.failingWarning('field_2', 'msg_2');
            dummyTest.failingWarning('field_2', 'msg_3');
            dummyTest.passingWarning('field_1', 'msg_4');
            dummyTest.failing('field_1', 'msg_5');
          });
          expect(suite.run().getWarnings()).toEqual({
            field_1: ['msg_1'],
            field_2: ['msg_2', 'msg_3'],
          });
          expect(suite.get().getWarnings()).toEqual({
            field_1: ['msg_1'],
            field_2: ['msg_2', 'msg_3'],
          });
        });
      });
      describe('When requesting a fieldName', () => {
        it('should return an array with the field warning messages', () => {
          const suite = vest.create(() => {
            dummyTest.failingWarning('field_1', 'msg_1');
            dummyTest.failingWarning('field_2', 'msg_2');
            dummyTest.failingWarning('field_2', 'msg_3');
            dummyTest.passingWarning('field_1', 'msg_4');
            dummyTest.failing('field_1', 'msg_5');
          });
          expect(suite.run().getWarnings('field_1')).toEqual(['msg_1']);
          expect(suite.get().getWarnings('field_1')).toEqual(['msg_1']);
        });
      });
    });
  });
});
