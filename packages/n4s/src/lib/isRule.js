import isFunction from 'isFunction';
import runtimeRules from 'runtimeRules';

const isRule = name => isFunction(runtimeRules[name]);

export default isRule;
