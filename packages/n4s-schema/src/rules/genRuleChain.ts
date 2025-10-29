import { RuleInstance, ruleRunReturn, RuleRunReturn } from 'enforce';

type Predicate = (value: any) => boolean;

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
