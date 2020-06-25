const VEST_MAJOR = VEST_VERSION.split('.')[0];

export const SYMBOL_VEST_GLOBAL = Symbol.for(`__INTERNAL__VEST#${VEST_MAJOR}`);
