/**
 * @type {String} Vest's major version.
 */
const VEST_MAJOR = VEST_VERSION.split('.')[0];

/**
 * @type {Symbol} Used to store a global instance of Vest.
 */
export const SYMBOL_VEST = Symbol.for(`VEST#${VEST_MAJOR}`);
