import { isNullish, optionalFunctionValue } from 'vest-utils';

import { type Isolate } from 'Isolate';
import { IsolateMutator } from 'IsolateMutator';

type VisitOnlyPredicate = (isolate: Isolate) => boolean;

// eslint-disable-next-line
export function walk(
  startNode: Isolate,
  callback: (isolate: Isolate, breakout: () => void) => void,
  visitOnly?: VisitOnlyPredicate
): void {
  // If the startNode has no children, there is nothing to walk.
  if (isNullish(startNode.children)) {
    return;
  }

  let broke = false;

  // For each child Isolate object, call the callback function.
  for (const isolate of startNode.children) {
    if (broke) {
      return;
    }

    // If visitOnly is not provided or the predicate is satisfied, call the callback function.
    if (isNullish(visitOnly) || optionalFunctionValue(visitOnly, isolate)) {
      callback(isolate, breakout);
    }

    // If the breakout function has been called, stop the walk.
    if (broke) {
      return;
    }

    // Recursively walk through the child Isolate object.
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

// This function returns true if the given predicate function returns true for any Isolate object in the tree.
// If visitOnly is provided, only Isolate objects that satisfy the predicate are visited.
export function some(
  startNode: Isolate,
  predicate: (node: Isolate) => boolean,
  visitOnly?: VisitOnlyPredicate
): boolean {
  let hasMatch = false;

  // Call the walk function with a callback function that sets hasMatch to true if the predicate is satisfied.
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

// This function returns true if the given predicate function returns true for any Isolate object in the tree.
// If visitOnly is provided, only Isolate objects that satisfy the predicate are visited.
export function has(startNode: Isolate, match: VisitOnlyPredicate): boolean {
  return some(startNode, () => true, match);
}

// This function returns the first Isolate object in the tree that satisfies the given predicate function.
// If visitOnly is provided, only Isolate objects that satisfy the predicate are visited.
export function find(
  startNode: Isolate,
  predicate: (node: Isolate) => boolean,
  visitOnly?: VisitOnlyPredicate
): Isolate | null {
  let found = null;

  // Call the walk function with a callback function that sets found to the current node if the predicate is satisfied.
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

// This function returns true if the given predicate function returns true for every Isolate object in the tree.
// If visitOnly is provided, only Isolate objects that satisfy the predicate are visited.
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

// This function removes all Isolate objects in the tree that
// satisfy the given predicate function and have a parent.
// If visitOnly is provided, only Isolate objects that satisfy the predicate are visited.
export function pluck(
  startNode: Isolate,
  predicate: (node: Isolate) => boolean,
  visitOnly?: VisitOnlyPredicate
): void {
  walk(
    startNode,
    node => {
      if (predicate(node) && node.parent) {
        IsolateMutator.removeChild(node.parent, node);
      }
    },
    visitOnly
  );
}

// Returns the closest ancestor Isolate object of the given
//startNode that satisfies the given predicate function.
export function closest(
  startNode: Isolate,
  predicate: (node: Isolate) => boolean
): Isolate | null {
  let current: Isolate | null = startNode;
  do {
    if (predicate(current)) {
      return current;
    }
    current = current.parent;
  } while (current);
  return null;
}

// This function returns true if the closest ancestor Isolates of the
// given startNode that satisfies the given predicate function exists.
export function closestExists(
  startNode: Isolate,
  predicate: (node: Isolate) => boolean
): boolean {
  return !!closest(startNode, predicate);
}
