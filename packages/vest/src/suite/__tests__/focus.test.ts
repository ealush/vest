import { describe, it, expect, vi } from 'vitest';

import { dummyTest } from '../../testUtils/testDummy';
import * as vest from '../../vest';

describe('suite.focus: only', () => {
  it('focus should be a function', () => {
    const suite = vest.create(() => {});

    expect(suite.focus).toBeTypeOf('function');
  });

  describe('focus return value', () => {
    it('should be the rest of the suite methods', () => {
      const suite = vest.create(() => {});

      const focused = suite.focus({ only: ['field_1'] });

      expect(focused).toBeTypeOf('object');
      expect(focused.afterEach).toBeTypeOf('function');
      expect(focused.afterField).toBeTypeOf('function');
      expect(focused.run).toBeTypeOf('function');
      expect(focused).toMatchSnapshot();
    });
  });

  describe('run.focus property', () => {
    describe('focus object parameters', () => {
      it('should reflect the only property when provided', () => {
        const suite = vest.create(() => {});
        const res = suite.focus({ only: ['field_1'] }).run();

        expect(res.run.focus?.only).toEqual(['field_1']);
      });

      it('should reflect the skip property when provided', () => {
        const suite = vest.create(() => {});
        const res = suite.focus({ skip: ['field_2'] }).run();

        expect(res.run.focus?.skip).toEqual(['field_2']);
      });

      it('should reflect the skipGroup property when provided', () => {
        const suite = vest.create(() => {});
        const res = suite.focus({ skipGroup: 'groupA' }).run();

        expect(res.run.focus?.skipGroup).toEqual(['groupA']);
      });

      it('should reflect the onlyGroup property when provided', () => {
        const suite = vest.create(() => {});
        const res = suite.focus({ onlyGroup: 'groupB' }).run();

        expect(res.run.focus?.onlyGroup).toEqual(['groupB']);
      });
    });

    describe('focus methods', () => {
      it('should reflect a .only() call deeply within run.focus', () => {
        const suite = vest.create(() => {});
        const res = suite.only('field_3').run();

        expect(res.run.focus?.only).toEqual(['field_3']);
      });

      it('should reflect a .skip() call deeply within run.focus', () => {
        const suite = vest.create(() => {});

        // We capture focus via focus({ skip: ... }) because
        // there's currently no top-level trailing .skip syntax exposed
        const res = suite.focus({ skip: 'field_4' }).run();

        expect(res.run.focus?.skip).toEqual(['field_4']);
      });
    });

    describe('focus array parameters', () => {
      it('should reflect the onlyGroup property when an array is provided', () => {
        const suite = vest.create(() => {});
        const res = suite.focus({ onlyGroup: ['groupC', 'groupD'] }).run();

        expect(res.run.focus?.onlyGroup).toEqual(['groupC', 'groupD']);
      });

      it('should reflect the skipGroup property when an array is provided', () => {
        const suite = vest.create(() => {});
        const res = suite.focus({ skipGroup: ['groupE', 'groupF'] }).run();

        expect(res.run.focus?.skipGroup).toEqual(['groupE', 'groupF']);
      });
    });

    describe('consecutive runs', () => {
      it('should not persist focus data from previous runs', () => {
        const suite = vest.create(() => {});

        // First run with focus
        suite.only('field_1').run();

        // Second run without focus
        const res2 = suite.run();

        // Should be an empty object because the second run had no focus modifiers
        expect(res2.run.focus).toEqual({});
      });

      it('should not mutate previous run results with new focus data', () => {
        const suite = vest.create(() => {});

        // First run with focus on field_1
        const res1 = suite.only('field_1').run();

        // Second run with focus on field_2
        const res2 = suite.only('field_2').run();

        // Check that the first result was not mutated
        expect(res1.run.focus?.only).toEqual(['field_1']);

        // Check that the second result has the new focus
        expect(res2.run.focus?.only).toEqual(['field_2']);
      });
    });
  });

  describe('behavior', () => {
    it('should focus on the specified field when a single field is provided', () => {
      const suite = vest.create(() => {
        dummyTest.failing('field_1');
        dummyTest.failing('field_2');
        dummyTest.failing('field_3');
      });

      const res = suite.focus({ only: 'field_1' }).run();

      expect(res.hasErrors('field_1')).toBe(true);
      expect(res.hasErrors('field_2')).toBe(false);
      expect(res.hasErrors('field_3')).toBe(false);

      expect(res.tests.field_1.testCount).toBe(1);
      expect(res.tests.field_2.testCount).toBe(0);
      expect(res.tests.field_3.testCount).toBe(0);
    });

    it('should focus on the specified fields when multiple fields are provided', () => {
      const suite = vest.create(() => {
        dummyTest.failing('field_1');
        dummyTest.failing('field_2');
        dummyTest.failing('field_3');
      });

      const res = suite.focus({ only: ['field_1', 'field_3'] }).run();

      expect(res.hasErrors('field_1')).toBe(true);
      expect(res.hasErrors('field_2')).toBe(false);
      expect(res.hasErrors('field_3')).toBe(true);

      expect(res.tests.field_1.testCount).toBe(1);
      expect(res.tests.field_2.testCount).toBe(0);
      expect(res.tests.field_3.testCount).toBe(1);
    });

    describe('multiple runs', () => {
      it('should reevaluate the focused fields on each run', () => {
        const suite = vest.create(() => {
          dummyTest.failing('field_1');
          dummyTest.failing('field_2');
          dummyTest.failing('field_3');
        });

        suite.focus({ only: 'field_1' }).run();
        expect(suite.hasErrors('field_1')).toBe(true);
        expect(suite.hasErrors('field_2')).toBe(false);
        expect(suite.hasErrors('field_3')).toBe(false);

        suite.focus({ only: 'field_2' }).run();
        expect(suite.hasErrors('field_1')).toBe(true);
        expect(suite.hasErrors('field_2')).toBe(true);
        expect(suite.hasErrors('field_3')).toBe(false);

        suite.focus({ only: 'field_3' }).run();
        expect(suite.hasErrors('field_1')).toBe(true);
        expect(suite.hasErrors('field_2')).toBe(true);
        expect(suite.hasErrors('field_3')).toBe(true);
      });

      it('should not persist focus from one run to the next', () => {
        const suite = vest.create(
          (data = {} as { f1?: number; f2?: number }) => {
            vest.test('f1', 'f1 is required', () => {
              vest.enforce(data.f1).isNotEmpty();
            });
            vest.test('f2', 'f2 is required', () => {
              vest.enforce(data.f2).isNotEmpty();
            });
          },
        );

        // 1. Run with focus on f1 - should not get errors for f1 (it's skipped)
        const focusedResult = suite.focus({ only: 'f1' }).run({});
        expect(focusedResult.hasErrors('f1')).toBe(true);
        expect(focusedResult.hasErrors('f2')).toBe(false);
        expect(focusedResult.tests.f1.testCount).toBe(1);
        expect(focusedResult.tests.f2.testCount).toBe(0);

        // 2. Run without focus - should now get errors for both f1 and f2
        const unfocusedResult = suite.run({});
        expect(unfocusedResult.hasErrors('f1')).toBe(true);
        expect(unfocusedResult.hasErrors('f2')).toBe(true);
        expect(unfocusedResult.isValid()).toBe(false);
        expect(unfocusedResult.tests.f1.testCount).toBe(1);
        expect(unfocusedResult.tests.f2.testCount).toBe(1);
        // 3. Run without focus but with valid data - should be valid
        const validResult = suite.run({ f1: 1, f2: 2 });
        expect(validResult.hasErrors('f1')).toBe(false);
        expect(validResult.hasErrors('f2')).toBe(false);
        expect(validResult.isValid()).toBe(true);
      });
    });
  });
});

