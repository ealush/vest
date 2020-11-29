import runLazyRules from 'runLazyRules';
import { withFirst } from 'withArgs';

function allOf(value, rules) {
  return (
    !rules.length || rules.every(ruleGroup => runLazyRules(ruleGroup, value))
  );
}

export default withFirst(anyOf);
