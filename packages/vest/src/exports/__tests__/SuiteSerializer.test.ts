import { SuiteSerializer } from 'SuiteSerializer';
import * as vest from 'vest';

describe('SuiteSerializer', () => {
  it('Should produce a valid serialized dump', () => {
    const suite = vest.create('suite_serialize_test', () => {
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
    suite();

    const serialized = SuiteSerializer.serialize(suite);
    expect(serialized).toMatchSnapshot();
  });
});

describe('suite.resume', () => {
  it('Should resume a suite from a serialized dump', () => {
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

    suite();
    suite.get();

    const serialized = SuiteSerializer.serialize(suite);

    const suite2 = vest.create(() => {});

    suite2();

    expect(suite.get()).not.toEqual(suite2.get());

    SuiteSerializer.resume(suite2, serialized);
    expect(suite.get()).isDeepCopyOf(suite2.get());

    expect(suite2.hasErrors()).toBe(true);
    expect(suite2.hasWarnings()).toBe(false);
    expect(suite2.get().tests.field_1).toBeDefined();

    suite2();
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

    it('Should continue with resumed state if matching', () => {
      const suite = vest.create('suite_resume_test', cb);

      suite({});

      const serialized = SuiteSerializer.serialize(suite);

      const suite2 = vest.create(cb);
      SuiteSerializer.resume(suite2, serialized);
      suite2({}, 'field_1');
      expect(suite2.getError('field_1')).toBe('field_1_message');
      expect(suite2.getError('field_2')).toBe('field_2_message');
    });

    describe('Sanity - suite should run as expected', () => {
      it('Should have correct state after resuming', () => {
        const suite = vest.create('suite_resume_test', cb);

        suite({});

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
