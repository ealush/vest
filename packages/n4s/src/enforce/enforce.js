import compounds from 'compounds';
import { RUN_RULE } from 'enforceKeywords';
import runner from 'enforceRunner';
import isRule from 'isRule';
import proxySupported from 'proxySupported';
import rules from 'rules';

const rulesObject = Object.assign(rules(), compounds);

let rulesList = proxySupported() ? null : Object.keys(rulesObject);

const Enforce = value => {
  const target = proxySupported() ? enforce : {};
  const proxy = genRuleProxy(target, ruleName => (...args) => {
    runner(rulesObject[ruleName], value, args);
    return proxy;
  });
  return proxy;
};

const enforce = genRuleProxy(Enforce, bindLazyRule);

enforce.extend = customRules => {
  Object.assign(rulesObject, customRules);

  if (!proxySupported()) {
    rulesList = Object.keys(rulesObject);
    genRuleProxy(Enforce, bindLazyRule);
  }

  return enforce;
};

export default enforce;

// Creates a proxy object that has access to all the rules
function genRuleProxy(target, output) {
  if (proxySupported()) {
    return new Proxy(target, {
      get: (target, fnName) => {
        if (!isRule(rulesObject, fnName)) {
          return target[fnName];
        }

        return output(fnName);
      },
    });
  } else {
    /**
     * This method is REALLY not recommended as it is slow and iterates over
     * all the rules for each direct enforce reference. We only use it as a
     * lightweight alternative for the much faster proxy interface
     */
    return rulesList.reduce((target, fnName) => {
      return Object.defineProperties(target, {
        [fnName]: { get: () => output(fnName), configurable: true },
      });
    }, target);
  }
}

// Initiates a chain of functions directly from the `enforce`
// function - that's even though we do not have any closure
// there to store that data.
function bindLazyRule(ruleName) {
  const registeredRules = [];

  const addFn = fnName => (...args) => {
    registeredRules.push(
      Object.defineProperty(
        value => rulesObject[fnName](value, ...args),
        'name',
        { value: fnName }
      )
    );

    const returnvalue = genRuleProxy({}, addFn);

    return Object.assign(returnvalue, {
      [RUN_RULE]: registeredRules,
    });
  };

  return addFn(ruleName);
}
