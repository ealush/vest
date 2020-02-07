/**
 * Throws a timed out error.
 */
const throwError = (message: string, type: ErrorConstructor|TypeErrorConstructor = Error) => setTimeout(() => {
    throw new type(`[Vest]: ${message}`);
});

export default throwError;
