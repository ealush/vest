import asArray from 'asArray';
import { RUN_RULE } from 'enforceKeywords';

export default function runLazyRules(ruleGroups, value) {
  return asArray(ruleGroups).every(ruleGroup => ruleGroup[RUN_RULE](value));
}
