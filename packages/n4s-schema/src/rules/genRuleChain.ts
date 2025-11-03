import { RuleInstance, ruleRunReturn, RuleRunReturn } from 'enforceUtil';

type Predicate = (value: any) => boolean;

// Global registry for custom lazy rules so they can be chained on any rule set
const lazyRegistry: Record<string, (...args: any[]) => Predicate> = {};

export function registerLazyRule(
  name: string,
  builder: (...args: any[]) => Predicate,
) {
  lazyRegistry[name] = builder;
}

export function addToChain<T extends RuleInstance<any, any>>(
  rules: Record<keyof Omit<T, 'run' | 'infer'>, (...args: any[]) => boolean>,
  predicate: Predicate,
): T {
  const chain: Predicate[] = [predicate];

  const target: Partial<T> = {};

  const proxy = new Proxy(target as T, {
    get(target: T, prop: string | symbol, receiver: any) {
      if (prop === 'run') {
        return run;
      }

      if (Object.prototype.hasOwnProperty.call(rules, prop as any)) {
        return (...args: any[]) => {
          chain.push((value: any) => (rules as any)[prop](value, ...args));
          return proxy as T;
        };
      }

      if (Object.prototype.hasOwnProperty.call(lazyRegistry, prop as any)) {
        return (...args: any[]) => {
          chain.push(lazyRegistry[prop as any](...args));
          return proxy as T;
        };
      }

      return Reflect.get(target as object, prop, receiver);
    },
  });

  function run(value: any): RuleRunReturn<T['infer']> {
    if (chain.length === 0) {
      return ruleRunReturn(true, value);
    }

    for (let i = 0; i < chain.length; i++) {
      const p = chain[i];
      if (!p(value)) {
        return ruleRunReturn(false, value);
      }
    }
    return ruleRunReturn(true, value);
  }

  return proxy as T;
}

export function genRuleChain<T extends RuleInstance<any, any>>(
  rules: Record<keyof Omit<T, 'run' | 'infer'>, (...args: any[]) => boolean>,
): (p: Predicate) => T {
  const chain: Predicate[] = [];

  const target: Partial<T> = {};

  const proxy = new Proxy(target as T, {
    get(target: T, prop: string | symbol, receiver: any) {
      if (prop === 'run') {
        return run;
      }

      if (Object.prototype.hasOwnProperty.call(rules, prop as any)) {
        return (...args: any[]) => {
          return add((value: any) => (rules as any)[prop](value, ...args));
        };
      }

      if (Object.prototype.hasOwnProperty.call(lazyRegistry, prop as any)) {
        return (...args: any[]) => add(lazyRegistry[prop as any](...args));
      }

      return Reflect.get(target as object, prop, receiver);
    },
  });

  return add;

  function add(p: Predicate) {
    chain.push(p);
    return proxy as T;
  }

  function run(value: any): RuleRunReturn<T['infer']> {
    if (chain.length === 0) {
      return ruleRunReturn(true, value);
    }

    for (let i = 0; i < chain.length; i++) {
      const p = chain[i];
      if (!p(value)) {
        return ruleRunReturn(false, value);
      }
    }
    return ruleRunReturn(true, value);
  }
}
