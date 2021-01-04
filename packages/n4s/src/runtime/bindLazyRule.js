import EnforceContext from 'EnforceContext';
import RuleResult from 'RuleResult';
import { RUN_RULE, TEST_RULE } from 'enforceKeywords';
import genRuleProxy from 'genRuleProxy';
import isCompound from 'isCompound';
import ruleMeta from 'ruleMeta';
import runtimeRules from 'runtimeRules';
import setFnName from 'setFnName';
import withArgs from 'withArgs';

/**
 * Creates a rule of lazily called rules.
 * Each rule gets added a `.run()` property
 * which runs all the accumulated rules in
 * the chain against the supplied value
 *
 * @param {string} ruleName
 * @return {{run: Function}}
 */
export default function bindLazyRule(ruleName) {
  const registeredRules = []; // Chained rules
  const meta = []; // Meta properties to add onto the rule context

  // Appends a function to the registeredRules array.
  // It gets called every time the consumer usess chaining
  // so, for example - enforce.isArray() <- this calles addFn
  const addFn = ruleName => {
    return withArgs(args => {
      const rule = runtimeRules[ruleName];

      // Add a meta function
      if (ruleMeta[rule.name] === rule) {
        meta.push((value, ruleResult) => {
          ruleResult.setAttribute(rule.name, rule(value, args[0]));
        });
      } else {
        // Register a rule
        registeredRules.push(
          setFnName(value => {
            return rule.apply(
              null,
              [
                // If the rule is compound - wraps the value with context
                // Otherwise - unwraps it
                isCompound(rule)
                  ? EnforceContext.wrap(value)
                  : EnforceContext.unwrap(value),
              ].concat(args)
            );
          }, ruleName)
        );
      }

      // set addFn as the proxy handler
      const returnvalue = genRuleProxy({}, addFn);

      returnvalue[RUN_RULE] = value => {
        const result = new RuleResult(true);

        // Run meta chains
        meta.forEach(fn => {
          fn(value, result);
        });

        // Iterate over all the registered rules
        // This runs the function that's inside `addFn`
        for (const fn of registeredRules) {
          try {
            result.extend(fn(value));

            // If a chained rule fails, exit. We failed.
            if (!result.pass) {
              break;
            }
          } catch (e) {
            result.setFailed(true);
            break;
          }
        }
        return result;
      };

      returnvalue[TEST_RULE] = value =>
        returnvalue[RUN_RULE](EnforceContext.wrap(value).setFailFast(true))
          .pass;

      return returnvalue;
    }, ruleName);
  };

  // Returns the initial rule in the chain
  return addFn(ruleName);
}
