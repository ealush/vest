import { CB } from 'vest-utils';
import wait from 'wait';

import { Isolate } from 'Isolate';
import { VestRuntime } from 'vestjs-runtime';

describe('AsyncIsolate', () => {
  test('It should run bla bla', () => {
    return new Promise<void>(async done => {
      let root;
      const control = jest.fn();
      withRunTime(() => {
        // Create root isolate from which all others will be created
        root = Isolate.create('URoot', async () => {
          await wait(10);
          // Create first child isolate
          return withRunTime(() =>
            Isolate.create('UChild_1', () => {
              // Create three grandchildren
              Isolate.create('UGrandChild_1', () => {});
              Isolate.create('UGrandChild_2', () => {});
              Isolate.create('UGrandChild_3', () => {
                // When the last grandchild is created, call the control function
                control();
              });
            })
          );
        });
      });
      await wait(10);
      expect(control).toHaveBeenCalled();
      expect(root).toBeDefined();
      wait(100).then(() => {
        console.log(root);
        done();
      });
    });
  });
});

function withRunTime<T>(fn: CB<T>) {
  return VestRuntime.Run(VestRuntime.createRef({}), () => {
    return fn();
  });
}
