import { isRule, proxySupported } from '../lib';
import rules from '../rules';
import runner from './runner';

/**
 * Accepts list of registered rules and returns a test function
 * That runs against them to return a boolean
 *
 * @param {Array} registeredRules
 * @return {Function} test function
 */
const createTestFn = registeredRules => value =>
  registeredRules.every(({ name, args }) =>
    runner(rules[name], value, ...args)
  );

/**
 * Creates an ensure instance
 * @param {Object} [customRules]
 * @return {Function} ensure instance
 */
function Ensure(customRules = {}) {
  const rulesObject = { ...rules, ...customRules };

  if (proxySupported()) {
    return () => {
      const registeredRules = [];

      const proxy = new Proxy(rulesObject, {
        get: (rules, ruleName) => {
          if (ruleName === 'test') {
            return createTestFn(registeredRules);
          }

          if (!isRule(rules, ruleName)) {
            return;
          }

          return (...args) => {
            registeredRules.push({ name: ruleName, args });
            return proxy;
          };
        },
      });

      return proxy;
    };
  }

  const rulesList = Object.keys(rulesObject);

  return () => {
    const registeredRules = [];

    return rulesList.reduce(
      (allRules, ruleName) =>
        Object.assign(allRules, {
          ...(isRule(rulesObject, ruleName) && {
            [ruleName]: (...args) => {
              registeredRules.push({ name: ruleName, args });
              return allRules;
            },
          }),
        }),
      {
        test: createTestFn(registeredRules),
      }
    );
  };
}

const ensure = new Ensure();
ensure.Ensure = Ensure;

export default ensure;
