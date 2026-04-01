import { invariant, isPromise } from 'vest-utils';

import { ctx } from '../enforceContext';
import { enforceMessage, transformResult } from '../ruleResult';

import type { UnmodifiedRules, SchemaRules } from './ruleRegistry';

type RuleCallConfig = {
  target: any;
  rule: UnmodifiedRules | SchemaRules;
  ruleName: string;
  value: any;
  customMessage: string | undefined;
  clearMessage: () => void;
  getPendingPromise: () => Promise<void> | null;
  setPendingPromise: (nextPromise: Promise<void>) => void;
};

function processRuleResult(
  config: Pick<RuleCallConfig, 'ruleName' | 'value' | 'customMessage'>,
  result: any,
  args: any[],
): void {
  const { ruleName, value, customMessage } = config;

  const transformedResult = ctx.run({ value }, () =>
    transformResult(result, ruleName, value, ...args),
  );

  invariant(
    transformedResult.pass,
    enforceMessage(ruleName, transformedResult, value, customMessage),
  );
}

function setAsyncResult(
  config: Pick<RuleCallConfig, 'target' | 'clearMessage' | 'setPendingPromise'>,
  promise: Promise<void>,
) {
  config.setPendingPromise(
    promise.catch(err => {
      config.target.pass = false;
      throw err;
    }),
  );
  config.clearMessage();
  config.target.pass = true;
  return config.target;
}

export function createRuleCall(config: RuleCallConfig) {
  const { target, rule, value, getPendingPromise } = config;

  const runRule = (...args: any[]) =>
    ctx.run({ value }, () => (rule as (...args: any[]) => any)(value, ...args));

  return function ruleCall(...args: any[]): any {
    const pendingPromise = getPendingPromise();
    if (pendingPromise) {
      return setAsyncResult(
        config,
        pendingPromise
          .then(() => runRule(...args))
          .then(ruleResult => processRuleResult(config, ruleResult, args)),
      );
    }

    const ruleResult = runRule(...args);

    if (isPromise(ruleResult)) {
      return setAsyncResult(
        config,
        ruleResult.then(resolved => processRuleResult(config, resolved, args)),
      );
    }

    processRuleResult(config, ruleResult, args);
    config.clearMessage();
    target.pass = true;
    return target;
  };
}
