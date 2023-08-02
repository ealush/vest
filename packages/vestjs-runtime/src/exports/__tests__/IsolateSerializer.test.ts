import { ser } from 'vest/src/testUtils/suiteDummy';

import { Isolate, TIsolate } from 'Isolate';
import { IsolateSerializer } from 'IsolateSerializer';
import { VestRuntime } from 'vestjs-runtime';

describe('IsolateSerializer', () => {
  describe('serialize', () => {
    it('Should produce serialized dump', () => {
      const { serialized } = createSerialized();

      expect(serialized).toMatchSnapshot();
    });
  });

  describe('deserialize', () => {
    it('Should fully inflate the tree', () => {
      const { root, serialized } = createSerialized();

      const inflated = IsolateSerializer.deserialize(serialized);

      expect(inflated).toMatchInlineSnapshot(`
        {
          "$type": "URoot",
          "children": [
            {
              "$type": "UChild_1",
              "data": {
                "some_data": true,
              },
              "parent": [Circular],
            },
            {
              "$type": "UChild_2",
              "data": {},
              "parent": [Circular],
            },
            {
              "$type": "UChild_3",
              "data": {},
              "parent": [Circular],
            },
          ],
          "data": {
            "some_data": true,
          },
        }
      `);
    });
  });
});

function withRunTime<T>(fn: CB<T>) {
  return VestRuntime.Run(VestRuntime.createRef({}), () => {
    return fn();
  });
}

function createSerialized() {
  let serialized: string, root: TIsolate;

  withRunTime(() => {
    root = Isolate.create(
      'URoot',
      () => {
        Isolate.create('UChild_1', () => {}, { some_data: true });
        Isolate.create('UChild_2', () => {});
        Isolate.create('UChild_3', () => {});
      },
      {
        some_data: true,
      }
    );

    serialized = IsolateSerializer.serialize(root);
  });

  // @ts-ignore
  return { root, serialized };
}
