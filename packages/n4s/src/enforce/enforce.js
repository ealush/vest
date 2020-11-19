import bindLazyRule from 'bindLazyRule';
import runner from 'enforceRunner';
import genRuleProxy from 'genRuleProxy';
import isFunction from 'isFunction';
import proxySupported from 'proxySupported';
import runLazyRules from 'runLazyRules';
import runtimeRules from 'runtimeRules';

const Enforce = value => {
  const proxy = genRuleProxy({}, ruleName => (...args) => {
    runner(runtimeRules[ruleName], value, args);
    return proxy;
  });
  return proxy;
};

const enforce = genRuleProxy(Enforce, bindLazyRule);

enforce.extend = customRules => {
  Object.assign(runtimeRules, customRules);

  if (!proxySupported()) {
    genRuleProxy(Enforce, bindLazyRule);
  }

  return enforce;
};

enforce.template = rule => {
  const t = value => {
    runner(runLazyRules.bind(null, rule), value);
    const proxy = genRuleProxy({}, ruleName => (...args) => {
      runner(runtimeRules[ruleName], value, args);
      return proxy;
    });
    return proxy;
  };

  t.test = getValue =>
    runLazyRules(rule, isFunction(getValue) ? getValue() : getValue);

  return t;
};

export default enforce;
