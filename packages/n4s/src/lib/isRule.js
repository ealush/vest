import isFunction from 'isFunction';
import throwError from 'throwError';

const isRule = (rulesObject, name) => {
  const ruleExists =
    Object.prototype.hasOwnProperty.call(rulesObject, name) &&
    isFunction(rulesObject[name]);

  if (!ruleExists) {
    throwError(
      `Rule "${name}" was not found in rules object. Make sure you typed it correctly.`
    );
  }

  return ruleExists;
};

export default isRule;
