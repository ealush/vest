import { useBus } from 'Bus';
import { Isolate, TIsolate } from 'Isolate';
import { RuntimeEvents } from 'RuntimeEvents';
import { CB } from 'vest-utils';
import { describe, vi, it, expect, test } from 'vitest';
import wait from 'wait';

import { VestRuntime } from 'vestjs-runtime';

describe('AsyncIsolate', () => {
  test('It should resolve async isolate into the parent', () => {
    return new Promise<void>(async done => {
      let root = {} as TIsolate;
      withRunTime(() => {
        // Create root isolate from which all others will be created
        root = Isolate.create('URoot', genChildren);
      });
      expect(root).toMatchInlineSnapshot(`
        {
          "$type": "URoot",
          "abortController": AbortController {},
          "allowReorder": undefined,
          "children": null,
          "data": {},
          "key": null,
          "keys": null,
          "output": Promise {},
          "parent": null,
        }
      `);
      await wait(10);
      expect(root?.children?.[0]?.$type).toBe('UChild_1');
      expect(root?.children?.[0].parent).toBe(root);
      expect(root?.children?.[0]?.children?.[0]?.$type).toBe('UGrandChild_1');
      expect(root?.children?.[0]?.children?.[0].parent).toBe(
        root?.children?.[0],
      );
      expect(root?.children?.[0]?.children?.[1]?.$type).toBe('UGrandChild_2');
      expect(root?.children?.[0]?.children?.[1].parent).toBe(
        root?.children?.[0],
      );
      expect(root?.children?.[0]?.children?.[2]?.$type).toBe('UGrandChild_3');
      expect(root?.children?.[0]?.children?.[2].parent).toBe(
        root?.children?.[0],
      );
      expect(root).toMatchSnapshot();

      done();
    });
  });

  it('Should emit an event when an async isolate is done running', () => {
    const cb = vi.fn();
    return new Promise<void>(async done => {
      let child = {} as TIsolate;
      withRunTime(() => {
        // Create root isolate from which all others will be created
        Isolate.create('URoot', () => {
          const bus = useBus();
          bus.on(RuntimeEvents.ISOLATE_DONE, cb);

          expect(cb).not.toHaveBeenCalled();
          child = Isolate.create('UChild_1', async () => {
            await wait(10);
          });
          expect(cb).not.toHaveBeenCalled();
        });
      });
      expect(cb).not.toHaveBeenCalledWith(child);
      await wait(10);
      expect(cb).toHaveBeenCalledWith(child);
      done();
    });
  });
});

function withRunTime<T>(fn: CB<T>) {
  return VestRuntime.Run(VestRuntime.createRef({}), () => {
    return fn();
  });
}

async function genChildren() {
  await wait(10);
  // Create first child isolate
  return withRunTime(() =>
    Isolate.create('UChild_1', () => {
      // Create three grandchildren
      Isolate.create('UGrandChild_1', () => {});
      Isolate.create('UGrandChild_2', () => {});
      Isolate.create('UGrandChild_3', () => {});
    }),
  );
}
