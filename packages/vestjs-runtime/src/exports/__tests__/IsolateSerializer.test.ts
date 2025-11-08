import { CB } from 'vest-utils';
import { describe, it, expect, test } from 'vitest';

import { Isolate, TIsolate } from 'Isolate';
import { IsolateSerializer } from 'IsolateSerializer';
import { IRecociler, VestRuntime } from 'vestjs-runtime';

describe('IsolateSerializer', () => {
  describe('serialize', () => {
    it('Should produce serialized dump', () => {
      const { serialized } = createRoot();

      expect(serialized).toMatchSnapshot();
    });
  });

  describe('deserialize', () => {
    it('Should fully inflate the tree', () => {
      const { serialized } = createRoot();

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
      const { serialized } = createRoot();

      expect(serialized).toMatchSnapshot();
    });

    it('Should take a replacer param', () => {
      const { root } = createRoot();

      root.status = 'pending';
      // @ts-ignore
      root.children[0].status = 'done';
      // @ts-ignore
      root.children[1].status = 'failed';

      const serialized = IsolateSerializer.serialize(
        root,
        (value: any, key: string) => {
          if (key === 'status' && value === 'pending') {
            return 'incomplete';
          }

          return value;
        },
      );

      const inflated = IsolateSerializer.deserialize(serialized);

      expect(inflated.status).toBe('incomplete');
      // @ts-ignore
      expect(inflated.children[0].status).toBe('done');
      // @ts-ignore
      expect(inflated.children[1].status).toBe('failed');
    });

    describe('value serialization', () => {
      it('Should correctly expand values', () => {
        const { root } = createRoot();

        root.status = 'pending';
        // @ts-ignore
        root.children[0].status = 'done';
        // @ts-ignore
        root.children[1].status = 'failed';

        const serialized = IsolateSerializer.serialize(root, v => v);
        const inflated = IsolateSerializer.deserialize(serialized);

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
      const { serialized } = createRoot();

      const inflated = IsolateSerializer.deserialize(serialized);

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
  return VestRuntime.Run(
    VestRuntime.createRef({} as IRecociler, v => v),
    () => {
      return fn();
    },
  );
}

function createRoot(replacer: (_value: any, _key: string) => any = v => v) {
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

    serialized = IsolateSerializer.serialize(root, replacer);
  });

  // @ts-ignore
  return { root, serialized };
}
