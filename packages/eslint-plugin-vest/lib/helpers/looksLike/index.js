function isPrimitive(val) {
  return val === null || ['string', 'boolean', 'number'].includes(typeof val);
}

module.exports = function looksLike(a, b) {
  return (
    a &&
    b &&
    Object.entries(b).every(([bKey, bVal]) => {
      const aVal = a[bKey];

      if (Object.is(aVal, bVal)) {
        return true;
      }

      if (typeof bVal === 'function') {
        return (
          typeof aVal === 'function' && bVal.toString() === aVal.toString()
        );
      }
      return isPrimitive(bVal) ? bVal === aVal : looksLike(aVal, bVal);
    })
  );
};
