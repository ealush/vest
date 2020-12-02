import EnforceContext from 'EnforceContext';
import { RUN_RULE, TEST_RULE } from 'enforceKeywords';
import runner from 'enforceRunner';
import genRuleProxy from 'genRuleProxy';
import runLazyRules from 'runLazyRules';
import runtimeRules from 'runtimeRules';
import withArgs from 'withArgs';

/**
 * Adds `template` property to enforce.
 *
 * @param {Function} enforce
 */
export default function bindTemplate(enforce) {
  enforce.template = withArgs(rules => {
    const template = value => {
      runner(runLazyRules.bind(null, rules), value);
      const proxy = genRuleProxy({}, ruleName =>
        withArgs(args => {
          runner(runtimeRules[ruleName], value, args);
          return proxy;
        })
      );
      return proxy;
    };

    // `run` returns a deep ResultObject
    template[RUN_RULE] = value => runLazyRules(rules, value);

    // `test` returns a boolean
    template[TEST_RULE] = value =>
      runLazyRules(rules, EnforceContext.wrap(value).setFailFast(true)).pass;

    return template;
  });
}
