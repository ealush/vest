/** Internal metadata shared by rule construction and selective execution. */
export const UNRESOLVED_DEPS = Symbol.for('vest:unresolvedDeps');
export const RESOLVED_RELATIONSHIPS = Symbol.for('vest:resolvedRelationships');
export const ITEM_SCHEMA = Symbol.for('vest:itemSchema');
export const COMPOSITION_CHILDREN = Symbol.for('vest:compositionChildren');
export const CHAIN_INFO = Symbol.for('vest:chainInfo');
export const CHAIN_BASELINE = Symbol.for('vest:chainBaseline');
export const PARTIAL_LIKE = Symbol.for('vest:partialLike');
export const OPTIONAL_RULE = Symbol.for('vest:optionalRule');
export const ITEM_CONTAINER = Symbol.for('vest:itemContainer');

export type ChainInfo = {
  readonly length: number;
  readonly hasMessage: boolean;
};

export type ChainBaseline = {
  readonly length: number;
  readonly hasMessage: boolean;
  readonly inner?: unknown;
};

export type ItemContainerKind = 'array' | 'record';

function slotOf(rule: unknown, slot: symbol): unknown {
  if (rule === null) return undefined;
  const kind = typeof rule;
  if (kind !== 'object' && kind !== 'function') return undefined;
  return (rule as Record<symbol, unknown>)[slot];
}

export function hasChainBaseline(rule: unknown): boolean {
  return slotOf(rule, CHAIN_BASELINE) !== undefined;
}

export function chainBaselineMatches(rule: unknown): boolean {
  const baseline = slotOf(rule, CHAIN_BASELINE) as ChainBaseline | undefined;
  const current = slotOf(rule, CHAIN_INFO) as ChainInfo | undefined;
  if (baseline === undefined || current === undefined) return false;
  if (!sameChainState(current, baseline)) return false;
  if (baseline.inner === undefined) return true;
  return chainBaselineMatches(baseline.inner);
}

function sameChainState(current: ChainInfo, baseline: ChainBaseline): boolean {
  return (
    current.length === baseline.length &&
    current.hasMessage === baseline.hasMessage
  );
}
