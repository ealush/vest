import throwError from '../throwError';

const isRule = (rulesObject, name) => {
  const ruleExists =
    Object.prototype.hasOwnProperty.call(rulesObject, name) &&
    typeof rulesObject[name] === 'function';

  if (!ruleExists) {
    throwError(
      `Rule "${name}" was not found in rules object. Make sure you typed it correctly.`
    );
  }

  return ruleExists;
};

export default isRule;
