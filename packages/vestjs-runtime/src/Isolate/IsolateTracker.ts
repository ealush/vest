import { TIsolate } from './IsolateTypes';
import { getTrackers } from '../VestRuntime';

/**
 * Adds an isolate to the refs registry of a node and all its ancestors.
 * Complexity: O(depth) where depth is the tree height.
 * Uses Set for O(1) per-node deduplication.
 * Iterative implementation to avoid stack overflow on deep trees.
 * @param node - The starting node to add refs to
 * @param type - The tracker type (e.g., 'Test')
 * @param item - The isolate to track
 */
export function add(node: TIsolate, type: string, item: TIsolate): void {
  let current: TIsolate | null = node;

  while (current) {
    current.refs = current.refs ?? {};

    if (!current.refs[type]) {
      current.refs[type] = new Set<TIsolate>();
    }

    // Set.add is O(1) and handles deduplication automatically
    current.refs[type].add(item);

    current = current.parent;
  }
}

/**
 * Bubbles tracked isolates from a child node to its parent.
 * Called when a child is added to a parent.
 * Complexity: O(T * depth) where T is the number of trackers.
 * @param node - The child node being added
 * @param parent - The parent node receiving the child
 */
export function bubble(node: TIsolate, parent: TIsolate): void {
  const trackers = getTrackers();

  for (const tracker of trackers) {
    bubbleTracker(node, parent, tracker);
  }
}

function bubbleTracker(
  node: TIsolate,
  parent: TIsolate,
  tracker: { type: string; predicate: (n: TIsolate) => boolean },
): void {
  if (tracker.predicate(node)) {
    add(parent, tracker.type, node);
  }

  const nodeRefs = node.refs?.[tracker.type];
  if (nodeRefs) {
    for (const child of nodeRefs) {
      add(parent, tracker.type, child);
    }
  }
}

/**
 * Gets the tracked isolates for a given type from a node.
 * Returns an array for API compatibility.
 * Complexity: O(N) where N is the number of tracked items.
 * @param node - The node to get tracked isolates from
 * @param type - The tracker type (e.g., 'Test')
 * @returns Array of tracked isolates
 */
export function getTracked<T extends TIsolate = TIsolate>(
  node: TIsolate,
  type: string,
): T[] {
  const refs = node.refs?.[type];
  return refs ? (Array.from(refs) as T[]) : [];
}

/**
 * Directly removes a specific isolate from the refs registry.
 * Complexity: O(1) - uses Set.delete directly.
 * Use this for single-item removal; use prune() for predicate-based removal.
 * @param root - The root node containing the refs
 * @param type - The tracker type (e.g., 'Test')
 * @param node - The specific isolate to remove
 * @returns true if the item was removed, false if not found
 */
export function remove(root: TIsolate, type: string, node: TIsolate): boolean {
  const refs = root.refs?.[type];

  if (!refs) {
    return false;
  }

  return refs.delete(node);
}

/**
 * Prunes (removes) tracked isolates that match a predicate.
 * Complexity: O(N) where N is the number of tracked items.
 * Encapsulates deletion logic to hide internal Set implementation.
 * @param root - The root node containing the refs
 * @param type - The tracker type (e.g., 'Test')
 * @param predicate - Function that returns true for items to remove
 */
export function prune(
  root: TIsolate,
  type: string,
  predicate: (node: TIsolate) => boolean,
): void {
  const refs = root.refs?.[type];

  if (!refs) {
    return;
  }

  for (const node of refs) {
    if (predicate(node)) {
      refs.delete(node);
    }
  }
}

/**
 * Walks over tracked isolates of a given type and calls a callback for each.
 * Complexity: O(N) where N is the number of tracked items.
 * @param root - The root node containing the refs
 * @param type - The tracker type (e.g., 'Test')
 * @param callback - Function called for each tracked isolate. Return false to break.
 */
export function walk<T extends TIsolate = TIsolate>(
  root: TIsolate,
  type: string,
  callback: (node: T) => void | boolean,
): void {
  const refs = root.refs?.[type];

  if (!refs) {
    return;
  }

  for (const node of refs) {
    const result = callback(node as T);
    if (result === false) {
      break;
    }
  }
}

/**
 * Reprocesses a tree to rebuild the refs from scratch.
 * Used for hydration when loading a serialized suite.
 * Complexity: O(N * T * depth) where N is total nodes, T is trackers.
 * @param root - The root of the tree to reprocess
 */
export function reprocessTree(root: TIsolate): void {
  const trackers = getTrackers();

  function walkNode(node: TIsolate): void {
    for (const tracker of trackers) {
      if (tracker.predicate(node)) {
        add(root, tracker.type, node);
      }
    }

    if (node.children) {
      for (const child of node.children) {
        walkNode(child);
      }
    }
  }

  walkNode(root);
}

// Legacy object export for backward compatibility
export const IsolateTracker = {
  add,
  bubble,
  getTracked,
  prune,
  remove,
  reprocessTree,
  walk,
};
