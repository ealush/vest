import { isRule, proxySupported } from '../lib';
import rules from '../rules';
import runner from './runner';

/**
 * Creates an enforce instance
 * @param {Object} [customRules]
 * @return {Function} enforce instance
 */
function Enforce(customRules = {}) {
  const rulesObject = { ...rules, ...customRules };

  if (proxySupported()) {
    return value => {
      const proxy = new Proxy(rulesObject, {
        get: (rules, fnName) => {
          if (!isRule(rules, fnName)) {
            return;
          }

          return (...args) => {
            runner(rules[fnName], value, ...args);
            return proxy;
          };
        },
      });
      return proxy;
    };
  }

  const rulesList = Object.keys(rulesObject);

  return value =>
    rulesList.reduce(
      (allRules, fnName) =>
        Object.assign(allRules, {
          ...(isRule(rulesObject, fnName) && {
            [fnName]: (...args) => {
              runner(rulesObject[fnName], value, ...args);
              return allRules;
            },
          }),
        }),
      {}
    );
}

const enforce = new Enforce();
enforce.Enforce = Enforce;

export default enforce;