describe('suite.focus: skip', () => {
  describe('single field', () => {
    it('should skip the specified field', () => {
      const suite = vest.create(() => {
        dummyTest.failing('field_1');
        dummyTest.failing('field_2');
        dummyTest.failing('field_3');
      });

      const res = suite.focus({ skip: 'field_1' }).run();

      expect(res.hasErrors('field_1')).toBe(false);
      expect(res.hasErrors('field_2')).toBe(true);
      expect(res.hasErrors('field_3')).toBe(true);

      expect(res.tests.field_1.testCount).toBe(0);
      expect(res.tests.field_2.testCount).toBe(1);
      expect(res.tests.field_3.testCount).toBe(1);
    });
  });

  describe('multiple fields', () => {
    it('should skip all specified fields', () => {
      const suite = vest.create(() => {
        dummyTest.failing('field_1');
        dummyTest.failing('field_2');
        dummyTest.failing('field_3');
      });

      const res = suite.focus({ skip: ['field_1', 'field_2'] }).run();

      expect(res.hasErrors('field_1')).toBe(false);
      expect(res.hasErrors('field_2')).toBe(false);
      expect(res.hasErrors('field_3')).toBe(true);

      expect(res.tests.field_1.testCount).toBe(0);
      expect(res.tests.field_2.testCount).toBe(0);
      expect(res.tests.field_3.testCount).toBe(1);
    });
  });

  describe('combined with only', () => {
    it('should apply both only and skip modifiers', () => {
      const suite = vest.create(() => {
        vest.mode(vest.Modes.ALL);
        vest.test('field_1', 'f1 error', () => false);
        vest.test('field_2', 'f2 error', () => false);
        vest.test('field_3', 'f3 error', () => false);
      });

      // only field_1 should run - skip is redundant here but should not interfere
      const res = suite.focus({ only: 'field_1', skip: 'field_3' }).run();

      expect(res.hasErrors('field_1')).toBe(true);
      expect(res.hasErrors('field_2')).toBe(false);
      expect(res.hasErrors('field_3')).toBe(false);

      expect(res.tests.field_1.testCount).toBe(1);
      expect(res.tests.field_2.testCount).toBe(0);
      expect(res.tests.field_3.testCount).toBe(0);
    });
  });

  describe('multiple runs', () => {
    it('should not persist skip focus from one run to the next', () => {
      const suite = vest.create(() => {
        dummyTest.failing('field_1');
        dummyTest.failing('field_2');
        dummyTest.failing('field_3');
      });

      // 1. Focused skip run
      const skippedResult = suite.focus({ skip: 'field_1' }).run();
      expect(skippedResult.hasErrors('field_1')).toBe(false);
      expect(skippedResult.hasErrors('field_2')).toBe(true);
      expect(skippedResult.hasErrors('field_3')).toBe(true);

      // 2. Normal run - field_1 should now run
      const fullResult = suite.run();
      expect(fullResult.hasErrors('field_1')).toBe(true);
      expect(fullResult.hasErrors('field_2')).toBe(true);
      expect(fullResult.hasErrors('field_3')).toBe(true);
    });
  });
});

