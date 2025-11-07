import type { Predicate } from './chainExecutor';

const lazyRegistry: Record<string, (...args: any[]) => Predicate> = {};

export function registerLazyRule(
  name: string,
  builder: (...args: any[]) => Predicate,
) {
  lazyRegistry[name] = builder;
}

export function getLazyRule(name: string): ((...args: any[]) => Predicate) | undefined {
  return lazyRegistry[name];
}
