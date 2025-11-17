import { describe, it, expect } from 'vitest';
import wait from 'wait';

import * as vest from '../../../vest';

describe('isTested', () => {
  describe('When no field name is passed', () => {
    describe('When suite has no tests', () => {
      it('Should return false', () => {
        const suite = vest.create(() => {});
        suite.run();
        // @ts-ignore - invalid input
        expect(suite.isTested()).toBe(false);
      });
    });

    describe('When suite has tests', () => {
      it('Should return false', () => {
        const suite = vest.create(() => {
          vest.test('f1', () => {});
        });
        suite.run();
        // @ts-ignore - invalid input
        expect(suite.isTested()).toBe(false);
      });
    });
  });

  describe('When suite has no tests', () => {
    it('Should return false', () => {
      const suite = vest.create(() => {});
      suite.run();
      expect(suite.isTested('f1')).toBe(false);
    });
  });

  describe('When suite has tests', () => {
    describe('When field has no tests', () => {
      it('Should return false', () => {
        const suite = vest.create(() => {
          vest.test('f1', () => {});
        });
        suite.run();
        expect(suite.isTested('f2')).toBe(false);
      });
    });

    describe('When field has tests', () => {
      it('Should return true', () => {
        const suite = vest.create(() => {
          vest.test('f1', () => {});
        });
        suite.run();
        expect(suite.isTested('f1')).toBe(true);
      });
    });
  });

  describe('When async test is pending', () => {
    it('Should return false', async () => {
      const suite = vest.create(() => {
        vest.test('f1', async () => {
          await wait(100);
        });
      });
      suite.run();
      expect(suite.isTested('f1')).toBe(true);
    });
  });
});
