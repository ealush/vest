import bindLazyRule from 'bindLazyRule';
import genRuleProxy from 'genRuleProxy';
import proxySupported from 'proxySupported';
import runtimeRules from 'runtimeRules';

export default function bindExtend(enforce, Enforce) {
  enforce.extend = customRules => {
    Object.assign(runtimeRules, customRules);

    if (!proxySupported()) {
      genRuleProxy(Enforce, bindLazyRule);
    }

    return enforce;
  };
}
