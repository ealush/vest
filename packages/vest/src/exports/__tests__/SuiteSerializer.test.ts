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

  it('should only serialize failing and warning messages', async () => {
    const untestedMessage = 'untested_message_should_not_serialize';
    const pendingMessage = 'pending_message_should_not_serialize';
    const passingMessage = 'passing_message_should_not_serialize';
    const implicitPassingMessage =
      'implicit_passing_message_should_not_serialize';
    const failedMessage = 'failed_message_should_serialize';
    const warningMessage = 'warning_message_should_serialize';
    const implicitFailingMessage = 'implicit_failing_message_should_serialize';
    const asyncFailingMessage = 'async_failing_message_should_serialize';

    const suite = vest.create(() => {
      vest.skipWhen(true, () => {
        vest.test('untested_field', untestedMessage, () => false);
      });

      vest.test('pending_field', pendingMessage, async () => {
        await new Promise(resolve => setTimeout(resolve, 15));
      });

      vest.test('passing_field', passingMessage, () => true);

      vest.test('implicit_passing_field', () => {
        vest.enforce('Vest').message(implicitPassingMessage).isNotBlank();
      });

      vest.test('failed_field', failedMessage, () => false);

      vest.test('warning_field', warningMessage, () => {
        vest.warn();
        return false;
      });

      vest.test('implicit_failing_field', () => {
        vest.enforce('').message(implicitFailingMessage).isNotBlank();
      });

      vest.test('async_failing_field', async () => {
        await Promise.reject(asyncFailingMessage);
      });
    });

    const runPromise = suite.run();

    const serializedWhilePending = SuiteSerializer.serialize(suite);

    expect(serializedWhilePending).not.toContain(untestedMessage);
    expect(serializedWhilePending).not.toContain(pendingMessage);
    expect(serializedWhilePending).not.toContain(passingMessage);
    expect(serializedWhilePending).not.toContain(implicitPassingMessage);

    expect(serializedWhilePending).toContain(failedMessage);
    expect(serializedWhilePending).toContain(warningMessage);
    expect(serializedWhilePending).toContain(implicitFailingMessage);

    expect(serializedWhilePending).not.toContain(asyncFailingMessage);

    await runPromise;

    const serializedAfterDone = SuiteSerializer.serialize(suite);

    expect(serializedAfterDone).not.toContain(untestedMessage);
    expect(serializedAfterDone).not.toContain(pendingMessage);
    expect(serializedAfterDone).not.toContain(passingMessage);
    expect(serializedAfterDone).not.toContain(implicitPassingMessage);

    expect(serializedAfterDone).toContain(failedMessage);
    expect(serializedAfterDone).toContain(warningMessage);
    expect(serializedAfterDone).toContain(implicitFailingMessage);
    expect(serializedAfterDone).toContain(asyncFailingMessage);
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
