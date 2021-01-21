import RuleResult from 'RuleResult';
import { MODE_ALL, MODE_ONE, MODE_ANY } from 'enforceKeywords';
import { isEmpty } from 'isEmpty';
import { isNull } from 'isNull';
import { runLazyRule } from 'runLazyRules';

/**
 * Runs chains of rules
 *
 * @param {EnforceContext} value
 * @param {[{test: Function, run: Function}]} rules
 * @param {RuleResult} options
 */
export default function runCompoundChain(value, rules, options) {
  const result = new RuleResult(true);

  if (isEmpty(rules)) {
    result.setFailed(true);
  }

  const failedResults = [];

  let count = 0;
  for (const chain of rules) {
    // Inner result for each iteration
    const currentResult = runLazyRule(chain, value);

    if (isNull(currentResult)) {
      return null;
    }

    const pass = currentResult.pass;

    if (pass) {
      count++;
    } else {
      failedResults.push(currentResult);
    }

    if (options) {
      // "anyOf" is a special case.
      // It shouldn't extend with failed results,
      // that's why we continue
      if (options.mode === MODE_ANY) {
        if (pass) {
          result.extend(currentResult);
          break;
        }
        continue;
      }
      result.extend(currentResult);
      // MODE_ALL: All must pass.
      // If one failed, exit.
      if (options.mode === MODE_ALL) {
        if (!pass) {
          break;
        }
      }

      // MODE_ONE: only one must pass.
      // If more than one passed, exit.
      if (options.mode === MODE_ONE) {
        result.setFailed(count !== 1);

        if (count > 1) {
          break;
        }
      }
    } else {
      result.extend(currentResult);

      if (pass) {
        break;
      }
    }
  }

  if (result.pass && count === 0) {
    result.setFailed(true);
    // In some cases we do not want to extend failures, for example - in ANY
    // when there is a valid response, so we do it before returning
    failedResults.forEach(failedResult => result.extend(failedResult));
  }

  return result;
}
