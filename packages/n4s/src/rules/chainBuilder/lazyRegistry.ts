import type { Predicate } from './chainExecutor';

type LazyRule = {
  readonly build: (args: readonly unknown[]) => Predicate;
  readonly mapsValue: boolean;
};

const lazyRegistry: Record<string, LazyRule> = {};

export function registerLazyRule<Args extends unknown[]>(
  name: string,
  builder: (...args: Args) => Predicate,
  mapsValue = false,
) {
  lazyRegistry[name] = {
    build: args => builder(...(args as Args)),
    mapsValue,
  };
}

export function getLazyRule(name: string): LazyRule | undefined {
  return lazyRegistry[name];
}
