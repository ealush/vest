import type { Maybe } from 'vest-utils';

import { allRules, schemaRulesMap } from 'allRules';
import type { EnforceEagerReturn } from 'eagerTypes';
import { createRuleCall } from 'ruleCallGenerator';
import { extendEager, getRule, getSchemaRule } from 'ruleRegistry';

export { extendEager };
export type { EnforceEagerReturn, TArraySchemaRules } from 'eagerTypes';

const MESSAGE_KEY = 'message';

export function enforceEager<T>(
  value: T,
): EnforceEagerReturn<T, typeof allRules, typeof schemaRulesMap> {
  let customMessage: Maybe<string> = undefined;

  const setMessage = (msg?: string) => {
    customMessage = msg;
    return proxy;
  };

  const clearMessage = () => setMessage(undefined);

  const proxy = new Proxy(
    {},
    {
      get(_target: any, key: string) {
        if (key === MESSAGE_KEY) return setMessage;

        const rule = getRule(key) ?? getSchemaRule(key);
        if (rule) {
          return createRuleCall({
            clearMessage,
            customMessage,
            rule,
            ruleName: key,
            target: proxy,
            value,
          });
        }

        return _target[key];
      },
    },
  );

  return proxy;
}
