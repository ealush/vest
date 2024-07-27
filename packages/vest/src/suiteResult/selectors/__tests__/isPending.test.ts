import wait from 'wait';

import * as vest from 'vest';

describe('isPending()', () => {
  describe('base case', () => {
    it('Should return true if no tests are pending', () => {
      const suite = vest.create(() => {
        vest.test('f1', () => {});
      });
      suite();
      expect(suite.isPending()).toBe(false);
      expect(suite.isPending('f1')).toBe(false);
    });

    it('Should return true with no field selector and the suite has pending tests', () => {
      const suite = vest.create(() => {
        vest.test('f1', () => {});
        vest.test('f2', async () => {});
      });
      suite();
      expect(suite.isPending()).toBe(true);
      expect(suite.isPending('f1')).toBe(false);
    });

    it('Should return true with no field selector and the suite has pending tests', () => {
      const suite = vest.create(() => {
        vest.test('f1', () => {});
        vest.test('f2', async () => {});
      });
      suite();
      expect(suite.isPending()).toBe(true);
      expect(suite.isPending('f2')).toBe(true);
    });
  });

  describe('After the field is no longer pending', () => {
    it('Should return false', async () => {
      const suite = vest.create(() => {
        vest.test('f1', () => {});
        vest.test('f2', async () => {});
      });
      suite();
      await wait(0);
      expect(suite.isPending()).toBe(false);
      expect(suite.isPending('f2')).toBe(false);
    });
  });

  describe('When there are multiple pending tests', () => {
    it('Should return false when all tests are done', async () => {
      const suite = vest.create(() => {
        vest.test('f1', () => {});
        vest.test('f2', async () => {});
        vest.test('f3', async () => {});
      });
      suite();
      await wait(0);
      expect(suite.isPending()).toBe(false);
      expect(suite.isPending('f2')).toBe(false);
      expect(suite.isPending('f3')).toBe(false);
    });

    it('Should return true when some tests are done', async () => {
      const suite = vest.create(() => {
        vest.test('f1', () => {});
        vest.test('f2', async () => {
          await wait(10);
        });
        vest.test('f3', async () => {});
      });
      suite();
      await wait(0);
      expect(suite.isPending()).toBe(true);
      expect(suite.isPending('f2')).toBe(true);
      expect(suite.isPending('f3')).toBe(false);
    });
  });

  describe('when there are multiple tests of the same field, and some are pending', () => {
    it('Should return true', async () => {
      const suite = vest.create(() => {
        vest.test('f1', () => {});
        vest.test('f1', async () => {});
        vest.test('f1', async () => {});
      });
      suite();
      expect(suite.isPending()).toBe(true);
      expect(suite.isPending('f1')).toBe(true);
    });
  });
});
