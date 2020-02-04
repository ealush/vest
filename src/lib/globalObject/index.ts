/**
 * Reference to global object.
 */
const globalObject: typeof globalThis = Function('return this')();

export default globalObject;