describe('suite.focus: skipGroup', () => {
  describe('single group', () => {
    it('should skip all tests in the specified group', () => {
      const cb1 = vi.fn(() => false);
      const cb2 = vi.fn(() => false);
      const cb3 = vi.fn(() => false);
      const suite = vest.create(() => {
        vest.mode(vest.Modes.ALL);

        vest.group('groupA', () => {
          vest.test('field_1', cb1);
          vest.test('field_2', cb1);
        });

        vest.group('groupB', () => {
          vest.test('field_2', cb2);
          vest.test('field_3', cb2);
        });

        vest.test('field_1', cb3);
      });

      const res = suite.focus({ skipGroup: 'groupA' }).run();

      // groupA tests should be skipped
      expect(res.groups.groupA.field_1.testCount).toBe(0);
      expect(res.groups.groupA.field_2.testCount).toBe(0);

      // groupB tests should run normally
      expect(res.groups.groupB.field_2.testCount).toBe(1);
      expect(res.groups.groupB.field_3.testCount).toBe(1);

      // Top-level tests should run normally
      expect(res.tests.field_1.testCount).toBe(1);

      // cb1 (groupA) should not have been called
      expect(cb1).not.toHaveBeenCalled();
      // cb2 (groupB) should have been called
      expect(cb2).toHaveBeenCalledTimes(2);
      // cb3 (top-level) should have been called
      expect(cb3).toHaveBeenCalledTimes(1);
    });
  });

  describe('multiple groups', () => {
    it('should skip all tests in all specified groups when passed as array', () => {
      const cb1 = vi.fn(() => false);
      const cb2 = vi.fn(() => false);
      const cb3 = vi.fn(() => false);
      const suite = vest.create(() => {
        vest.mode(vest.Modes.ALL);

        vest.group('groupA', () => {
          vest.test('field_1', cb1);
        });

        vest.group('groupB', () => {
          vest.test('field_2', cb2);
        });

        vest.test('field_3', cb3);
      });

      const res = suite.focus({ skipGroup: ['groupA', 'groupB'] }).run();

      expect(res.groups.groupA.field_1.testCount).toBe(0);
      expect(res.groups.groupB.field_2.testCount).toBe(0);
      expect(res.tests.field_3.testCount).toBe(1);

      expect(cb1).not.toHaveBeenCalled();
      expect(cb2).not.toHaveBeenCalled();
      expect(cb3).toHaveBeenCalledTimes(1);
    });
  });

  describe('nonexistent group', () => {
    it('should have no effect when skipGroup references a group that does not exist', () => {
      const cb1 = vi.fn(() => false);
      const cb2 = vi.fn(() => false);
      const suite = vest.create(() => {
        vest.mode(vest.Modes.ALL);

        vest.group('groupA', () => {
          vest.test('field_1', cb1);
        });

        vest.test('field_2', cb2);
      });

      const res = suite.focus({ skipGroup: 'nonexistent' }).run();

      expect(res.groups.groupA.field_1.testCount).toBe(1);
      expect(res.tests.field_2.testCount).toBe(1);
      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).toHaveBeenCalledTimes(1);
    });
  });

  describe('combined with only', () => {
    it('should focus only on the specified field and skip the specified group', () => {
      const cb1 = vi.fn(() => false);
      const cb2 = vi.fn(() => false);
      const cb3 = vi.fn(() => false);
      const suite = vest.create(() => {
        vest.mode(vest.Modes.ALL);

        vest.group('groupA', () => {
          vest.test('field_1', cb1);
          vest.test('field_2', cb1);
        });

        vest.group('groupB', () => {
          vest.test('field_1', cb2);
          vest.test('field_2', cb2);
        });

        vest.test('field_1', cb3);
        vest.test('field_2', cb3);
      });

      const res = suite.focus({ only: 'field_1', skipGroup: 'groupA' }).run();

      // field_1 is only'd, so field_2 is excluded everywhere
      // groupA is skipped entirely (even field_1 in groupA is skipped)
      expect(res.groups.groupA.field_1.testCount).toBe(0);
      expect(res.groups.groupA.field_2.testCount).toBe(0);

      // field_1 in groupB should run (it's only'd and groupB is not skipped)
      expect(res.groups.groupB.field_1.testCount).toBe(1);
      expect(res.groups.groupB.field_2.testCount).toBe(0);

      // Top-level field_1 should run
      expect(res.tests.field_1.testCount).toBe(2);
      expect(res.tests.field_2.testCount).toBe(0);
    });
  });

  describe('combined with skip', () => {
    it('should skip both the specified field and the specified group', () => {
      const cb1 = vi.fn(() => false);
      const cb2 = vi.fn(() => false);
      const cb3 = vi.fn(() => false);
      const suite = vest.create(() => {
        vest.mode(vest.Modes.ALL);

        vest.group('groupA', () => {
          vest.test('field_1', cb1);
          vest.test('field_2', cb1);
        });

        vest.group('groupB', () => {
          vest.test('field_1', cb2);
          vest.test('field_2', cb2);
        });

        vest.test('field_1', cb3);
        vest.test('field_2', cb3);
      });

      const res = suite.focus({ skip: 'field_1', skipGroup: 'groupA' }).run();

      // groupA is entirely skipped
      expect(res.groups.groupA.field_1.testCount).toBe(0);
      expect(res.groups.groupA.field_2.testCount).toBe(0);

      // field_1 is skipped everywhere (including groupB)
      expect(res.groups.groupB.field_1.testCount).toBe(0);
      // field_2 in groupB should run
      expect(res.groups.groupB.field_2.testCount).toBe(1);

      // Top-level: field_1 skipped, field_2 runs
      expect(res.tests.field_1.testCount).toBe(0);
      expect(res.tests.field_2.testCount).toBe(2);
    });
  });

  describe('multiple runs', () => {
    it('should not persist skipGroup focus from one run to the next', () => {
      const cb1 = vi.fn(() => false);
      const cb2 = vi.fn(() => false);
      const suite = vest.create(() => {
        vest.mode(vest.Modes.ALL);

        vest.group('groupA', () => {
          vest.test('field_1', cb1);
        });

        vest.test('field_2', cb2);
      });

      // 1. Focused run - skip groupA
      const focusedResult = suite.focus({ skipGroup: 'groupA' }).run();
      expect(focusedResult.groups.groupA.field_1.testCount).toBe(0);
      expect(focusedResult.tests.field_2.testCount).toBe(1);

      // 2. Normal run - groupA should now run
      cb1.mockClear();
      cb2.mockClear();
      const fullResult = suite.run();
      expect(fullResult.groups.groupA.field_1.testCount).toBe(1);
      expect(fullResult.tests.field_2.testCount).toBe(1);
      expect(cb1).toHaveBeenCalledTimes(1);
    });

    it('should allow changing skipGroup between focused runs', () => {
      const suite = vest.create(() => {
        vest.mode(vest.Modes.ALL);

        vest.group('groupA', () => {
          vest.test('field_1', () => false);
        });

        vest.group('groupB', () => {
          vest.test('field_2', () => false);
        });
      });

      // Skip groupA - groupB runs
      const res1 = suite.focus({ skipGroup: 'groupA' }).run();
      expect(res1.groups.groupA.field_1.testCount).toBe(0);
      expect(res1.groups.groupB.field_2.testCount).toBe(1);

      // Now skip groupB instead - groupA now runs, groupB preserves previous result
      const res2 = suite.focus({ skipGroup: 'groupB' }).run();
      expect(res2.groups.groupA.field_1.testCount).toBe(1);
      // groupB.field_2 keeps its result from the previous run (state is cumulative)
      expect(res2.groups.groupB.field_2.testCount).toBe(1);
    });
  });

  describe('focus with combined options', () => {
    it('should support combining only and skipGroup in a single focus call', () => {
      const suite = vest.create(() => {
        vest.mode(vest.Modes.ALL);

        vest.group('groupA', () => {
          vest.test('field_1', () => false);
        });

        vest.group('groupB', () => {
          vest.test('field_2', () => false);
        });

        vest.test('field_3', () => false);
      });

      const res = suite.focus({ only: 'field_1', skipGroup: 'groupA' }).run();

      // field_1 is only'd, but groupA is skipped
      expect(res.groups.groupA.field_1.testCount).toBe(0);
      expect(res.groups.groupB.field_2.testCount).toBe(0);
      expect(res.tests.field_3.testCount).toBe(0);
    });
  });

  describe('with tests inside and outside the skipped group', () => {
    it('should only skip tests inside the group, not outside', () => {
      const suite = vest.create(() => {
        vest.mode(vest.Modes.ALL);

        vest.test('field_1', 'top level field_1', () => false);

        vest.group('groupA', () => {
          vest.test('field_1', 'groupA field_1', () => false);
          vest.test('field_2', 'groupA field_2', () => false);
        });

        vest.test('field_2', 'top level field_2', () => false);
      });

      const res = suite.focus({ skipGroup: 'groupA' }).run();

      // Top-level tests should run
      expect(res.tests.field_1.testCount).toBe(1);
      expect(res.tests.field_2.testCount).toBe(1);

      // Tests inside groupA should be skipped
      expect(res.groups.groupA.field_1.testCount).toBe(0);
      expect(res.groups.groupA.field_2.testCount).toBe(0);
    });
  });
});

