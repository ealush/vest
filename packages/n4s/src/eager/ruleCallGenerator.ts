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
  result: any,
  ruleName: string,
  value: any,
  customMessage: string | undefined,
  args: any[],
): void {
  const transformedResult = transformResult(result, ruleName, value, ...args);

  invariant(
    transformedResult.pass,
    enforceMessage(ruleName, transformedResult, value, customMessage),
  );
}

export function createRuleCall(config: RuleCallConfig) {
  const {
    target,
    rule,
    ruleName,
    value,
    customMessage,
    clearMessage,
    getPendingPromise,
    setPendingPromise,
  } = config;

  return function ruleCall(...args: any[]): any {
    const runRule = () =>
      ctx.run({ value }, () =>
        (rule as (...args: any[]) => any)(value, ...args),
      );

    const pendingPromise = getPendingPromise();
    if (pendingPromise) {
      setPendingPromise(
        pendingPromise.then(() => {
          return Promise.resolve(runRule()).then(ruleResult => {
            processRuleResult(ruleResult, ruleName, value, customMessage, args);
          });
        }),
      );

      clearMessage();
      target.pass = true;
      return target;
    }

    const ruleResult = runRule();

    if (isPromise(ruleResult)) {
      setPendingPromise(
        Promise.resolve(ruleResult).then(resolvedResult => {
          processRuleResult(
            resolvedResult,
            ruleName,
            value,
            customMessage,
            args,
          );
        }),
      );

      clearMessage();
      target.pass = true;
      return target;
    }

    processRuleResult(ruleResult, ruleName, value, customMessage, args);

    // Clear message after each rule - it only applies to the next rule
    clearMessage();
    target.pass = true;

    return target;
  };
}
