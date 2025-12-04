import { CB, Nullable, isNullish, dynamicValue } from 'vest-utils';

import { type TIsolate } from './Isolate/Isolate';
import { IsolateMutator } from './Isolate/IsolateMutator';

type VisitOnlyPredicate = (isolate: TIsolate) => boolean;

export function walk(
  startNode: TIsolate,
  callback: (isolate: TIsolate, breakout: CB<void>) => void,
  visitOnly?: VisitOnlyPredicate,
): void {
  if (!startNode) return;

  let broke = false;

  if (shouldVisit(startNode, visitOnly)) {
    callback(startNode, () => {
      broke = true;
    });
  }

  if (broke) return;

  if (startNode.children) {
    walkChildren(startNode.children, callback, visitOnly, () => (broke = true));
  }
}

function shouldVisit(node: TIsolate, visitOnly?: VisitOnlyPredicate): boolean {
  return isNullish(visitOnly) || dynamicValue(visitOnly, node);
}

function walkChildren(
  children: TIsolate[],
  callback: (isolate: TIsolate, breakout: CB<void>) => void,
  visitOnly: VisitOnlyPredicate | undefined,
  breakout: CB<void>,
): void {
  let broke = false;
  for (const isolate of children) {
    if (broke) return;

    walk(
      isolate,
      (child, innerBreakout) => {
        callback(child, () => {
          innerBreakout();
          breakout();
          broke = true;
        });
      },
      visitOnly,
    );
  }
}

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

// this function acts like find, but returns an array of all matching nodes
export function findAll(
  startNode: TIsolate,
  predicate: (node: TIsolate) => boolean,
  visitOnly?: VisitOnlyPredicate,
): TIsolate[] {
  const found: TIsolate[] = [];

  walk(
    startNode,
    node => {
      if (predicate(node)) {
        found.push(node);
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
export function closest<I extends TIsolate = TIsolate>(
  startNode: TIsolate,
  predicate: (node: TIsolate) => boolean,
): Nullable<I> {
  let current: Nullable<TIsolate> = startNode;
  do {
    if (predicate(current)) {
      return current as I;
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
