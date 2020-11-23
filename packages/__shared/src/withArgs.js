import setFnName from 'setFnName';

/**
 * ES5 Transpilation increases the size of spread arguments by a lot.
 * Wraps a function and passes its spread params as an array.
 *
 * @param {Function} cb
 * @param {String}   [fnName]
 * @return {Function}
 */
export default function withAgs(cb, fnName) {
  return setFnName((...args) => cb(args), fnName || cb.name);
}

/**
 * Spreads all the passed arguments, and forwards them as
 * first arg, and the rest as an array.
 *
 * @param {Function} cb
 */
export function withFirst(cb) {
  return withAgs(args => cb(args[0], args.slice(1)), cb.name);
}
