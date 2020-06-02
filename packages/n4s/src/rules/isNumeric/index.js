function isNumeric(value) {
  const result =
    !isNaN(parseFloat(value)) && !isNaN(Number(value)) && isFinite(value);
  return Boolean(result);
}

isNumeric.negativeForm = 'isNotNumeric';

export default isNumeric;
