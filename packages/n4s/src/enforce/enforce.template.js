import runner from 'enforceRunner';
import genRuleProxy from 'genRuleProxy';
import isFunction from 'isFunction';
import runLazyRules from 'runLazyRules';
import runtimeRules from 'runtimeRules';

export default function bindTemplate(enforce) {
  enforce.template = (...rule) => {
    const template = value => {
      runner(runLazyRules.bind(null, rule), value);
      const proxy = genRuleProxy({}, ruleName => (...args) => {
        runner(runtimeRules[ruleName], value, args);
        return proxy;
      });
      return proxy;
    };

    template.test = getValue =>
      runLazyRules(rule, isFunction(getValue) ? getValue() : getValue);

    return template;
  };
}
