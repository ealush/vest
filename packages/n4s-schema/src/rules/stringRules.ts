// A small, self-contained chainable string rules builder.

type Predicate = (value: string) => boolean;

type Chain = {
  startsWith(start: string): Chain;
  endsWith(ending: string): Chain;
  matches(regex: RegExp): Chain;
  minLength(n: number): Chain;
  maxLength(n: number): Chain;
  run(value: any): boolean;
};

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

export function isString() {
  const chain: Predicate[] = [];

  const proxy = new Proxy({} as Chain, {
    get(_, prop: keyof Chain) {
      if (prop === 'run') {
        return run;
      }

      if (rules.hasOwnProperty(prop)) {
        return (...args: any[]) => {
          return add((value: any) => (rules as any)[prop](value, ...args));
        };
      }
    },
  });

  add((value: any) => typeof value === 'string');

  return proxy;

  function add(p: Predicate): Chain {
    chain.push(p);
    return proxy;
  }

  function run(value: any): boolean {
    if (chain.length === 0) return true;

    for (let i = 0; i < chain.length; i++) {
      const p = chain[i];
      if (!p(value)) return false;
    }
    return true;
  }
}
