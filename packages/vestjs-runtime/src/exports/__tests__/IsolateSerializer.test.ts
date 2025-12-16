import { CB, isFailure } from 'vest-utils';
import { describe, it, expect, test } from 'vitest';

import { Isolate, TIsolate } from '../../Isolate/Isolate';
import { IsolateSerializer } from '../IsolateSerializer';
import {
  IRecociler,
  VestRuntime,
  IsolateStatus,
  IsolateMutator,
} from '../../vestjs-runtime';

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
              "status": "DONE",
            },
            {
              "$type": "UChild_2",
              "parent": [Circular],
              "status": "DONE",
            },
            {
              "$type": "UChild_3",
              "parent": [Circular],
              "status": "DONE",
            },
          ],
          "data": {
            "some_data": true,
          },
          "status": "DONE",
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

      root.status = IsolateStatus.PENDING;
      // @ts-ignore
      root.children[0].status = 'done';
      // @ts-ignore
      root.children[1].status = 'failed';

      const serialized = IsolateSerializer.serialize(
        root,
        (value: any, key: string) => {
          if (key === 'status' && value === IsolateStatus.PENDING) {
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

        root.status = IsolateStatus.PENDING;
        // @ts-ignore
        root.children[0].status = 'done';
        // @ts-ignore
        root.children[1].status = 'failed';

        const serialized = IsolateSerializer.serialize(root, v => v);
        const inflated = IsolateSerializer.deserialize(serialized);

        expect(inflated.status).toBe(IsolateStatus.PENDING);
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
                "status": "DONE",
              },
            ],
            "data": {
              "some_data": true,
            },
            "status": "PENDING",
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
              "status": "DONE",
            },
            {
              "$type": "UChild_2",
              "parent": [Circular],
              "status": "DONE",
            },
            {
              "$type": "UChild_3",
              "parent": [Circular],
              "status": "DONE",
            },
          ],
          "data": {
            "some_data": true,
          },
          "status": "DONE",
        }
      `);
    });
  });

  describe('Error handling', () => {
    it('Should return error result if deserialization fails', () => {
      const result = IsolateSerializer.safeDeserialize('invalid json');
      expect(isFailure(result)).toBe(true);
    });

    it('Should return empty string if isolate is null', () => {
      expect(IsolateSerializer.serialize(null, v => v)).toBe('');
    });
  });

  describe('Children with keys', () => {
    it('Should correctly handle children with keys during processing', () => {
      let serialized: string;
      withRunTime(() => {
        const root = Isolate.create('Root', () => {
          const child = Isolate.create('Child', () => {});
          IsolateMutator.setKey(child, 'some-key');
        });
        serialized = IsolateSerializer.serialize(root, v => v);
      });

      // @ts-ignore
      const inflated = IsolateSerializer.deserialize(serialized);
      // @ts-ignore
      expect(inflated.children[0].key).toBe('some-key');
      // @ts-ignore
      expect(inflated.keys['some-key']).toBeDefined();
    });
  });

  describe('Security Scenarios', () => {
    it('Should ignore malicious prototype keys in serialized string', () => {
      // Manually constructed malicious string mimicking a serialized Isolate
      // but injecting a __proto__ key into the data object
      const maliciousJson = JSON.stringify([
        {
          $type: 'URoot',
          data: {
            __proto__: { isAdmin: true },
          },
        },
        {},
      ]);

      const inflated = IsolateSerializer.deserialize(maliciousJson);

      // Verify the object was deserialized
      expect(inflated).toBeDefined();

      // Verify pollution did not occur
      // @ts-ignore
      expect({}.isAdmin).toBeUndefined();

      // Verify the malicious key was stripped or ignored
      // @ts-ignore
      expect(inflated.data.__proto__).not.toEqual({ isAdmin: true });
    });

    it('Should strip unsafe keys during JSON parsing (reviver check)', () => {
      // Direct check against JSON.parse behvaior simulated via the serializer
      const json =
        '[{"$type":"URoot","__proto__":{"polluted":true},"valid":true}, {}]';

      const expanded = IsolateSerializer.deserialize(json);

      // Even if minifyObject handles it, we want to ensure the reviver did its job
      // or at least that the combination is safe.
      // Since deserialize calls expandNode -> JSON.parse(node, safeReviver)
      // The resulting object should immediately lack the key.

      // Note: we can't easily spy on the internal JSON.parse reviver without mocking,
      // but we can verify the end result is clean.
      expect(expanded).toBeDefined();
      // @ts-ignore
      expect(expanded.__proto__).not.toEqual({ polluted: true });
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
