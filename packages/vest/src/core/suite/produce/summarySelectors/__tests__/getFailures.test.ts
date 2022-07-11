import { dummyTest } from '../../../../../../testUtils/testDummy';

import * as vest from 'vest';

describe('->getFailures', () => {
  describe(`getErrors`, () => {
    describe('When no tests', () => {
      describe('When no parameters passed', () => {
        it('Should return an empty object', () => {
          const suite = vest.create(() => {});

          expect(suite().getErrors()).toEqual({});
          expect(suite.get().getErrors()).toEqual({});
        });
      });
      describe('When requesting a fieldName', () => {
        it('Should return an empty array', () => {
          const suite = vest.create(() => {});
          expect(suite().getErrors()).toEqual({});
          expect(suite.get().getErrors('field_2')).toEqual([]);
        });
      });
    });
    describe('When no errors', () => {
      describe('When no parameters passed', () => {
        it('Should return an object no errors', () => {
          const suite = vest.create(() => {
            dummyTest.passing('f1');
            dummyTest.passing('f2');
          });
          expect(suite().getErrors()).toEqual({});
          expect(suite.get().getErrors()).toEqual({});
        });
      });
      describe('When requesting a fieldName', () => {
        it('Should return an empty array', () => {
          const suite = vest.create(() => {
            dummyTest.passing('field_1');
            dummyTest.passing();
          });
          expect(suite().getErrors('field_1')).toEqual([]);
          expect(suite.get().getErrors('field_1')).toEqual([]);
        });
      });
    });

    describe('When there are errors', () => {
      describe('When no parameters passed', () => {
        it('Should return an object with an array per field', () => {
          const suite = vest.create(() => {
            dummyTest.failing('field_1', 'msg_1');
            dummyTest.failing('field_2', 'msg_2');
            dummyTest.failing('field_2', 'msg_3');
            dummyTest.passing('field_1', 'msg_4');
            dummyTest.failingWarning('field_1', 'msg_5');
          });
          expect(suite().getErrors()).toEqual({
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
        it('Should return an empty array', () => {
          const suite = vest.create(() => {
            dummyTest.failing('field_1', 'msg_1');
            dummyTest.failing('field_2', 'msg_2');
            dummyTest.failing('field_2', 'msg_3');
            dummyTest.passing('field_1', 'msg_4');
            dummyTest.failingWarning('field_1', 'msg_5');
          });
          expect(suite().getErrors('field_1')).toEqual(['msg_1']);
          expect(suite.get().getErrors('field_1')).toEqual(['msg_1']);
        });
      });
    });
  });

  describe(`getWarnings`, () => {
    describe('When no testObjects', () => {
      describe('When no parameters passed', () => {
        it('Should return an empty object', () => {
          const suite = vest.create(() => {});
          expect(suite().getWarnings()).toEqual({});
          expect(suite.get().getWarnings()).toEqual({});
        });
      });
      describe('When requesting a fieldName', () => {
        it('Should return an empty array', () => {
          const suite = vest.create(() => {});
          expect(suite().getWarnings('field_1')).toEqual([]);
          expect(suite.get().getWarnings('field_1')).toEqual([]);
        });
      });
    });
    describe('When no warnings', () => {
      describe('When no parameters passed', () => {
        it('Should return an empty object', () => {
          const suite = vest.create(() => {
            dummyTest.passing('x');
            dummyTest.passing('y');
          });
          expect(suite().getWarnings()).toEqual({});
          expect(suite.get().getWarnings()).toEqual({});
        });
      });
      describe('When requesting a fieldName', () => {
        it('Should return an empty array', () => {
          const suite = vest.create(() => {
            dummyTest.passing('field_1');
            dummyTest.passing();
          });
          expect(suite().getWarnings('field_1')).toEqual([]);
          expect(suite.get().getWarnings('field_1')).toEqual([]);
        });
      });
    });

    describe('When there are warnings', () => {
      describe('When no parameters passed', () => {
        it('Should return an object with an array per field', () => {
          const suite = vest.create(() => {
            dummyTest.failingWarning('field_1', 'msg_1');
            dummyTest.failingWarning('field_2', 'msg_2');
            dummyTest.failingWarning('field_2', 'msg_3');
            dummyTest.passingWarning('field_1', 'msg_4');
            dummyTest.failing('field_1', 'msg_5');
          });
          expect(suite().getWarnings()).toEqual({
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
        it('Should return an empty array', () => {
          const suite = vest.create(() => {
            dummyTest.failingWarning('field_1', 'msg_1');
            dummyTest.failingWarning('field_2', 'msg_2');
            dummyTest.failingWarning('field_2', 'msg_3');
            dummyTest.passingWarning('field_1', 'msg_4');
            dummyTest.failing('field_1', 'msg_5');
          });
          expect(suite().getWarnings('field_1')).toEqual(['msg_1']);
          expect(suite.get().getWarnings('field_1')).toEqual(['msg_1']);
        });
      });
    });
  });
});
