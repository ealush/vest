import { Isolate, IsolateTypes } from 'isolateTypes';

export function walk(
  startNode: Isolate<unknown>,
  callback: (isolate: Isolate<unknown>, breakout: () => void) => void,
  visitOnly?: IsolateTypes
): void {
  let broke = false;

  for (const isolate of startNode.children) {
    if (broke) {
      return;
    }

    if (!visitOnly || isolate.type === visitOnly) {
      callback(isolate, breakout);
    }

    walk(
      isolate,
      (child, innerBreakout) => {
        callback(child, () => {
          innerBreakout();
          breakout();
        });
      },
      visitOnly
    );
  }

  function breakout() {
    broke = true;
  }
}
