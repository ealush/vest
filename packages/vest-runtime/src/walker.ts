import { isNullish, optionalFunctionValue } from 'vest-utils';

import type { Isolate } from 'Isolate';

export type VisitOnlyPredicate = (isolate: Isolate) => boolean;

// eslint-disable-next-line complexity, max-statements
export function walk(
  startNode: Isolate,
  callback: (isolate: Isolate, breakout: () => void) => void,
  visitOnly?: VisitOnlyPredicate
): void {
  if (isNullish(startNode.children)) {
    return;
  }

  let broke = false;

  for (const isolate of startNode.children) {
    if (broke) {
      return;
    }

    if (isNullish(visitOnly) || optionalFunctionValue(visitOnly, isolate)) {
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
  visitOnly?: VisitOnlyPredicate
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

export function has(startNode: Isolate, match: VisitOnlyPredicate): boolean {
  return some(startNode, () => true, match);
}

export function find(
  startNode: Isolate,
  predicate: (node: Isolate) => boolean,
  visitOnly?: VisitOnlyPredicate
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
  visitOnly?: VisitOnlyPredicate
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

export function pluck(
  startNode: Isolate,
  predicate: (node: Isolate) => boolean,
  visitOnly?: VisitOnlyPredicate
): void {
  walk(
    startNode,
    node => {
      if (predicate(node) && node.parent) {
        node.parent.removeChild(node);
      }
    },
    visitOnly
  );
}

export function closest(
  startNode: Isolate,
  predicate: (node: Isolate) => boolean
): Isolate | null {
  let current = startNode;
  while (current.parent) {
    if (predicate(current)) {
      return current;
    }
    current = current.parent;
  }
  return null;
}

export function closestExists(
  startNode: Isolate,
  predicate: (node: Isolate) => boolean
): boolean {
  return !!closest(startNode, predicate);
}
