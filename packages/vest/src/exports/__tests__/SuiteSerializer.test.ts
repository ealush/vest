import { describe, it, expect, expectTypeOf } from 'vitest';

import { SuiteSerializer } from '../SuiteSerializer';
import * as vest from '../../vest';

describe('SuiteSerializer', () => {
  it('should produce a valid serialized dump', () => {
    const suite = vest.create(() => {
      vest.only('field_1');

      vest.test('field_1', 'field_1_message', () => false);
      vest.test('field_2', 'field_2_message', () => false);

      vest.group('group_1', () => {
        vest.test('field_3', 'field_3_message_1', () => false);
        vest.test('field_3', 'field_3_message_2', () => false);
        vest.test('field_4', 'field_4_message', () => false);
      });

      vest.skipWhen(false, () => {
        vest.test('field_5', 'field_5_message', () => false);
      });
    });
    suite.run();

    const serialized = SuiteSerializer.serialize(suite);
    expect(serialized).toMatchSnapshot();
  });

  it('should strip message from passing tests only', () => {
    const suite = vest.create(() => {
      vest.test('passing_field', 'passing_field_message', () => true);
      vest.test('failing_field', 'failing_field_message', () => false);
    });

    suite.run();

    const serialized = SuiteSerializer.serialize(suite);
    const parsed = SuiteSerializer.deserialize(serialized);

    expect(parsed.children).toBeDefined();

    const testChildren = parsed.children?.filter(child => child.data.fieldName);
    expect(testChildren).toHaveLength(2);

    const passingTest = testChildren?.find(
      child => child.data.fieldName === 'passing_field',
    );
    const failingTest = testChildren?.find(
      child => child.data.fieldName === 'failing_field',
    );

    expect(passingTest).toBeDefined();
    expect(failingTest).toBeDefined();
    expect(passingTest?.data).not.toHaveProperty('message');
    expect(failingTest?.data.message).toBe('failing_field_message');
  });
});

describe('suite.resume', () => {
  it('should resume a suite from a serialized dump', () => {
    const suite = vest.create(() => {
      vest.only('field_1');

      vest.test('field_1', 'field_1_message', () => false);
      vest.test('field_2', 'field_2_message', () => false);

      vest.group('group_1', () => {
        vest.test('field_3', 'field_3_message_1', () => false);
        vest.test('field_3', 'field_3_message_2', () => false);
        vest.test('field_4', 'field_4_message', () => false);
      });

      vest.skipWhen(false, () => {
        vest.test('field_5', 'field_5_message', () => false);
      });
    });

    suite.run();

    const serialized = SuiteSerializer.serialize(suite);

    const suite2 = vest.create(() => {});

    suite2.run();

    expect(suite.get()).not.toEqual(suite2.get());

    SuiteSerializer.resume(suite2, serialized);
    expect(suite.get()).isDeepCopyOf(suite2.get());

    expect(suite2.hasErrors()).toBe(true);
    expect(suite2.hasWarnings()).toBe(false);
    expect(suite2.get().tests.field_1).toBeDefined();

    suite2.run();
    expect(suite.get()).not.toEqual(suite2.get());
    expect(suite2.hasErrors()).toBe(false);
    expect(suite2.hasWarnings()).toBe(false);
    expect(suite2.get().tests.field_1).toBeUndefined();
  });

  describe('Running the suite after resuming', () => {
    function cb(data: Record<string, any>, only?: string) {
      vest.only(only);

      vest.test('field_1', 'field_1_message', () => {
        vest.enforce(data.field_1).isNotBlank();
      });
      vest.test('field_2', 'field_2_message', () => {
        vest.enforce(data.field_2).isNotBlank();
      });
    }

    it('should continue with resumed state if the data matches', () => {
      const suite = vest.create(cb);

      suite.run({});

      const serialized = SuiteSerializer.serialize(suite);

      const suite2 = vest.create(cb);
      SuiteSerializer.resume(suite2, serialized);
      suite2.run({}, 'field_1');
      expect(suite2.getError('field_1')).toBe('field_1_message');
      expect(suite2.getError('field_2')).toBe('field_2_message');
    });

    describe('sanity - suite should run as expected', () => {
      it('should have the correct state after resuming', () => {
        const suite = vest.create(cb);

        suite.run({});

        const serialized = SuiteSerializer.serialize(suite);

        const suite2 = vest.create(cb);

        SuiteSerializer.resume(suite2, serialized);

        expect(suite2.getError('field_1')).toBe('field_1_message');
        expect(suite2.getError('field_2')).toBe('field_2_message');

        expect(suite2.getErrors()).toMatchSnapshot();
      });
    });
  });
});

describe('SuiteSerializer type-compatibility', () => {
  it('accepts schema-typed suites in resume()', () => {
    const schema = vest.enforce.shape({
      username: vest.enforce.isString(),
    });

    const suite = vest.create(data => {
      vest.test('username', () => {
        vest.enforce(data.username).isNotBlank();
      });
    }, schema);

    suite.run({ username: '' });

    const serialized = SuiteSerializer.serialize(suite);

    const suite2 = vest.create(data => {
      vest.test('username', () => {
        vest.enforce(data.username).isNotBlank();
      });
    }, schema);

    expectTypeOf(SuiteSerializer.resume).toBeFunction();
    SuiteSerializer.resume(suite2, serialized);
    expect(suite2.hasErrors('username')).toBe(true);
  });
});
