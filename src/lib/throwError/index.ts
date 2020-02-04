/**
 * Throws a timed out error.
 * @param {String} message  Error message to display.
 * @param {Error} [type]    Alternative Error type.
 */
const throwError = (message: string, type = Error) => setTimeout(() => {
    throw new type(`[Vest]: ${message}`);
});

export default throwError;
