// Competing implementation: explicit graph storage via WeakMap instead of Symbol.for
// Different internal but same external API for Schema Relationships

export const COMPETING_RESOLVED = Symbol.for('vest:competingResolved');
export const COMPETING_UNRESOLVED = Symbol.for('vest:competingUnresolved');
export const COMPETING_ITEM = Symbol.for('vest:competingItem');

// Alternative: store graph in WeakMap for isolation (different from original Symbol.for approach)
const graphStore = new WeakMap<object, any>();

export function setCompetingGraph(target: object, graph: any) {
  graphStore.set(target, graph);
  (target as any)[COMPETING_RESOLVED] = graph;
}

export function getCompetingGraph(target: object): any {
  return graphStore.get(target) ?? (target as any)[COMPETING_RESOLVED];
}
