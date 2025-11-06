import { hasOwnProperty } from 'vest-utils';

import { RuleRunReturn } from 'RuleRunReturn';
import { RuleInstance } from 'RuleInstance';

type Predicate = (value: any) => boolean | RuleRunReturn<any>;

// Global registry for custom lazy rules so they can be chained on any rule set
const lazyRegistry: Record<string, (...args: any[]) => Predicate> = {};

export function registerLazyRule(
  name: string,
  builder: (...args: any[]) => Predicate,
) {
  lazyRegistry[name] = builder;
}

// eslint-disable-next-line max-lines-per-function
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

      if (hasOwnProperty(rules, prop as any)) {
        return (...args: any[]) =>
          add((value: any) => (rules as any)[prop](value, ...args));
      }

      if (hasOwnProperty(lazyRegistry, prop as any)) {
        return (...args: any[]) => add(lazyRegistry[prop as any](...args));
      }

      return Reflect.get(target as object, prop, receiver);
    },
    has(target: T, prop: string | symbol) {
      if (prop === 'run' || prop === 'infer') {
        return true;
      }
      if (hasOwnProperty(rules, prop as any)) {
        return true;
      }
      if (hasOwnProperty(lazyRegistry, prop as any)) {
        return true;
      }
      return Reflect.has(target as object, prop);
    },
  });

  function add(p: Predicate) {
    chain.push(p);
    return proxy as T;
  }

  // eslint-disable-next-line max-statements, complexity
  function run(value: any): RuleRunReturn<T['infer']> {
    if (chain.length === 0) {
      return RuleRunReturn.Passing(value);
    }

    for (let i = 0; i < chain.length; i++) {
      const p = chain[i];
      const res = p(value);
      if (typeof res === 'object' && res !== null) {
        if ('pass' in res) {
          if (!(res as RuleRunReturn<any>).pass) {
            // Preserve original detailed result (including message)
            return res as RuleRunReturn<T['infer']>;
          }
          // continue when pass === true
        } else {
          // Invalid object predicate result counts as failure
          return RuleRunReturn.Failing(value);
        }
      } else if (!res) {
        // boolean false
        return RuleRunReturn.Failing(value);
      }
    }
    return RuleRunReturn.Passing(value);
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
