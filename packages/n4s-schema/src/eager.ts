import type { Maybe } from 'vest-utils';

import { createRuleCall } from './eager/ruleCallGenerator';
import { extendEager, getRule, getSchemaRule } from './eager/ruleRegistry';

export { extendEager };
export type { EnforceEagerReturn, TArraySchemaRules } from './eager/eagerTypes';

const MESSAGE_KEY = 'message';

export function enforceEager<T>(value: T) {
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
