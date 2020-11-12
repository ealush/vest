export function arrayOf(value, ...rules) {
    if (value.some(element => !rules.some(fn => fn(element)))) {return false};
    return true;
  };