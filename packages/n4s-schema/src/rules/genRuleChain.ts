import { RuleInstance, Passing, Failing, RuleRunReturn } from 'enforceUtil';

type Predicate = (value: any) => boolean;

// Global registry for custom lazy rules so they can be chained on any rule set
const lazyRegistry: Record<string, (...args: any[]) => Predicate> = {};

export function registerLazyRule(
  name: string,
  builder: (...args: any[]) => Predicate,
) {
  lazyRegistry[name] = builder;
}

function createChainBuilder<T extends RuleInstance<any, any>>(
  rules: Record<keyof Omit<T, 'run' | 'infer'>, (...args: any[]) => boolean>,
) {
  const chain: Predicate[] = [];
  const target: Partial<T> = {};

  const proxy = new Proxy(target as T, {
    get(target: T, prop: string | symbol, receiver: any) {
      if (prop === 'run') {
        return run;
      }

      if (Object.prototype.hasOwnProperty.call(rules, prop as any)) {
        return (...args: any[]) =>
          add((value: any) => (rules as any)[prop](value, ...args));
      }

      if (Object.prototype.hasOwnProperty.call(lazyRegistry, prop as any)) {
        return (...args: any[]) => add(lazyRegistry[prop as any](...args));
      }

      return Reflect.get(target as object, prop, receiver);
    },
    has(target: T, prop: string | symbol) {
      if (prop === 'run' || prop === 'infer') {
        return true;
      }
      if (Object.prototype.hasOwnProperty.call(rules, prop as any)) {
        return true;
      }
      if (Object.prototype.hasOwnProperty.call(lazyRegistry, prop as any)) {
        return true;
      }
      return Reflect.has(target as object, prop);
    },
  });

  function add(p: Predicate) {
    chain.push(p);
    return proxy as T;
  }

  function run(value: any): RuleRunReturn<T['infer']> {
    if (chain.length === 0) {
      return Passing(value);
    }

    for (let i = 0; i < chain.length; i++) {
      const p = chain[i];
      if (!p(value)) {
        return Failing(value);
      }
    }
    return Passing(value);
  }

  return { add, proxy } as const;
}

export function addToChain<T extends RuleInstance<any, any>>(
  rules: Record<keyof Omit<T, 'run' | 'infer'>, (...args: any[]) => boolean>,
  predicate: Predicate,
): T {
  const { add, proxy } = createChainBuilder<T>(rules);
  add(predicate);
  return proxy as T;
}

export function genRuleChain<T extends RuleInstance<any, any>>(
  rules: Record<keyof Omit<T, 'run' | 'infer'>, (...args: any[]) => boolean>,
): (p: Predicate) => T {
  const { add } = createChainBuilder<T>(rules);
  return add;
}
