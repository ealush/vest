import { isRule, proxySupported } from '../lib';
import rules from '../rules';
import runner from './runner';

const rulesObject = { ...rules };

let enforce, rulesList;

if (proxySupported()) {
  enforce = value => {
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
} else {
  rulesList = Object.keys(rulesObject);

  enforce = value =>
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

enforce.extend = customRules => {
  Object.assign(rulesObject, customRules);

  if (!proxySupported()) {
    rulesList = Object.keys(rulesObject);
  }
};

export default enforce;
