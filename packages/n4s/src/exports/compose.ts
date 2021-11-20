import mapFirst from 'mapFirst';
import throwError from 'throwError';

import type { TComposeResult, TLazyRuleRunners } from 'genEnforceLazy';
import { isEmpty } from 'isEmpty';
import { ctx } from 'n4s';
import { defaultToPassing, TRuleDetailedResult } from 'ruleReturn';
import runLazyRule from 'runLazyRule';

/* eslint-disable max-lines-per-function */

export default function compose(
  ...composites: TLazyRuleRunners[]
): TComposeResult {
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
          (
            composite: TLazyRuleRunners,
            breakout: (res: TRuleDetailedResult) => void
          ) => {
            /* HACK: Just a small white lie. ~~HELP WANTED~~.
               The ideal is that instead of `TLazyRuleRunners` We would simply use `TLazy` to begin with.
               The problem is that lazy rules can't really be passed to this function due to some generic hell
               so we're limiting it to a small set of functions.
            */

            const res = runLazyRule(composite, value);

            if (!res.pass) {
              breakout(res);
            }
          }
        )
      );
    });
  }
}
