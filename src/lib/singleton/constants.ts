declare var VEST_VERSION: string;

/**
 * Vest's major version.
 */
const VEST_MAJOR: string = VEST_VERSION.split('.')[0];

/**
 * Used to store a global instance of Vest.
 */
export const SYMBOL_VEST: symbol = Symbol.for(`VEST#${VEST_MAJOR}`);
