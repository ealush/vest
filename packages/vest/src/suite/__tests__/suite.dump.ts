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

    const dump = suite.dump();
    expect(dump).toMatchSnapshot();
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

    const dump = suite.dump();

    const suite2 = vest.create(() => {});

    suite2();

    expect(suite.get()).not.toEqual(suite2.get());

    suite2.resume(dump);

    expect(suite.get()).isDeepCopyOf(suite2.get());

    suite2();
    expect(suite.get()).not.toEqual(suite2.get());
  });
});
