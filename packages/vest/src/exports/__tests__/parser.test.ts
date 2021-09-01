import * as suiteDummy from '../../../testUtils/suiteDummy';

import { parse } from 'parser';
import * as vest from 'vest';

describe('parser.parse', () => {
  describe('parse().invalid', () => {
    it('Should return true when provided suite result is failing and no field name is provided', () => {
      expect(parse(suiteDummy.failing()).invalid()).toBe(true);
    });

    it('Should return false when provided suite result is passing and no field name is provided', () => {
      expect(parse(suiteDummy.passing()).invalid()).toBe(false);
    });

    it('Should return true when provided field is failing', () => {
      expect(parse(suiteDummy.failing('username')).invalid('username')).toBe(
        true
      );
    });

    it('Should return false when provided field is passing', () => {
      expect(parse(suiteDummy.passing('username')).invalid('username')).toBe(
        false
      );
    });
  });

  describe('parse().tested', () => {
    it('Should return true if any field is tested but no field is provided', () => {
      expect(parse(suiteDummy.passing()).tested()).toBe(true);
    });
    it('Should return true if no field is tested', () => {
      expect(parse(suiteDummy.untested()).tested()).toBe(false);
      expect(parse(suiteDummy.untested()).tested('field')).toBe(false);
    });
    it('Should return true if provided field is tested', () => {
      expect(parse(suiteDummy.passing('username')).tested('username')).toBe(
        true
      );
      expect(parse(suiteDummy.failing('username')).tested('username')).toBe(
        true
      );
    });
  });

  describe('parse().untested', () => {
    it('Should return true if no field is tested', () => {
      expect(parse(suiteDummy.untested()).untested()).toBe(true);
      expect(parse(suiteDummy.untested()).untested('username')).toBe(true);
    });

    it('Should return true if provided field is untested while others are', () => {
      expect(
        parse(
          vest.create(() => {
            vest.test('x', () => {});
            vest.skipWhen(true, () => {
              vest.test('untested', () => {});
            });
          })()
        ).untested('untested')
      ).toBe(true);
    });

    it('Should return false if any field is tested', () => {
      expect(parse(suiteDummy.passing('username')).untested()).toBe(false);
    });

    it('Should return false if provided field is tested', () => {
      expect(parse(suiteDummy.passing('username')).untested('username')).toBe(
        false
      );
    });
  });

  describe('parse().valid', () => {
    it('Should return true if all fields are passing', () => {
      expect(parse(suiteDummy.passing(['f1', 'f2', 'f3'])).valid()).toBe(true);
      expect(parse(suiteDummy.passing(['f1', 'f2', 'f3'])).valid('f2')).toBe(
        true
      );
    });

    it('Should return true if all required fields have been tested and are passing', () => {
      expect(
        parse(suiteDummy.passingWithUntestedOptional('optional')).valid()
      ).toBe(true);
    });

    it('Should return true if all fields, including optional, pass', () => {
      expect(parse(suiteDummy.passingWithOptional('optional')).valid()).toBe(
        true
      );
    });

    it('Should return false if suite has errors', () => {
      expect(parse(suiteDummy.failing()).valid()).toBe(false);
    });

    it('Should return false if suite has failing optional tests', () => {
      expect(parse(suiteDummy.failingOptional()).valid()).toBe(false);
    });

    it('Should return true if suite only has warnings', () => {
      expect(parse(suiteDummy.warning(['f1', 'f2', 'f3'])).valid()).toBe(true);
    });

    it('Should return false if no tests ran', () => {
      expect(parse(suiteDummy.untested()).valid()).toBe(false);
    });

    it('should return false if not all required fields ran', () => {
      expect(
        parse(
          vest.create(() => {
            vest.test('x', () => {});
            vest.test('untested', () => {});
            vest.skipWhen(true, () => {
              vest.test('untested', () => {});
            });
          })()
        ).valid()
      ).toBe(false);
    });

    describe('With field name', () => {
      it('Should return false when field is untested', () => {
        expect(
          parse(
            vest.create(() => {
              vest.skipWhen(true, () => {
                vest.test('f1', () => {});
              });
            })()
          ).valid('f1')
        ).toBe(false);
      });

      it('Should return true if optional field is untested', () => {
        expect(
          parse(
            vest.create(() => {
              vest.optional('f1');
              vest.skipWhen(true, () => {
                vest.test('f1', () => {});
              });
            })()
          ).valid('f1')
        ).toBe(true);
      });

      it('Should return true if field is passing', () => {
        expect(
          parse(
            vest.create(() => {
              vest.test('f1', () => {});
              vest.test('f2', () => false);
            })()
          ).valid('f1')
        ).toBe(true);
      });

      it('Should return false if field is failing', () => {
        expect(
          parse(
            vest.create(() => {
              vest.test('f1', () => {});
              vest.test('f2', () => false);
            })()
          ).valid('f2')
        ).toBe(false);
        expect(
          parse(
            vest.create(() => {
              vest.test('f1', () => {});
              vest.test('f2', () => {});
              vest.test('f2', () => false);
            })()
          ).valid('f2')
        ).toBe(false);
      });

      it('Should return true if field is warning', () => {
        expect(
          parse(
            vest.create(() => {
              vest.test('f1', () => {
                vest.warn();
                return false;
              });
            })()
          ).valid('f1')
        ).toBe(true);
      });
    });
  });

  describe('parse().warning', () => {
    it('Should return true when the suite has warnings', () => {
      expect(parse(suiteDummy.warning()).warning()).toBe(true);
    });

    it('Should return false when the suite is not warnings', () => {
      expect(parse(suiteDummy.failing()).warning()).toBe(false);
    });
  });
});
