import { isNotArray } from 'isArray';
import runLazyRules from 'runLazyRules';
import { withFirst } from 'withArgs';

function isArrayOf(value, ruleChain) {
  if (isNotArray(value)) {
    return false;
  }
  return value.every(element =>
    ruleChain.some(rule => runLazyRules(rule, element))
  );
}

export default withFirst(isArrayOf);
