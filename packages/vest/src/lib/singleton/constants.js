/**
 * @type {String} Vest's major version.
 */
const VEST_MAJOR = VEST_VERSION.split('.')[0];

/**
 * @type {Symbol} Used to store a global reference to Vest's inner state.
 */
export const SYMBOL_VEST_GLOBAL = Symbol.for(`__INTERNAL__VEST#${VEST_MAJOR}`);
