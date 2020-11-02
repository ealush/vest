import isFunction from 'isFunction';

const isRule = (rulesObject, name) => {
  return rulesObject.hasOwnProperty(name) && isFunction(rulesObject[name]);
};

export default isRule;
