import { CB, Nullable, isNullish, optionalFunctionValue } from 'vest-utils';

import { type TIsolate } from 'Isolate';
import { IsolateMutator } from 'IsolateMutator';

type VisitOnlyPredicate = (isolate: TIsolate) => boolean;

// eslint-disable-next-line
export function walk(
  startNode: TIsolate,
  callback: (isolate: TIsolate, breakout: CB<void>) => void,
  visitOnly?: VisitOnlyPredicate,
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

    // Recursively walk through the child Isolate object.
    walk(
      isolate,
      (child, innerBreakout) => {
        callback(child, () => {
          innerBreakout();
          breakout();
        });
      },
      visitOnly,
    );

    // If the breakout function has been called, stop the walk.
    if (broke) {
      return;
    }
    // If visitOnly is not provided or the predicate is satisfied, call the callback function.
    if (isNullish(visitOnly) || optionalFunctionValue(visitOnly, isolate)) {
      callback(isolate, breakout);
    }
  }

  function breakout() {
    broke = true;
  }
}

// This function is a combination of walk and reduce. It traverses the tree and calls the callback function for each Isolate object.
// It then returns the accumulated/processed value.

export function reduce<T>(
  startNode: TIsolate,
  callback: (acc: T, isolate: TIsolate, breakout: CB<void>) => T,
  initialValue: T,
  visitOnly?: VisitOnlyPredicate,
): T {
  let acc = initialValue;

  walk(
    startNode,
    (node, breakout) => {
      acc = callback(acc, node, breakout);
    },
    visitOnly,
  );

  return acc;
}

// This function returns true if the given predicate function returns true for any Isolate object in the tree.
// If visitOnly is provided, only Isolate objects that satisfy the predicate are visited.
export function some(
  startNode: TIsolate,
  predicate: (node: TIsolate) => boolean,
  visitOnly?: VisitOnlyPredicate,
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
    visitOnly,
  );

  return hasMatch;
}

// This function returns true if the given predicate function returns true for any Isolate object in the tree.
// If visitOnly is provided, only Isolate objects that satisfy the predicate are visited.
export function has(startNode: TIsolate, match: VisitOnlyPredicate): boolean {
  return some(startNode, () => true, match);
}

// traverses up to a parent node that satisfies the predicate
// and returns the first direct descendant that satisfies the predicate
export function findClosest<I extends TIsolate = TIsolate>(
  startNode: TIsolate,
  predicate: (node: TIsolate) => boolean,
): Nullable<I> {
  let found: Nullable<TIsolate> = null;
  let current: Nullable<TIsolate> = startNode;

  while (current) {
    found = current.children?.find(predicate) ?? null;

    if (found) {
      break;
    }

    current = current.parent;
  }

  return found as Nullable<I>;
}

// This function returns the first Isolate object in the tree that satisfies the given predicate function.
// If visitOnly is provided, only Isolate objects that satisfy the predicate are visited.
export function find(
  startNode: TIsolate,
  predicate: (node: TIsolate) => boolean,
  visitOnly?: VisitOnlyPredicate,
): Nullable<TIsolate> {
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
    visitOnly,
  );

  return found;
}

// This function returns true if the given predicate function returns true for every Isolate object in the tree.
// If visitOnly is provided, only Isolate objects that satisfy the predicate are visited.
export function every(
  startNode: TIsolate,
  predicate: (node: TIsolate) => boolean,
  visitOnly?: VisitOnlyPredicate,
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
    visitOnly,
  );

  return hasMatch;
}

// This function removes all Isolate objects in the tree that
// satisfy the given predicate function and have a parent.
// If visitOnly is provided, only Isolate objects that satisfy the predicate are visited.
export function pluck(
  startNode: TIsolate,
  predicate: (node: TIsolate) => boolean,
  visitOnly?: VisitOnlyPredicate,
): void {
  walk(
    startNode,
    node => {
      if (predicate(node) && node.parent) {
        IsolateMutator.removeChild(node.parent, node);
      }
    },
    visitOnly,
  );
}

// Returns the closest ancestor Isolate object of the given
//startNode that satisfies the given predicate function.
export function closest(
  startNode: TIsolate,
  predicate: (node: TIsolate) => boolean,
): Nullable<TIsolate> {
  let current: Nullable<TIsolate> = startNode;
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
  startNode: TIsolate,
  predicate: (node: TIsolate) => boolean,
): boolean {
  return !!closest(startNode, predicate);
}