describe('suite.focus: onlyGroup', () => {
  describe('single group & top level tests', () => {
    it('should run only tests in the specified group, skipping other groups and top-level tests', () => {
      const cb1 = vi.fn(() => false);
      const cb2 = vi.fn(() => false);
      const cb3 = vi.fn(() => false);
      const suite = vest.create(() => {
        vest.mode(vest.Modes.ALL);

        vest.group('groupA', () => vest.test('field_1', cb1));
        vest.group('groupB', () => vest.test('field_2', cb2));
        vest.test('field_3', cb3); // Top level test
      });

      const res = suite.focus({ onlyGroup: 'groupA' }).run();

      expect(res.groups.groupA.field_1.testCount).toBe(1);
      expect(res.groups['groupB']?.field_2?.testCount ?? 0).toBe(0);
      expect(res.tests.field_3?.testCount ?? 0).toBe(0); // Top level test must skip

      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).not.toHaveBeenCalled();
      expect(cb3).not.toHaveBeenCalled();
    });
  });

  describe('multiple groups', () => {
    it('should run tests in all specified groups when passed as array', () => {
      const cb1 = vi.fn(() => false);
      const cb2 = vi.fn(() => false);
      const cb3 = vi.fn(() => false);
      const suite = vest.create(() => {
        vest.mode(vest.Modes.ALL);
        vest.group('groupA', () => vest.test('field_1', cb1));
        vest.group('groupB', () => vest.test('field_2', cb2));
        vest.group('groupC', () => vest.test('field_3', cb3));
      });

      const res = suite.focus({ onlyGroup: ['groupA', 'groupC'] }).run();

      expect(res.groups.groupA.field_1.testCount).toBe(1);
      expect(res.groups.groupC.field_3.testCount).toBe(1);
      expect(res.groups['groupB']?.field_2?.testCount ?? 0).toBe(0);

      expect(cb1).toHaveBeenCalledTimes(1);
      expect(cb2).not.toHaveBeenCalled();
      expect(cb3).toHaveBeenCalledTimes(1);
    });
  });

  describe('extensive top-level test exclusion', () => {
    it('should skip top-level tests even when they share the same field name as a test inside an onlyGroup', () => {
      const topCb = vi.fn(() => false);
      const groupCb = vi.fn(() => false);
      const suite = vest.create(() => {
        vest.mode(vest.Modes.ALL);

        // Same field name outside the group
        vest.test('shared_field', topCb);

        vest.group('groupA', () => {
          // Same field name inside the group
          vest.test('shared_field', groupCb);
        });
      });

      const res = suite.focus({ onlyGroup: 'groupA' }).run();

      expect(res.groups.groupA.shared_field.testCount).toBe(1);
      expect(res.tests.shared_field?.testCount ?? 0).toBe(1); // the group test gets aggregated here too, but we verify cb executions
      expect(topCb).not.toHaveBeenCalled();
      expect(groupCb).toHaveBeenCalledTimes(1);
    });

    it('should skip top-level tests even if `only` explicitly includes their field name', () => {
      const topCb = vi.fn(() => false);
      const groupCb = vi.fn(() => false);
      const suite = vest.create(() => {
        vest.mode(vest.Modes.ALL);

        vest.test('explicit_field', topCb);

        vest.group('groupA', () => {
          vest.test('explicit_field', groupCb);
        });
      });

      // field is only'd, but group restricts to 'groupA'
      // Top level test for explicit_field should STILL not run
      suite.focus({ only: 'explicit_field', onlyGroup: 'groupA' }).run();

      expect(topCb).not.toHaveBeenCalled();
      expect(groupCb).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Four-Way Scope Precedence: only, skip, onlyGroup, skipGroup', () => {
  it('should enforce that skip constraints (skip, skipGroup) strictly override include constraints (only, onlyGroup)', () => {
    const cbA1 = vi.fn(() => false);
    const cbA2 = vi.fn(() => false);
    const cbB1 = vi.fn(() => false);
    const cbB2 = vi.fn(() => false); // New callback for clarity
    const cbC1 = vi.fn(() => false);
    const cbTop = vi.fn(() => false);

    const suite = vest.create(() => {
      vest.mode(vest.Modes.ALL);

      // G_A is onlyGroup'd but also skipGroup'd -> skip overrides only
      vest.group('groupA', () => {
        vest.test('field_1', cbA1);
        vest.test('field_2', cbA2);
      });

      // G_B is onlyGroup'd. field_1 is only'd, field_2 is skip'd
      vest.group('groupB', () => {
        vest.test('field_1', cbB1);
        vest.test('field_2', cbB2); // Use separate callback
      });

      // G_C is not in onlyGroup -> should skip entirely
      vest.group('groupC', () => vest.test('field_1', cbC1));

      // Top level tests -> should skip because onlyGroup is active
      vest.test('field_1', cbTop);
    });

    const res = suite
      .focus({
        onlyGroup: ['groupA', 'groupB'],
        skipGroup: 'groupA',
        only: 'field_1',
        skip: 'field_2',
      })
      .run();

    // groupA skipped entirely due to skipGroup > onlyGroup
    expect(cbA1).not.toHaveBeenCalled();
    expect(cbA2).not.toHaveBeenCalled();

    // groupC skipped due to not being in onlyGroup
    expect(cbC1).not.toHaveBeenCalled();

    // top-level skipped due to onlyGroup
    expect(cbTop).not.toHaveBeenCalled();

    // groupB evaluation:
    // field_1 runs (onlyGroup matches, only matches)
    expect(res.groups.groupB.field_1.testCount).toBe(1);
    expect(cbB1).toHaveBeenCalledTimes(1);

    // field_2 skips (onlyGroup matches, but skip > only)
    expect(res.groups['groupB']?.field_2?.testCount ?? 0).toBe(0);
    expect(cbB2).not.toHaveBeenCalled();
  });
});
