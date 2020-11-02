import runner from 'enforceRunner';
import isRule from 'isRule';
import proxySupported from 'proxySupported';
import rules from 'rules';

const rulesObject = rules();

let enforce, rulesList;

if (proxySupported()) {
  const enforceMain = value => {
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

  enforce = new Proxy(enforceMain, {
    get: (enforce, fnName) => {
      if (!isRule(rulesObject, fnName)) {
        return;
      }

      return (...ruleArgs) => value => rulesObject[fnName](value, ...ruleArgs);
    },
  });
} else {
  rulesList = Object.keys(rulesObject);

  const enforce = value =>
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
  rulesList.reduce(
    (enforce,
    ruleName =>
      Object.assign(enforce, {
        [ruleName]: (...ruleArgs) => value =>
          rulesObject[ruleName](value, ...ruleArgs),
      })),
    enforce
  );
}

enforce.extend = customRules => {
  Object.assign(rulesObject, customRules);

  if (!proxySupported()) {
    rulesList = Object.keys(rulesObject);
    Object.keys(customRules).reduce(
      (enforce, ruleName) =>
        Object.assign(enforce, {
          [ruleName]: (...ruleArgs) => value =>
            rulesObject[ruleName](value, ...ruleArgs),
        }),
      enforce
    );
  }

  return enforce;
};

export default enforce;
