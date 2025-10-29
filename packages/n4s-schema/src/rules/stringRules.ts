import { RuleInstance, RuleRunReturn, ruleRunReturn } from '../enforce';

type Predicate = (value: string) => boolean;

export interface StringRuleInstance extends RuleInstance<string, [any]> {
  startsWith(start: string): StringRuleInstance;
  endsWith(ending: string): StringRuleInstance;
  matches(regex: RegExp): StringRuleInstance;
  minLength(n: number): StringRuleInstance;
  maxLength(n: number): StringRuleInstance;
}

function startsWith(str: string, start: string): boolean {
  return str.startsWith(start);
}

function endsWith(str: string, ending: string): boolean {
  return str.endsWith(ending);
}

function matches(str: string, regex: RegExp): boolean {
  return regex.test(str);
}

function minLength(str: string, n: number): boolean {
  return str.length >= n;
}

function maxLength(str: string, n: number): boolean {
  return str.length < n;
}

const rules = {
  endsWith,
  isString,
  matches,
  maxLength,
  minLength,
  startsWith,
};

export function isString(): StringRuleInstance {
  const chain: Predicate[] = [];

  const target: Partial<StringRuleInstance> = {
    infer: '' as any as string,
  };

  const proxy = new Proxy(target as StringRuleInstance, {
    get(target, prop: keyof StringRuleInstance) {
      if (prop === 'run') {
        return run;
      }

      if (Object.prototype.hasOwnProperty.call(rules, prop as any)) {
        return (...args: any[]) => {
          return add((value: any) => (rules as any)[prop](value, ...args));
        };
      }

      return (target as any)[prop];
    },
  });

  add((value: any) => typeof value === 'string');

  return proxy as StringRuleInstance;

  function add(p: Predicate) {
    chain.push(p);
    return proxy as StringRuleInstance;
  }

  function run(value: any): RuleRunReturn<string> {
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
