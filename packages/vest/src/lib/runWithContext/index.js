import Context from '../../core/Context';

/**
 * Initializes a Vest context and runs a callback function.
 * @param {Object} parent Parent context.
 * @param {Function} fn Function to run after creating the context.
 * @returns {*} callback function output.
 */
const runWithContext = (ctxRef, fn) => {
  const context = new Context(ctxRef);

  let res;

  try {
    res = fn(context);
  } catch {
    /*  */
  }
  Context.clear();

  return res;
};

export default runWithContext;
