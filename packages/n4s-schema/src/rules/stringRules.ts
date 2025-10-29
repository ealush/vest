// A small, self-contained chainable string rules builder.

type Predicate = (value: string) => boolean;

type Chain = {
  // guards
  isString(): Chain;

  // string predicates
  startsWith(start: string): Chain;
  endsWith(ending: string): Chain;
  matches(regex: RegExp): Chain;
  minLength(n: number): Chain;
  maxLength(n: number): Chain;

  // executor
  run(value: any): boolean;
};

function makeChain(predicates: Predicate[] = []): Chain {
  const add = (p: Predicate) => makeChain([...predicates, p]);

  return {
    isString: () => add((v: string) => typeof v === 'string'),
    startsWith: (start: string) => add((v: string) => v.startsWith(start)),
    endsWith: (ending: string) => add((v: string) => v.endsWith(ending)),
    matches: (regex: RegExp) => add((v: string) => regex.test(v)),
    minLength: (n: number) => add((v: string) => v.length >= n),
    // NOTE: Tests expect equality to fail when at the limit (exclusive upper bound)
    maxLength: (n: number) => add((v: string) => v.length < n),
    run: (value: any) => {
      if (predicates.length === 0) return true;
      // First guard: if first predicate is isString, enforce type early
      for (let i = 0; i < predicates.length; i++) {
        const p = predicates[i];
        if (!p(value)) return false;
      }
      return true;
    },
  };
}

export const stringRules: Chain = makeChain();
