import compounds from 'compounds';
import runner from 'enforceRunner';
import isRule from 'isRule';
import proxySupported from 'proxySupported';
import rules from 'rules';

const rulesObject = Object.assign(rules(), compounds);

let enforce, rulesList;

const bindLazyRule = ruleName => (...args) => {
  return Object.defineProperty(
    value => rulesObject[ruleName](value, ...args),
    'name',
    { value: ruleName }
  );
};

const bindLazyRules = rules =>
  rules.reduce(
    (enforce, ruleName) =>
      Object.assign(enforce, {
        [ruleName]: bindLazyRule(ruleName),
      }),
    enforce
  );

if (proxySupported()) {
  const enforceMain = value => {
    const proxy = new Proxy(rulesObject, {
      get: (rules, fnName) => {
        if (!isRule(rules, fnName)) {
          return enforce[fnName];
        }

        return (...args) => {
          runner(rules[fnName], value, ...args);
          return proxy;
        };
      },
    });
    return proxy;
  };

  // This is for lazy enforcement: enforce.isArray()([]) // true
  enforce = new Proxy(enforceMain, {
    get: (enforce, fnName) => {
      if (!isRule(rulesObject, fnName)) {
        return enforce[fnName];
      }

      return bindLazyRule(fnName);
    },
  });
} else {
  rulesList = Object.keys(rulesObject);

  // This is for lazy enforcement: enforce.isArray()([]) // true
  enforce = value =>
    rulesList.reduce((allRules, fnName) => {
      if (!isRule(rulesObject, fnName)) {
        return enforce[fnName];
      }
      return Object.assign(allRules, {
        [fnName]: (...args) => {
          runner(rulesObject[fnName], value, ...args);
          return allRules;
        },
      });
    }, {});

  bindLazyRules(rulesList);
}

enforce.extend = customRules => {
  Object.assign(rulesObject, customRules);

  if (!proxySupported()) {
    rulesList = Object.keys(rulesObject);
    bindLazyRules(Object.keys(customRules));
  }

  return enforce;
};

export default enforce;
