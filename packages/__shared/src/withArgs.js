import setFnName from 'setFnName';
/**
 * ES5 Transpilation increases the size of spread arguments by a lot.
 * Wraps a function and passes its spread params as an array.
 *
 * @param {Function} cb
 * @param {String}   [fnName]
 * @return {Function}
 */
export default function withArgs(cb, fnName) {
  return setFnName(function () {
    const args = Array.from(arguments);
    const right = args.splice(cb.length - 1);
    return cb.apply(null, args.concat([right]));
  }, fnName || cb.name);
}
