/**
 * Throws a timed out error.
 * @param {String} message  Error message to display.
 * @param {Error} [type]    Alternative Error type.
 */
const throwError = (message, type = Error) => {
  const error = new type(`[Vest]: ${message}`);
  setTimeout(() => {
    throw error;
  });
  return error;
};

export default throwError;
