import { dummyTest } from '../../../testUtils/testDummy';

import { TTestSuite } from 'testUtils/TVestMock';
import { create, eager, only, group } from 'vest';

describe('mode: eager', () => {
  let suite: TTestSuite;

  describe('When tests fail', () => {
    beforeEach(() => {
      suite = create(include => {
        only(include);

        eager();
        dummyTest.failing('field_1', 'first-of-field_1');
        dummyTest.failing('field_1', 'second-of-field_1'); // Should not run
        dummyTest.failing('field_2', 'first-of-field_2');
        dummyTest.failing('field_2', 'second-of-field_2'); // Should not run
        dummyTest.failing('field_3', 'first-of-field_3');
        dummyTest.failing('field_3', 'second-of-field_3'); // Should not run
      });
    });

    it('Should fail fast for every failing field', () => {
      expect(suite.get().testCount).toBe(0); // sanity
      suite();
      expect(suite.get().testCount).toBe(3);
      expect(suite.get().errorCount).toBe(3);
      expect(suite.get().getErrors('field_1')).toEqual(['first-of-field_1']);
      expect(suite.get().getErrors('field_2')).toEqual(['first-of-field_2']);
      expect(suite.get().getErrors('field_3')).toEqual(['first-of-field_3']);
    });

    describe('When test is `only`ed', () => {
      it('Should fail fast for failing field', () => {
        suite('field_1');
        expect(suite.get().testCount).toBe(1);
        expect(suite.get().errorCount).toBe(1);
        expect(suite.get().getErrors('field_1')).toEqual(['first-of-field_1']);
      });
    });

    describe('When test is in a group', () => {
      beforeEach(() => {
        suite = create(() => {
          eager();
          group('group_1', () => {
            dummyTest.failing('field_1', 'first-of-field_1');
          });
          dummyTest.failing('field_1', 'second-of-field_1');
        });
      });
      it('Should fail fast for failing field', () => {
        suite();
        expect(suite.get().testCount).toBe(1);
        expect(suite.get().errorCount).toBe(1);
        expect(suite.get().getErrors('field_1')).toEqual(['first-of-field_1']);
      });
    });
  });

  describe('When tests pass', () => {
    beforeEach(() => {
      suite = create(() => {
        eager();
        dummyTest.passing('field_1', 'first-of-field_1');
        dummyTest.failing('field_1', 'second-of-field_1');
        dummyTest.passing('field_2', 'first-of-field_2');
        dummyTest.failing('field_2', 'second-of-field_2');
        dummyTest.passing('field_3', 'first-of-field_3');
        dummyTest.failing('field_3', 'second-of-field_3');
      });
    });

    it('Should fail fast for every failing field', () => {
      expect(suite.get().testCount).toBe(0); // sanity
      suite();
      expect(suite.get().testCount).toBe(6);
      expect(suite.get().errorCount).toBe(3);
      expect(suite.get().getErrors('field_1')).toEqual(['second-of-field_1']);
      expect(suite.get().getErrors('field_2')).toEqual(['second-of-field_2']);
      expect(suite.get().getErrors('field_3')).toEqual(['second-of-field_3']);
    });
  });

  describe('sanity', () => {
    beforeEach(() => {
      suite = create(() => {
        dummyTest.failing('field_1', 'first-of-field_1');
        dummyTest.failing('field_1', 'second-of-field_1');
        dummyTest.failing('field_2', 'first-of-field_2');
        dummyTest.failing('field_2', 'second-of-field_2');
        dummyTest.failing('field_3', 'first-of-field_3');
        dummyTest.failing('field_3', 'second-of-field_3');
      });
    });

    it('Should run all tests', () => {
      expect(suite.get().testCount).toBe(0); // sanity
      suite();
      expect(suite.get().testCount).toBe(6);
      expect(suite.get().errorCount).toBe(6);
    });
  });

  describe('When test used to fail and it now passes', () => {
    let run = 0;
    beforeEach(() => {
      suite = create(() => {
        dummyTest.passing('field_1');

        if (run === 0) {
          dummyTest.failing('field_1', 'second-of-field_1');
        } else {
          dummyTest.passing('field_1');
        }
        run++;
      });
    });

    it('Should treat test as passing', () => {
      suite();
      expect(suite.get().hasErrors()).toBe(true);
      expect(suite.get().getErrors('field_1')).toEqual(['second-of-field_1']);
      suite();
      expect(suite.get().hasErrors()).toBe(false);
      expect(suite.get().getErrors('field_1')).toEqual([]);
    });
  });
});
