import { isNotArray } from 'isArray';
import runLazyRules from 'runLazyRules';

export default function isArrayOf(value, ...ruleChain) {
  if (isNotArray(value)) {
    return false;
  }
  return value.every(element =>
    ruleChain.some(rule => runLazyRules(rule, element))
  );
}
