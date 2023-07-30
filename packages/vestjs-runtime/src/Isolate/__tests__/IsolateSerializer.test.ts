import { Isolate } from 'Isolate';
import { IsolateSerializer } from 'IsolateSerializer';
import { VestRuntime } from 'vestjs-runtime';

describe('IsolateSerializer', () => {
  it('Should produce serialized dump', () => {
    let serialized;
    withRunTime(() => {
      const root = Isolate.create(
        'URoot',
        () => {
          Isolate.create('UChild_1', () => {});
          Isolate.create('UChild_2', () => {});
          Isolate.create('UChild_3', () => {});
        },
        {
          some_data: true,
        }
      );

      serialized = IsolateSerializer.serialize(root);
    });

    expect(serialized).toMatchSnapshot();
  });
});

function withRunTime<T>(fn: CB<T>) {
  return VestRuntime.Run(VestRuntime.createRef({}), () => {
    return fn();
  });
}
