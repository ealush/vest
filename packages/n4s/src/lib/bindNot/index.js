export default function bindNot(fn) {
  return function () {
    return !fn.apply(this, arguments);
  };
}
