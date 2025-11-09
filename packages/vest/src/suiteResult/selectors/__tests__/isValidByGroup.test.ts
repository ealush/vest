import { describe, it, expect, beforeEach } from 'vitest';
import wait from 'wait';

import { TTestSuite } from '../../../testUtils/TVestMock';

import { Modes } from 'Modes';
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
    it('Returns true because no tests have run yet (empty group is valid)', () => {
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

    it('Returns false when both required and optional fields have errors', () => {
      expect(suite.run('field_2').isValidByGroup(GROUP_NAME)).toBe(false);
      expect(suite.run('field_2').isValidByGroup(GROUP_NAME, 'field_1')).toBe(
        false,
      );
    });
    it('Returns false when a required field has errors', () => {
      expect(suite.run('field_1').isValidByGroup(GROUP_NAME)).toBe(false);
      expect(suite.run('field_1').isValidByGroup(GROUP_NAME, 'field_2')).toBe(
        false,
      );
    });

    it('Returns false when checking a specific required field that has errors', () => {
      expect(suite.run('field_2').isValidByGroup(GROUP_NAME, 'field_2')).toBe(
        false,
      );
    });

    it('Returns true when checking an optional field with errors (optional fields can be skipped)', () => {
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
    it('Returns true because warnings do not make the group invalid', () => {
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
      it('Returns true when field has both warnings and passing tests', () => {
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
      it('Returns false when a test is skipped (even if the test was only a warning)', () => {
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
    it('Returns false when a required field is skipped', () => {
      expect(suite.run('field_1').isValidByGroup(GROUP_NAME)).toBe(false);
    });
    it('Returns false when skipping some tests means not all tests ran', () => {
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
      it('Returns false while async test is still running', () => {
        suite.run();
        expect(suite.get().isValidByGroup(GROUP_NAME)).toBe(false);
        expect(suite.get().isValidByGroup(GROUP_NAME, 'field_1')).toBe(false);
      });
    });
    describe('When test is passing', () => {
      it('Returns true after async test completes successfully', async () => {
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

    it('Returns false while warning async test is pending, then true after completion', async () => {
      suite.run();
      expect(suite.get().isValidByGroup(GROUP_NAME)).toBe(false);
      await wait(300);
      expect(suite.get().isValidByGroup(GROUP_NAME)).toBe(true);
    });

    it('Returns false for specific field while async warning test is pending', async () => {
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
      it('Returns false for required field while async test is still running', () => {
        const result = suite.run();

        expect(result.isValidByGroup(GROUP_NAME)).toBe(false);
        expect(result.isValidByGroup(GROUP_NAME, 'field_1')).toBe(false);
      });
    });

    describe('When async test is passing', () => {
      it('Returns true after async test completes', async () => {
        await suite.run();
        const result = suite.get();
        expect(result.isValidByGroup(GROUP_NAME)).toBe(true);
        expect(result.isValidByGroup(GROUP_NAME, 'field_1')).toBe(true);
        expect(result.isValidByGroup(GROUP_NAME, 'field_2')).toBe(true);
      });
    });

    describe('When test is lagging', () => {
      it('Returns false when previous async test is still running', async () => {
        suite.run();
        const result = suite.run('field_2');
        expect(result.isValidByGroup(GROUP_NAME)).toBe(false);
        await result;
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
    it('Returns true when all required fields pass their tests', () => {
      expect(suite.run().isValidByGroup(GROUP_NAME)).toBe(true);
      expect(suite.run().isValidByGroup(GROUP_NAME, 'field_1')).toBe(true);
      expect(suite.run().isValidByGroup(GROUP_NAME, 'field_2')).toBe(true);
      expect(suite.run().isValidByGroup(GROUP_NAME, 'field_3')).toBe(true);
    });
  });

  describe('When a required field has some passing tests', () => {
    it('Returns false when not all tests for the field have run', () => {
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
    it('Returns false when checking a field that was skipped', () => {
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

    it('Returns false when checking a field that does not exist in the group', () => {
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

    it("Returns false when only some of the field's tests have run", () => {
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

    it('Returns false when the checked field has failing tests', () => {
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

    it('Returns true when the checked field passes all its tests', () => {
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

    it("Returns true when the checked field only has warnings (warnings don't affect validity)", () => {
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

    it('Returns true when checking an optional field that did not run', () => {
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
    it('Returns false because the field does not exist in the group', () => {
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
    it('Returns true because a non-existing group has no tests to fail', () => {
      expect(suite.run().isValidByGroup('does-not-exist')).toBe(true);
      expect(suite.run().isValidByGroup('does-not-exist', 'field_1')).toBe(
        true,
      );
    });
  });

  describe('When queried field is omitted', () => {
    it('Returns true when optional field is omitted (custom rule makes it optional)', () => {
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
    it('Returns true when optional field is blank (empty string makes it optional)', () => {
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

    it('Returns false when optional field has a value (not blank, so not optional)', () => {
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

    it('Returns true when checking specific optional field with null value (null is blank)', () => {
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

    it('Returns true when all optional fields are blank (empty, null, or undefined)', () => {
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

    it('Returns false when only some optional fields are blank (one has value)', () => {
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
      it('Returns true when custom optional rule returns true', () => {
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

      it('Returns false when custom optional rule returns false', () => {
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

      it('Returns true when optional is set to boolean true', () => {
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

      it('Returns false when optional is set to boolean false', () => {
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

      it('Handles multiple fields with different custom optional rules', () => {
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

      it('Returns true when checking specific field with custom optional rule', () => {
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

    it('Returns false when checking for a field that belongs to a different group', () => {
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

    it('Returns false when checking for a field that is outside the group', () => {
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

    it('Returns the result for the field inside the group only (ignores field outside group)', () => {
      expect(suite.run().isValidByGroup('group_1', 'field_1')).toBe(true);
    });
  });
});
