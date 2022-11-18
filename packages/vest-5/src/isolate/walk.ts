import { Isolate } from 'isolateTypes';

export function walk(
  startNode: Isolate<unknown>,
  callback: (isolate: Isolate<unknown>, breakout: () => void) => void
): void {
  let broke = false;

  for (const isolate of startNode.children) {
    if (broke) {
      return;
    }

    callback(isolate, breakout);
  }

  function breakout() {
    broke = true;
  }
}
