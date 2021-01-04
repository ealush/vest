import RuleResult from 'RuleResult';
import asArray from 'asArray';
import { RUN_RULE } from 'enforceKeywords';
import shouldFailFast from 'shouldFailFast';

/**
 * Runs multiple enforce rules that are passed to compounds.
 * Example: enforce.allOf(enforce.ruleOne(), enforce.ruleTwo().ruleThree())
 *
 * @param {{run: Function}[]} ruleGroups
 * @param {*} value
 * @return {RuleResult}
 */
export default function runLazyRules(ruleGroups, value) {
  const result = new RuleResult(true);

  for (const chain of asArray(ruleGroups)) {
    if (shouldFailFast(value, result)) {
      break;
    }

    result.extend(runLazyRule(chain, value));
  }

  return result;
}

/**
 * Runs a single lazy rule
 *
 * @param {{run: Function}} ruleGroup
 * @param {*} value
 * @return {boolean|RuleResult}
 */
export function runLazyRule(ruleGroup, value) {
  return ruleGroup[RUN_RULE](value);
}
