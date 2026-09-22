import { enforce } from 'n4s';
import { describe, it, expect } from 'vitest';

import { create, test } from '../../vest';

describe('enforce.record() in Vest', () => {
  it('validates record fields correctly in schema', () => {
    const schema = enforce.shape({
      name: enforce.isString(),
      settings: enforce.record(enforce.isBoolean()),
    });

    const suite = create(data => {
      test('name', () => {
        enforce(data.name).isNotEmpty();
      });
    }, schema);

    const result = suite.run({
      name: 'Alice',
      // @ts-expect-error - Invalid data: not all booleans
      settings: { darkMode: true, notifications: 'yes' },
    });

    expect(result.isValid()).toBe(false);
    expect(result.hasErrors('settings.notifications')).toBe(true);
  });

  it('works with focus modifiers when dropping entirely via focus', () => {
    const schema = enforce.shape({
      name: enforce.isString(),
      permissions: enforce.record(enforce.isBoolean()),
    });

    const suite = create(_data => {
      test('name', () => {});
    }, schema);

    const result = suite
      .focus({ only: 'name' })
      // @ts-expect-error - testing runtime with invalid value type
      .run({ name: '', permissions: { bad: 'value' } });

    // permissions.bad should not be validated because we focused on name
    expect(result.hasErrors('permissions.bad')).toBe(false);
    expect(result.isValid()).toBe(true);
  });

  it('propagates nested error paths to the result', () => {
    const schema = enforce.record(
      enforce.shape({
        active: enforce.isBoolean(),
      }),
    );

    const suite = create(data => {
      test('admin', () => {
        enforce(data.admin).isTruthy();
      });
    }, schema);

    const result = suite.run({
      admin: { active: true },
      // @ts-expect-error - testing runtime with invalid nested value
      editor: { active: 'yes' }, // invalid
    });

    // The top-level key is 'editor', meaning 'editor.active' should have a schema validation error.
    expect(result.hasErrors('editor.active')).toBe(true);
  });

  it('maintains parsed coerced types using .test() inside suite', () => {
    const schema = enforce.record(enforce.isNumeric().toNumber());

    const suite = create(data => {
      test('admin', () => {
        enforce(data.admin).isNumber();
      });
    }, schema);

    const result = suite.run({ admin: '42' });

    // Ensure the record values were actually coerced
    expect(result.isValid()).toBe(true);
    expect(result.value).toEqual({ admin: 42 });
    expect(typeof result.value?.admin).toBe('number');
  });

  it('works with key + value validation inside suite', () => {
    const schema = enforce.record(
      enforce.isString().matches(/^user_.+$/),
      enforce.isBoolean(),
    );

    const suite = create(() => {}, schema);

    // Incorrect key formatting
    const result = suite.run({ guest_1: true });
    expect(result.hasErrors('guest_1')).toBe(true);
    expect(result.isValid()).toBe(false);

    // Correct formatting
    const suite2 = create(_data => {
      test('user_1', () => {
        // Mock test ensuring the suite runs
      });
    }, schema);
    const result2 = suite2.run({ user_1: true });
    expect(result2.isValid()).toBe(true);
  });
});
