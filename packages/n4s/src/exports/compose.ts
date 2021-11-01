import mapFirst from 'mapFirst';
import throwError from 'throwError';

import { ctx } from 'enforceContext';
import type { TLazy } from 'genEnforceLazy';
import { isEmpty } from 'isEmpty';
import { defaultToPassing, TRuleDetailedResult } from 'ruleReturn';
import runLazyRule from 'runLazyRule';

// eslint-disable-next-line max-lines-per-function
export default function compose(...composites: TLazy[]): ((
  value: any
) => void) & {
  run: (value: any) => TRuleDetailedResult;
  test: (value: any) => boolean;
} {
  return Object.assign(
    (value: any) => {
      const res = run(value);

      if (!res.pass) {
        if (isEmpty(res.message)) {
          throwError();
        } else {
          // Explicitly throw a string so that vest.test can pick it up as the validation error message
          throw res.message;
        }
      }
    },
    {
      run,
      test: (value: any) => run(value).pass,
    }
  );

  function run(value: any): TRuleDetailedResult {
    return ctx.run({ value }, () => {
      return defaultToPassing(
        mapFirst(
          composites,
          (composite: TLazy, breakout: (res: TRuleDetailedResult) => void) => {
            /* HACK: Just a small white lie. ~~HELP WANTED~~.
               The ideal is that instead of `TLazyRuleRunners` We would simply use `TLazy` to begin with.
               The problem is that lazy rules can't really be passed to this function due to some generic hell
               so we're limiting it to a small set of functions.
            */

            const res = runLazyRule(composite as TLazy, value);

            if (!res.pass) {
              breakout(res);
            }
          }
        )
      );
    });
  }
}
