import wait from 'wait';

import { TestPromise } from '../../../testUtils/testPromise';

import { Modes } from 'Modes';
import { TTestSuite } from 'testUtils/TVestMock';
import {
  test,
  optional,
  create,
  skipWhen,
  warn,
  skip,
  only,
  group,
} from 'vest';
import * as vest from 'vest';

const GROUP_NAME = 'group_1';

describe('isValidByGroup', () => {
  describe('Before any test ran', () => {
    it('Should return false', () => {
      const suite = create(() => {
        group(GROUP_NAME, () => {
          test('field_1', () => {});
        });
      });

      expect(suite.get().isValidByGroup(GROUP_NAME)).toBe(false);
    });
  });

  describe('When there are errors in the group', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create((fieldToSkip: string) => {
        skip(fieldToSkip);
        optional('field_1');

        group(GROUP_NAME, () => {
          test('field_1', () => false);
          test('field_2', () => false);
          test('sanity', () => true);
        });
      });
    });

    it('Should return false when an optional test has errors', () => {
      expect(suite('field_2').isValidByGroup(GROUP_NAME)).toBe(false);
      expect(suite('field_2').isValidByGroup(GROUP_NAME, 'field_1')).toBe(
        false
      );
    });
    it('Should return false when a required test has errors', () => {
      expect(suite('field_1').isValidByGroup(GROUP_NAME)).toBe(false);
      expect(suite('field_1').isValidByGroup(GROUP_NAME, 'field_2')).toBe(
        false
      );
    });

    it('Should return false when the queried field is not optional and has errors', () => {
      expect(suite('field_2').isValidByGroup(GROUP_NAME, 'field_2')).toBe(
        false
      );
    });

    it('Should return true when the queried field is optional and has errors', () => {
      expect(suite('field_1').isValidByGroup(GROUP_NAME, 'field_1')).toBe(true);
    });
  });

  describe('When there are warnings in the group', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        group(GROUP_NAME, () => {
          test('field_1', () => {
            warn();
            return false;
          });
        });
      });
    });
    it('Should return true when a required test has warnings', () => {
      expect(suite().isValidByGroup(GROUP_NAME)).toBe(true);
      expect(suite().isValidByGroup(GROUP_NAME, 'field_1')).toBe(true);
    });

    describe('When some of the tests for the required field are warnings', () => {
      beforeEach(() => {
        suite = create(() => {
          test('field_1', () => {
            warn();
            return false;
          });
          test('field_1', () => true);
        });
      });
      it('Should return true when a required test has warnings', () => {
        expect(suite().isValid()).toBe(true);
      });
    });

    describe('when a warning test in a required field is skipped', () => {
      beforeEach(() => {
        suite = create(() => {
          test('field_1', () => true);

          skipWhen(true, () => {
            test('field_1', () => {
              warn();
              return false;
            });
          });
        });
      });
      it('Should return false even when the skipped field is warning', () => {
        expect(suite().isValid()).toBe(false);
      });
    });
  });

  describe('When a non optional field is skipped', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(fieldToSkip => {
        skip(fieldToSkip);
        group(GROUP_NAME, () => {
          test('field_1', () => {
            return false;
          });
          test('field_2', () => {
            return true;
          });
          test('field_3', () => {
            return true;
          });
        });
      });
    });
    it('Should return false', () => {
      expect(suite('field_1').isValidByGroup(GROUP_NAME)).toBe(false);
    });
    it('Should return false', () => {
      expect(suite(['field_2', 'field_3']).isValidByGroup(GROUP_NAME)).toBe(
        false
      );
    });
  });

  describe('When the suite has an async optional test', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        optional('field_1');

        group(GROUP_NAME, () => {
          test('field_1', async () => {
            await wait(300);
          });
        });
      });
    });

    describe('When test is pending', () => {
      it('Should return false', () => {
        suite();
        expect(suite.get().isValidByGroup(GROUP_NAME)).toBe(false);
        expect(suite.get().isValidByGroup(GROUP_NAME, 'field_1')).toBe(false);
      });
    });
    describe('When test is passing', () => {
      it('Should return true', async () => {
        suite();
        await wait(300);
        expect(suite.get().isValidByGroup(GROUP_NAME)).toBe(true);
        expect(suite.get().isValidByGroup(GROUP_NAME, 'field_1')).toBe(true);
      });
    });
  });

  describe('When the suite has warning async tests', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        group(GROUP_NAME, () => {
          test('field_1', async () => {
            warn();
            await wait(300);
          });

          test('field_1', () => {
            return true;
          });
        });
      });
    });

    it('Should return false as long as the test is pending', async () => {
      suite();
      expect(suite.get().isValidByGroup(GROUP_NAME)).toBe(false);
      await wait(300);
      expect(suite.get().isValidByGroup(GROUP_NAME)).toBe(true);
    });

    it('Should return false as long as the test is pending when querying a specific field', async () => {
      suite();
      expect(suite.get().isValidByGroup(GROUP_NAME, 'field_1')).toBe(false);
      await wait(300);
      expect(suite.get().isValidByGroup(GROUP_NAME, 'field_1')).toBe(true);
    });
  });

  describe('When the suite has async non-optional tests', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(currentField => {
        only(currentField);
        optional('field_2');
        group(GROUP_NAME, () => {
          test('field_1', async () => {
            await wait(300);
          });
          test('field_2', () => {
            return true;
          });
        });
      });
    });

    describe('When test is pending', () => {
      it('Should return `false` for a required field', () => {
        const result = suite();

        expect(result.isValidByGroup(GROUP_NAME)).toBe(false);
        expect(result.isValidByGroup(GROUP_NAME, 'field_1')).toBe(false);
      });
    });

    describe('When async test is passing', () => {
      it('Should return `true`', () => {
        return TestPromise(done => {
          suite().done(result => {
            expect(result.isValidByGroup(GROUP_NAME)).toBe(true);
            expect(result.isValidByGroup(GROUP_NAME, 'field_1')).toBe(true);
            expect(result.isValidByGroup(GROUP_NAME, 'field_2')).toBe(true);
            done();
          });
        });
      });
    });

    describe('When test is lagging', () => {
      it('Should return `false`', () => {
        return TestPromise(done => {
          suite();
          const result = suite('field_2').done(done);

          expect(result.isValidByGroup(GROUP_NAME)).toBe(false);
        });
      });
    });
  });

  describe('When a all required fields are passing', () => {
    let suite: TTestSuite;

    beforeEach(() => {
      suite = create(() => {
        group(GROUP_NAME, () => {
          test('field_1', () => {
            return true;
          });
          test('field_1', () => {
            return true;
          });
          test('field_2', () => {
            return true;
          });
          test('field_3', () => {
            return true;
          });
        });
      });
    });
    it('Should return true', () => {
      expect(suite().isValidByGroup(GROUP_NAME)).toBe(true);
      expect(suite().isValidByGroup(GROUP_NAME, 'field_1')).toBe(true);
      expect(suite().isValidByGroup(GROUP_NAME, 'field_2')).toBe(true);
      expect(suite().isValidByGroup(GROUP_NAME, 'field_3')).toBe(true);
    });
  });

  describe('When a required field has some passing tests', () => {
    it('Should return false', () => {
      expect(
        create(() => {
          group(GROUP_NAME, () => {
            test('field_1', () => true);
            skipWhen(true, () => {
              test('field_1', () => {
                return true;
              });
            });
          });
        })().isValidByGroup(GROUP_NAME)
      ).toBe(false);
    });
  });

  describe('When field name is specified', () => {
    it('Should return false when field did not run yet', () => {
      expect(
        create(() => {
          skip('field_1');
          group(GROUP_NAME, () => {
            test('field_1', () => true);
          });
        })().isValidByGroup(GROUP_NAME, 'field_1')
      ).toBe(false);
    });

    it('Should return false when testing for a field that does not exist', () => {
      expect(
        create(() => {
          group(GROUP_NAME, () => {
            test('field_1', () => {});
          });
        })().isValidByGroup(GROUP_NAME, 'field 2')
      ).toBe(false);
    });

    it("Should return false when some of the field's tests ran", () => {
      expect(
        create(() => {
          group(GROUP_NAME, () => {
            test('field_1', () => {
              return true;
            });
            skipWhen(true, () => {
              test('field_1', () => {
                return true;
              });
            });
          });
        })().isValidByGroup(GROUP_NAME, 'field_1')
      ).toBe(false);
    });

    it('Should return false when the field has errors', () => {
      expect(
        create(() => {
          group(GROUP_NAME, () => {
            test('field_1', () => false);
          });
        })().isValidByGroup(GROUP_NAME, 'field_1')
      ).toBe(false);
    });

    it('Should return true when all the tests are passing', () => {
      expect(
        create(() => {
          group(GROUP_NAME, () => {
            test('field_1', () => {});
          });
        })().isValidByGroup(GROUP_NAME, 'field_1')
      ).toBe(true);
    });

    it('Should return true when the field only has warnings', () => {
      expect(
        create(() => {
          group(GROUP_NAME, () => {
            test('field_1', () => {
              warn();
              return false;
            });
          });
        })().isValidByGroup(GROUP_NAME, 'field_1')
      ).toBe(true);
    });

    it('Should return true if field is optional and did not run', () => {
      expect(
        create(() => {
          optional('field_1');
          skipWhen(true, () => {
            group(GROUP_NAME, () => {
              test('field_1', () => false);
            });
          });
        })().isValidByGroup(GROUP_NAME, 'field_1')
      ).toBe(true);
    });
  });

  describe('When querying a non existing field', () => {
    it('Should return false', () => {
      expect(
        create(() => {
          group(GROUP_NAME, () => {
            test('field_1', () => true);
          });
        })().isValidByGroup(GROUP_NAME, 'field_2')
      ).toBe(false);
    });
  });

  describe('When querying a non existing group', () => {
    const suite = create(() => {
      group(GROUP_NAME, () => {
        test('field_1', () => true);
      });
    });
    it('Should return false', () => {
      expect(suite().isValidByGroup('does-not-exist')).toBe(false);
      expect(suite().isValidByGroup('does-not-exist', 'field_1')).toBe(false);
    });
  });

  describe('When queried field is omitted', () => {
    it('Should return true', () => {
      expect(
        create(() => {
          optional({
            field_1: () => true,
          });
          group(GROUP_NAME, () => {
            test('field_1', () => false);
          });
        })().isValidByGroup(GROUP_NAME)
      ).toBe(true);
    });
  });

  describe('When querying a field that is in a different group', () => {
    const suite = create(() => {
      group('group_1', () => {
        test('field_1', () => {});
      });
      group('group_2', () => {
        test('field_2', () => {});
      });
    });

    it('Should return false', () => {
      expect(suite().isValidByGroup('group_1', 'field_2')).toBe(false);
      expect(suite().isValidByGroup('group_2', 'field_1')).toBe(false);
    });
  });

  describe('When querying a field that is outside of a group', () => {
    const suite = create(() => {
      test('field_1', () => {});
      group('group_1', () => {
        test('field_2', () => {});
      });
    });

    it('Should return false', () => {
      expect(suite().isValidByGroup('group_1', 'field_1')).toBe(false);
    });
  });

  describe('When the field exists both inside and outside of the group', () => {
    const suite = create(() => {
      vest.mode(Modes.ALL);
      test('field_1', () => false);
      group('group_1', () => {
        test('field_1', () => {});
      });
    });

    it('Should return the result of what is inside the group', () => {
      expect(suite().isValidByGroup('group_1', 'field_1')).toBe(true);
    });
  });
});
