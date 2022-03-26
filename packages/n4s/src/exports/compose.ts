import invariant from 'invariant';
import mapFirst from 'mapFirst';

import type { ComposeResult, LazyRuleRunners } from 'genEnforceLazy';
import { ctx } from 'n4s';
import { defaultToPassing, RuleDetailedResult } from 'ruleReturn';
import runLazyRule from 'runLazyRule';

/* eslint-disable max-lines-per-function */

export default function compose(
  ...composites: LazyRuleRunners[]
): ComposeResult {
  return Object.assign(
    (value: any) => {
      const res = run(value);

      invariant(res.pass, new String(res.message));
    },
    {
      run,
      test: (value: any) => run(value).pass,
    }
  );

  function run(value: any): RuleDetailedResult {
    return ctx.run({ value }, () => {
      return defaultToPassing(
        mapFirst(
          composites,
          (
            composite: LazyRuleRunners,
            breakout: (res: RuleDetailedResult) => void
          ) => {
            /* HACK: Just a small white lie. ~~HELP WANTED~~.
               The ideal is that instead of `LazyRuleRunners` We would simply use `Lazy` to begin with.
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
