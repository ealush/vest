import { Maybe } from 'vest-utils';

import { Isolate, TIsolate } from 'Isolate';
import { MinifiedKeys } from 'IsolateKeys';
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
      const { serialized } = createSerialized();
      const inflated = IsolateSerializer.deserialize(serialized);

      expect(inflated?.children?.[0]).toHaveProperty('data');
      expect(inflated?.children?.[1]).not.toHaveProperty('data');
      expect(inflated?.children?.[2]).not.toHaveProperty('data');
    });
  });

  describe('Custom Data Serialization', () => {
    it('Should serialize data with custom keys', () => {
      const { serialized } = createSerialized({
        some_data: 'sd',
      });

      const parsed = JSON.parse(serialized);
      expect(parsed[MinifiedKeys.Data]).toHaveProperty('sd');
      expect(serialized).toMatchInlineSnapshot(
        `"{"C":[{"D":{"sd":true},"$":"UChild_1"},{"$":"UChild_2"},{"$":"UChild_3"}],"D":{"sd":true},"$":"URoot"}"`
      );
    });

    it('Should inflate with correct keys', () => {
      const { serialized } = createSerialized({
        some_data: 'sd',
      });

      const inflated = IsolateSerializer.deserialize(serialized, {
        some_data: 'sd',
      });

      expect(inflated.data.some_data).toBe(true);
      expect(inflated).not.toHaveProperty('sd');
      expect(inflated).toEqual(
        IsolateSerializer.deserialize(createSerialized().serialized)
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

function createSerialized(miniMap: Maybe<Record<string, string>>) {
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

    serialized = IsolateSerializer.serialize(root, miniMap);
  });

  // @ts-ignore
  return { root, serialized };
}
