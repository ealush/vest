/* eslint-disable complexity */
import { Isolate, IsolateTypes } from 'IsolateTypes';

export function walk(
  startNode: Isolate,
  callback: (isolate: Isolate, breakout: () => void) => void,
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
  startNode: Isolate,
  predicate: (node: Isolate) => boolean,
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

export function has(startNode: Isolate, match: IsolateTypes): boolean {
  return some(startNode, () => true, match);
}

export function find(
  startNode: Isolate,
  predicate: (node: Isolate) => boolean,
  visitOnly?: IsolateTypes
): Isolate | null {
  let found = null;
  walk(
    startNode,
    (node, breakout) => {
      if (predicate(node)) {
        breakout();
        found = node;
      }
    },
    visitOnly
  );

  return found;
}

export function every(
  startNode: Isolate,
  predicate: (node: Isolate) => boolean,
  visitOnly?: IsolateTypes
): boolean {
  let hasMatch = true;
  walk(
    startNode,
    (node, breakout) => {
      if (!predicate(node)) {
        breakout();
        hasMatch = false;
      }
    },
    visitOnly
  );

  return hasMatch;
}
