import { describe, it, expect, beforeEach } from 'vitest';
import wait from 'wait';

import { TTestSuite } from '../../../testUtils/TVestMock';

import { Modes } from '../../../hooks/optional/Modes';
import {
  test,
  optional,
  create,
  skipWhen,
  warn,
  skip,
  only,
  group,
} from '../../../vest';
import * as vest from '../../../vest';

const GROUP_NAME = 'group_1';

describe('isValidByGroup', () => {
  describe('Before any test ran', () => {
    it('should treat an empty group as valid (no tests ran)', () => {
      const suite = create(() => {
        group(GROUP_NAME, () => {
          test('field_1', () => {});
        });
      });

      expect(suite.get().isValidByGroup(GROUP_NAME)).toBe(true);
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

    it('should be invalid when both required and optional fields have errors', () => {
      expect(suite.run('field_2').isValidByGroup(GROUP_NAME)).toBe(false);
      expect(suite.run('field_2').isValidByGroup(GROUP_NAME, 'field_1')).toBe(
        false,
      );
    });
    it('should be invalid when a required field has errors', () => {
      expect(suite.run('field_1').isValidByGroup(GROUP_NAME)).toBe(false);
      expect(suite.run('field_1').isValidByGroup(GROUP_NAME, 'field_2')).toBe(
        false,
      );
    });

    it('should report the field invalid when it has errors', () => {
      expect(suite.run('field_2').isValidByGroup(GROUP_NAME, 'field_2')).toBe(
        false,
      );
    });

    it('should report an optional field as valid even if it has errors', () => {
      expect(suite.run('field_1').isValidByGroup(GROUP_NAME, 'field_1')).toBe(
        true,
      );
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
    it('should remain valid when there are only warnings', () => {
      expect(suite.run().isValidByGroup(GROUP_NAME)).toBe(true);
      expect(suite.run().isValidByGroup(GROUP_NAME, 'field_1')).toBe(true);
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
      it('should be valid when a field has warnings but also passes', () => {
        expect(suite.run().isValid()).toBe(true);
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
      it('should be invalid when a test is skipped (even if it was only a warning)', () => {
        expect(suite.run().isValid()).toBe(false);
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
    it('should be invalid when a required field is skipped', () => {
      expect(suite.run('field_1').isValidByGroup(GROUP_NAME)).toBe(false);
    });
    it('should be invalid when some required tests did not run', () => {
      expect(suite.run(['field_2', 'field_3']).isValidByGroup(GROUP_NAME)).toBe(
        false,
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
      it('should be invalid while an async optional test is pending', () => {
        suite.run();
        expect(suite.get().isValidByGroup(GROUP_NAME)).toBe(false);
        expect(suite.get().isValidByGroup(GROUP_NAME, 'field_1')).toBe(false);
      });
    });
    describe('When test is passing', () => {
      it('should be valid after the async optional test completes', async () => {
        suite.run();
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

    it('should be invalid while a warning async test is pending, then valid after it finishes', async () => {
      suite.run();
      expect(suite.get().isValidByGroup(GROUP_NAME)).toBe(false);
      await wait(300);
      expect(suite.get().isValidByGroup(GROUP_NAME)).toBe(true);
    });

    it('should report the field invalid while its warning async test is pending, then valid after it finishes', async () => {
      suite.run();
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
      it('should report a required field invalid while its async test is pending', () => {
        const result = suite.run();

        expect(result.isValidByGroup(GROUP_NAME)).toBe(false);
        expect(result.isValidByGroup(GROUP_NAME, 'field_1')).toBe(false);
      });
    });

    describe('When async test is passing', () => {
      it('should be valid after the required async test completes', async () => {
        await suite.run();
        const result = suite.get();
        expect(result.isValidByGroup(GROUP_NAME)).toBe(true);
        expect(result.isValidByGroup(GROUP_NAME, 'field_1')).toBe(true);
        expect(result.isValidByGroup(GROUP_NAME, 'field_2')).toBe(true);
      });
    });

    describe('When test is lagging', () => {
      it('should be invalid if a previous async test is still running', async () => {
        suite.run();
        const result = suite.run('field_2');
        expect(result.isValidByGroup(GROUP_NAME)).toBe(false);
        await result;
      });
    });
  });

  describe('When all required fields are passing', () => {
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
    it('should be valid when all required fields pass', () => {
      expect(suite.run().isValidByGroup(GROUP_NAME)).toBe(true);
      expect(suite.run().isValidByGroup(GROUP_NAME, 'field_1')).toBe(true);
      expect(suite.run().isValidByGroup(GROUP_NAME, 'field_2')).toBe(true);
      expect(suite.run().isValidByGroup(GROUP_NAME, 'field_3')).toBe(true);
    });
  });

  describe('When a required field has some passing tests', () => {
    it('should be invalid when not all tests for a field ran', () => {
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
        })
          .run()
          .isValidByGroup(GROUP_NAME),
      ).toBe(false);
    });
  });

  describe('When field name is specified', () => {
    it('should report a skipped field as invalid', () => {
      expect(
        create(() => {
          skip('field_1');
          group(GROUP_NAME, () => {
            test('field_1', () => true);
          });
        })
          .run()
          .isValidByGroup(GROUP_NAME, 'field_1'),
      ).toBe(false);
    });

    it('should return false for a field that does not exist in the group', () => {
      expect(
        create(() => {
          group(GROUP_NAME, () => {
            test('field_1', () => {});
          });
        })
          .run()
          .isValidByGroup(GROUP_NAME, 'field 2'),
      ).toBe(false);
    });

    it("should be invalid when only some of the field's tests ran", () => {
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
        })
          .run()
          .isValidByGroup(GROUP_NAME, 'field_1'),
      ).toBe(false);
    });

    it('should be invalid when the field has failing tests', () => {
      expect(
        create(() => {
          group(GROUP_NAME, () => {
            test('field_1', () => false);
          });
        })
          .run()
          .isValidByGroup(GROUP_NAME, 'field_1'),
      ).toBe(false);
    });

    it('should be valid when the field passes all its tests', () => {
      expect(
        create(() => {
          group(GROUP_NAME, () => {
            test('field_1', () => {});
          });
        })
          .run()
          .isValidByGroup(GROUP_NAME, 'field_1'),
      ).toBe(true);
    });

    it('should be valid when the field only has warnings', () => {
      expect(
        create(() => {
          group(GROUP_NAME, () => {
            test('field_1', () => {
              warn();
              return false;
            });
          });
        })
          .run()
          .isValidByGroup(GROUP_NAME, 'field_1'),
      ).toBe(true);
    });

    it('should be valid when the optional field did not run', () => {
      expect(
        create(() => {
          optional('field_1');
          skipWhen(true, () => {
            group(GROUP_NAME, () => {
              test('field_1', () => false);
            });
          });
        })
          .run()
          .isValidByGroup(GROUP_NAME, 'field_1'),
      ).toBe(true);
    });
  });

  describe('When querying a non existing field', () => {
    it('should return false for a field that does not exist in the group', () => {
      expect(
        create(() => {
          group(GROUP_NAME, () => {
            test('field_1', () => true);
          });
        })
          .run()
          .isValidByGroup(GROUP_NAME, 'field_2'),
      ).toBe(false);
    });
  });

  describe('When querying a non existing group', () => {
    const suite = create(() => {
      group(GROUP_NAME, () => {
        test('field_1', () => true);
      });
    });
    it('should be valid for a non-existent group (no tests)', () => {
      expect(suite.run().isValidByGroup('does-not-exist')).toBe(true);
      expect(suite.run().isValidByGroup('does-not-exist', 'field_1')).toBe(
        true,
      );
    });
  });

  describe('When queried field is omitted', () => {
    it('should be valid when an optional field is omitted by a custom rule', () => {
      expect(
        create(() => {
          optional({
            field_1: () => true,
          });
          group(GROUP_NAME, () => {
            test('field_1', () => false);
          });
        })
          .run()
          .isValidByGroup(GROUP_NAME),
      ).toBe(true);
    });
  });

  describe('When the only field in the group is optional', () => {
    it('should be valid when the optional field is blank', () => {
      expect(
        create((data: any) => {
          optional('field_1');
          group(GROUP_NAME, () => {
            test('field_1', () => false);
          });
        })
          .run({ field_1: '' })
          .isValidByGroup(GROUP_NAME),
      ).toBe(true);
    });

    it('should be invalid when the optional field has a value', () => {
      expect(
        create((data: any) => {
          optional('field_1');
          group(GROUP_NAME, () => {
            test('field_1', () => false);
          });
        })
          .run({ field_1: 'value' })
          .isValidByGroup(GROUP_NAME),
      ).toBe(false);
    });

    it('should be valid when an optional field has a null value', () => {
      expect(
        create((data: any) => {
          optional('field_1');
          group(GROUP_NAME, () => {
            test('field_1', () => false);
          });
        })
          .run({ field_1: null })
          .isValidByGroup(GROUP_NAME, 'field_1'),
      ).toBe(true);
    });

    it('should be valid when all optional fields are blank', () => {
      expect(
        create((data: any) => {
          optional(['field_1', 'field_2', 'field_3']);
          group(GROUP_NAME, () => {
            test('field_1', () => false);
            test('field_2', () => false);
            test('field_3', () => false);
          });
        })
          .run({ field_1: '', field_2: null, field_3: undefined })
          .isValidByGroup(GROUP_NAME),
      ).toBe(true);
    });

    it('should be invalid when only some optional fields are blank', () => {
      expect(
        create((data: any) => {
          optional(['field_1', 'field_2']);
          group(GROUP_NAME, () => {
            test('field_1', () => false);
            test('field_2', () => false);
          });
        })
          .run({ field_1: '', field_2: 'value' })
          .isValidByGroup(GROUP_NAME),
      ).toBe(false);
    });

    describe('With functional optional API', () => {
      it('should be valid when the custom optional rule returns true', () => {
        expect(
          create(() => {
            optional({ field_1: () => true });
            group(GROUP_NAME, () => {
              test('field_1', () => false);
            });
          })
            .run()
            .isValidByGroup(GROUP_NAME),
        ).toBe(true);
      });

      it('should be invalid when the custom optional rule returns false', () => {
        expect(
          create(() => {
            optional({ field_1: () => false });
            group(GROUP_NAME, () => {
              test('field_1', () => false);
            });
          })
            .run()
            .isValidByGroup(GROUP_NAME),
        ).toBe(false);
      });

      it('should be valid when optional is set to true', () => {
        expect(
          create(() => {
            optional({ field_1: true });
            group(GROUP_NAME, () => {
              test('field_1', () => false);
            });
          })
            .run()
            .isValidByGroup(GROUP_NAME),
        ).toBe(true);
      });

      it('should be invalid when optional is set to false', () => {
        expect(
          create(() => {
            optional({ field_1: false });
            group(GROUP_NAME, () => {
              test('field_1', () => false);
            });
          })
            .run()
            .isValidByGroup(GROUP_NAME),
        ).toBe(false);
      });

      it('should evaluate each field by its custom optional rule', () => {
        const suite = create((shouldOptionalField2: boolean) => {
          optional({
            field_1: () => true,
            field_2: () => shouldOptionalField2,
            field_3: false,
          });
          group(GROUP_NAME, () => {
            test('field_1', () => false);
            test('field_2', () => false);
            test('field_3', () => false);
          });
        });

        // field_1 is optional, field_2 is optional, but field_3 is not -> group invalid
        expect(suite.run(true).isValidByGroup(GROUP_NAME)).toBe(false);

        // field_1 is optional, but field_2 and field_3 are not -> group invalid
        expect(suite.run(false).isValidByGroup(GROUP_NAME)).toBe(false);
      });

      it('should be valid when checking a field made optional by a custom rule', () => {
        expect(
          create(() => {
            optional({ field_1: () => true });
            group(GROUP_NAME, () => {
              test('field_1', () => false);
            });
          })
            .run()
            .isValidByGroup(GROUP_NAME, 'field_1'),
        ).toBe(true);
      });
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

    it('should return false when checking for a field that belongs to a different group', () => {
      expect(suite.run().isValidByGroup('group_1', 'field_2')).toBe(false);
      expect(suite.run().isValidByGroup('group_2', 'field_1')).toBe(false);
    });
  });

  describe('When querying a field that is outside of a group', () => {
    const suite = create(() => {
      test('field_1', () => {});
      group('group_1', () => {
        test('field_2', () => {});
      });
    });

    it('should return false when checking for a field that is outside the group', () => {
      expect(suite.run().isValidByGroup('group_1', 'field_1')).toBe(false);
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

    it('should ignore the same field defined outside the group and use the in-group result', () => {
      expect(suite.run().isValidByGroup('group_1', 'field_1')).toBe(true);
    });
  });
});
