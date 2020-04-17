import Context from "../../core/Context";

/**
 * Initializes a Vest context and runs a callback function.
 * @param {Object} parent Parent context.
 * @param {Function} fn Function to run after creating the context.
 * @returns {*} callback funcion output.
 */
const runWithContext = (parent, fn) => {
  new Context(parent);
  const res = fn();
  Context.clear();
  return res;
};

export default runWithContext;
