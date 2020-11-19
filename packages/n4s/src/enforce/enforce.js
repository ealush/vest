import bindLazyRule from 'bindLazyRule';
import bindExtend from 'enforce.extend';
import bindTemplate from 'enforce.template';
import runner from 'enforceRunner';
import genRuleProxy from 'genRuleProxy';
import runtimeRules from 'runtimeRules';

const Enforce = value => {
  const proxy = genRuleProxy({}, ruleName => (...args) => {
    runner(runtimeRules[ruleName], value, args);
    return proxy;
  });
  return proxy;
};

const enforce = genRuleProxy(Enforce, bindLazyRule);

bindExtend(enforce, Enforce);
bindTemplate(enforce);

export default enforce;
