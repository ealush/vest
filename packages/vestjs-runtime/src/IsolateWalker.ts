import { CB, Nullable, isNullish, dynamicValue } from 'vest-utils';

import { type TIsolate } from './Isolate/Isolate';
import { IsolateMutator } from './Isolate/IsolateMutator';

type VisitOnlyPredicate = (isolate: TIsolate) => boolean;

/**
 * Walks the isolate tree starting from the given node.
 * @param startNode - The starting node for the traversal.
 * @param callback - The callback function to be called for each visited node.
 * @param visitOnly - Optional predicate to filter which nodes to visit.
 */
export function walk(
  startNode: TIsolate,
  callback: (isolate: TIsolate, breakout: CB<void>) => void,
  visitOnly?: VisitOnlyPredicate,
): void {
  if (!startNode) return;

  let broke = false;

  if (startNode.children) {
    walkChildren(startNode.children, callback, visitOnly, () => (broke = true));
  }

  if (broke) return;

  if (shouldVisit(startNode, visitOnly)) {
    callback(startNode, () => {
      broke = true;
    });
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

/**
 * Reduces the isolate tree to a single value.
 * @param startNode - The starting node for the traversal.
 * @param callback - The reducer function.
 * @param initialValue - The initial value for the accumulator.
 * @param visitOnly - Optional predicate to filter which nodes to visit.
 * @returns The final accumulated value.
 */
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

/**
 * Checks if any node in the tree satisfies the predicate.
 * @param startNode - The starting node for the traversal.
 * @param predicate - The predicate function to test each node.
 * @param visitOnly - Optional predicate to filter which nodes to visit.
 * @returns True if any node satisfies the predicate, false otherwise.
 */
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

/**
 * Checks if the tree contains a node that matches the predicate.
 * @param startNode - The starting node for the traversal.
 * @param match - The predicate function to match nodes.
 * @returns True if a matching node is found, false otherwise.
 */
export function has(startNode: TIsolate, match: VisitOnlyPredicate): boolean {
  return some(startNode, () => true, match);
}

/**
 * Traverses up the tree to find the closest ancestor that satisfies the predicate,
 * then returns the first direct descendant of that ancestor that satisfies the predicate.
 * @param startNode - The starting node.
 * @param predicate - The predicate to match.
 * @returns The found node or null.
 */
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

/**
 * Finds the first node in the tree that satisfies the predicate.
 * @param startNode - The starting node.
 * @param predicate - The predicate to match.
 * @param visitOnly - Optional predicate to filter which nodes to visit.
 * @returns The found node or null.
 */
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

/**
 * Finds all nodes in the tree that satisfy the predicate.
 * @param startNode - The starting node.
 * @param predicate - The predicate to match.
 * @param visitOnly - Optional predicate to filter which nodes to visit.
 * @returns An array of found nodes.
 */
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

/**
 * Checks if every node in the tree satisfies the predicate.
 * @param startNode - The starting node.
 * @param predicate - The predicate to match.
 * @param visitOnly - Optional predicate to filter which nodes to visit.
 * @returns True if all nodes satisfy the predicate, false otherwise.
 */
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

/**
 * Removes nodes from the tree that satisfy the predicate.
 * @param startNode - The starting node.
 * @param predicate - The predicate to match nodes to remove.
 * @param visitOnly - Optional predicate to filter which nodes to visit.
 */
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

/**
 * Finds the closest ancestor of the startNode that satisfies the predicate.
 * @param startNode - The starting node.
 * @param predicate - The predicate to match.
 * @returns The found ancestor or null.
 */
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

/**
 * Checks if an ancestor satisfying the predicate exists.
 * @param startNode - The starting node.
 * @param predicate - The predicate to match.
 * @returns True if such an ancestor exists, false otherwise.
 */
export function closestExists(
  startNode: TIsolate,
  predicate: (node: TIsolate) => boolean,
): boolean {
  return !!closest(startNode, predicate);
}
