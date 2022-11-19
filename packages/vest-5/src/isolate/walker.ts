/* eslint-disable complexity */
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

    if (broke) {
      return;
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

export function some(
  startNode: Isolate<unknown>,
  predicate: (node: Isolate<unknown>) => boolean,
  visitOnly?: IsolateTypes
): boolean {
  let hasMatch = false;
  walk(
    startNode,
    (node, breakout) => {
      if (predicate(node)) {
        breakout();
        hasMatch = true;
      }
    },
    visitOnly
  );

  return hasMatch;
}
