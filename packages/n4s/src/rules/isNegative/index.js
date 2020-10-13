function isNegative(value, arg1) {
  if (!isNaN(Number(value))) {
    return Number(value) < 0;
  }
  return false;
}

export default isNegative;
