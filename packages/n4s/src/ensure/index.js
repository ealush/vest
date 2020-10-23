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
    runner(rulesObject[name], value, ...args)
  );

let ensure, rulesList;

const rulesObject = { ...rules };

if (proxySupported()) {
  ensure = () => {
    const registeredRules = [];

    const proxy = new Proxy(rulesObject, {
      get: (rules, ruleName) => {
        if (ruleName === 'test') {
          return createTestFn(registeredRules);
        }

        if (!isRule(rulesObject, ruleName)) {
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
} else {
  rulesList = Object.keys(rulesObject);

  ensure = () => {
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

ensure.extend = customRules => {
  Object.assign(rulesObject, customRules);

  if (proxySupported()) {
    rulesList = Object.keys(rulesObject);
  }
};

export default ensure;
