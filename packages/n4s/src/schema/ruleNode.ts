/**
 * Runtime predicate for n4s rule nodes.
 *
 * Most lazy rules are proxy-backed objects, while `compose()` deliberately
 * returns a callable function. Graph traversal must treat both forms as rule
 * nodes; `vest-utils/isObject` intentionally covers objects only.
 */
export function isRuleNode(value: unknown): value is object {
  return (
    value !== null && (typeof value === 'object' || typeof value === 'function')
  );
}
