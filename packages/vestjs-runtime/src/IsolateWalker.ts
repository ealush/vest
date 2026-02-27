/**
 * Module: `src/IsolateWalker.ts`.
 *
 * Provides `IsolateWalker`-related runtime and type utilities used by `vestjs-runtime`.
 */
import {
  Nullable,
  isNullish,
  dynamicValue,
  Result,
  makeResult,
  isFailure,
} from 'vest-utils';

import { IsolateInspector } from './Isolate/IsolateInspector';
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
  callback: (isolate: TIsolate) => Result<void>,
  visitOnly?: VisitOnlyPredicate,
): Result<void> {
  if (!startNode) return makeResult.Ok(undefined);

  const stack = [startNode];

  while (stack.length > 0) {
    const node = stack.pop()!;

    const res = visit(node, visitOnly, callback);

    if (isFailure(res)) {
      return res;
    }

    if (node.children) {
      pushChildren(stack, node.children);
    }
  }

  return makeResult.Ok(undefined);
}

function visit(
  node: TIsolate,
  visitOnly: VisitOnlyPredicate | undefined,
  callback: (isolate: TIsolate) => Result<void>,
): Result<void> {
  if (shouldVisit(node, visitOnly)) {
    return callback(node);
  }
  return makeResult.Ok(undefined);
}

function pushChildren(stack: TIsolate[], children: TIsolate[]): void {
  for (let i = children.length - 1; i >= 0; i--) {
    stack.push(children[i]);
  }
}

function shouldVisit(node: TIsolate, visitOnly?: VisitOnlyPredicate): boolean {
  return isNullish(visitOnly) || dynamicValue(visitOnly, node);
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
  callback: (acc: T, isolate: TIsolate) => Result<T>,
  initialValue: T,
  visitOnly?: VisitOnlyPredicate,
): T {
  let acc = initialValue;

  walk(
    startNode,
    node => {
      const res = callback(acc, node);

      if (isFailure(res)) {
        return makeResult.Err(res.error);
      }
      acc = res.unwrap();
      return makeResult.Ok(undefined);
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
    node => {
      if (predicate(node)) {
        hasMatch = true;
        return makeResult.Err(undefined);
      }
      return makeResult.Ok(undefined);
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

  walk(
    startNode,
    node => {
      if (predicate(node)) {
        found = node;
        return makeResult.Err(undefined);
      }
      return makeResult.Ok(undefined);
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
      return makeResult.Ok(undefined);
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
    node => {
      if (!predicate(node)) {
        hasMatch = false;
        return makeResult.Err(undefined);
      }
      return makeResult.Ok(undefined);
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
      return makeResult.Ok(undefined);
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

/**
 * Traverses the tree and returns the first non-nullish value returned by the callback.
 * It optimizes traversal by only visiting nodes that have pending isolates or are pending themselves.
 */
export function mapFirst<T>(
  startNode: TIsolate,
  callback: (isolate: TIsolate, breakout: (value: T) => void) => void,
): T | null {
  const stack = [startNode];
  let result: { value: T } | null = null;
  const breakout = (value: T) => (result = { value });

  while (stack.length > 0) {
    if (result) {
      break;
    }

    const node = stack.pop()!;
    processNode(node, stack, callback, breakout);
  }

  return (result as { value: T } | null)?.value ?? null;
}

function processNode<T>(
  node: TIsolate,
  stack: TIsolate[],
  callback: (isolate: TIsolate, breakout: (value: T) => void) => void,
  breakout: (value: T) => void,
): void {
  if (!IsolateInspector.hasPending(node)) {
    return;
  }

  runCallback(node, callback, breakout);

  if (node.children) {
    pushChildren(stack, node.children);
  }
}

function runCallback<T>(
  node: TIsolate,
  callback: (isolate: TIsolate, breakout: (value: T) => void) => void,
  breakout: (value: T) => void,
): void {
  if (IsolateInspector.isPending(node)) {
    callback(node, breakout);
  }
}
