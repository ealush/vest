import { CB } from 'vest-utils';
import wait from 'wait';

import { Isolate, TIsolate } from 'Isolate';
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
          "allowReorder": undefined,
          "children": null,
          "data": {},
          "key": null,
          "keys": null,
          "output": Promise {},
          "parent": null,
          "status": "PENDING",
        }
      `);
      await wait(10);
      expect(root?.children?.[0]?.$type).toBe('UChild_1');
      expect(root?.children?.[0].parent).toBe(root);
      expect(root?.children?.[0]?.children?.[0]?.$type).toBe('UGrandChild_1');
      expect(root?.children?.[0]?.children?.[0].parent).toBe(
        root?.children?.[0]
      );
      expect(root?.children?.[0]?.children?.[1]?.$type).toBe('UGrandChild_2');
      expect(root?.children?.[0]?.children?.[1].parent).toBe(
        root?.children?.[0]
      );
      expect(root?.children?.[0]?.children?.[2]?.$type).toBe('UGrandChild_3');
      expect(root?.children?.[0]?.children?.[2].parent).toBe(
        root?.children?.[0]
      );
      expect(root).toMatchSnapshot();

      done();
    });
  });

  test('It should set the isolate state to pending', () => {
    return new Promise<void>(done => {
      let root = {} as TIsolate;
      withRunTime(() => {
        // Create root isolate from which all others will be created
        root = Isolate.create('URoot', genChildren);
      });
      expect(root).toMatchSnapshot();
      expect(root?.status).toBe('PENDING');
      done();
    });
  });

  it('should set the isolate state to done when complete', () => {
    return new Promise<void>(async done => {
      let root = {} as TIsolate;
      withRunTime(() => {
        // Create root isolate from which all others will be created
        root = Isolate.create('URoot', genChildren);
      });
      await wait(10);
      expect(root?.status).toBe('DONE');
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
    })
  );
}
