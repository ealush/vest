import { Maybe } from 'vest-utils';

import { Isolate, TIsolate } from 'Isolate';
import { MinifiedKeys } from 'IsolateKeys';
import { IsolateSerializer } from 'IsolateSerializer';
import { IsolateMutator, VestRuntime } from 'vestjs-runtime';

describe('IsolateSerializer', () => {
  describe('serialize', () => {
    it('Should produce serialized dump', () => {
      const { serialized } = createRoot();

      expect(serialized).toMatchSnapshot();
    });
  });

  describe('deserialize', () => {
    it('Should fully inflate the tree', () => {
      const { root, serialized } = createRoot();

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
              "parent": [Circular],
            },
            {
              "$type": "UChild_3",
              "parent": [Circular],
            },
          ],
          "data": {
            "some_data": true,
          },
        }
      `);
    });

    test('When data is empty, should not add data property', () => {
      const { serialized } = createRoot();
      const inflated = IsolateSerializer.deserialize(serialized);

      expect(inflated?.children?.[0]).toHaveProperty('data');
      expect(inflated?.children?.[1]).not.toHaveProperty('data');
      expect(inflated?.children?.[2]).not.toHaveProperty('data');
    });
  });

  describe('Custom Data Serialization', () => {
    it('Should serialize data with custom keys', () => {
      const { serialized } = createRoot({
        keys: {
          data: {
            some_data: 'sd',
          },
        },
      });

      const parsed = JSON.parse(serialized);
      expect(serialized).toMatchSnapshot();
    });

    describe('value serialization', () => {
      it('Should correctly expand values', () => {
        const { root } = createRoot();

        root.status = 'pending';
        // @ts-ignore
        root.children[0].status = 'done';
        // @ts-ignore
        root.children[1].status = 'failed';

        const minimap = {
          values: {
            status: {
              pending: 'p',
              done: 'd',
              failed: 'f',
            },
            $type: {
              URoot: 'UR',
              UChild_1: 'UC1',
              UChild_2: 'UC2',
              UChild_3: 'UC3',
            },
          },
        };

        const serialized = IsolateSerializer.serialize(root, minimap);
        const inflated = IsolateSerializer.deserialize(serialized, minimap);

        expect(inflated.status).toBe('pending');
        // @ts-ignore
        expect(inflated.children[0].status).toBe('done');
        // @ts-ignore
        expect(inflated.children[1].status).toBe('failed');
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
                "status": "done",
              },
              {
                "$type": "UChild_2",
                "parent": [Circular],
                "status": "failed",
              },
              {
                "$type": "UChild_3",
                "parent": [Circular],
              },
            ],
            "data": {
              "some_data": true,
            },
            "status": "pending",
          }
        `);
      });
    });

    it('Should inflate with correct keys', () => {
      const { serialized } = createRoot({
        keys: {
          data: {
            some_data: 'sd',
          },
        },
      });

      const inflated = IsolateSerializer.deserialize(serialized, {
        keys: {
          data: {
            some_data: 'sd',
          },
        },
      });

      expect(inflated.data.some_data).toBe(true);
      expect(inflated).not.toHaveProperty('sd');
      expect(inflated).toEqual(
        IsolateSerializer.deserialize(createRoot().serialized),
      );
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
              "parent": [Circular],
            },
            {
              "$type": "UChild_3",
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

function createRoot(miniMap: Maybe<Record<string, any>>) {
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
      },
    );

    serialized = IsolateSerializer.serialize(root, miniMap);
  });

  // @ts-ignore
  return { root, serialized };
}
