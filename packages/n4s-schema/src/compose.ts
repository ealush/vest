import { ctx } from 'enforceContext';
import { StringObject, assign, invariant, mapFirst } from 'vest-utils';

import { RuleInstance } from 'RuleInstance';
import { RuleRunReturn } from 'RuleRunReturn';

type ComposeResult<T = any> = RuleInstance<T, [T]> & {
  (value: T): void;
};

export function compose<T = any>(
  ...composites: RuleInstance<any, [any]>[]
): ComposeResult<T> {
  const composedFn = assign(
    (value: T) => {
      const res = run(value);
      invariant(res.pass, StringObject(res.message));
    },
    {
      run,
      test: (value: T) => run(value).pass,
      infer: {} as T,
    },
  );

  return composedFn as ComposeResult<T>;

  function run(value: T): RuleRunReturn<T> {
    return ctx.run({ value }, () => {
      let result: RuleRunReturn<T> = RuleRunReturn.Passing(value);

      mapFirst(
        composites,
        (
          composite: RuleInstance<any, [any]>,
          breakout: (conditional: boolean, res: RuleRunReturn<any>) => void,
        ) => {
          const res = composite.run(value);
          if (!res.pass) {
            result = res;
            breakout(true, res);
          }
        },
      );

      return result;
    });
  }
}
