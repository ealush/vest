import bindLazyRule from 'bindLazyRule';
import runner from 'enforceRunner';
import genRuleProxy from 'genRuleProxy';
import proxySupported from 'proxySupported';
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

export default enforce;
