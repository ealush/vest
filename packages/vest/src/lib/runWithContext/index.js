import Context from '../../core/Context';
import singleton from '../singleton';

/**
 * Initializes a Vest context and runs a callback function.
 * @param {Object} parent Parent context.
 * @param {Function} fn Function to run after creating the context.
 * @returns {*} callback funcion output.
 */
const runWithContext = (parent, fn) => {
  let context = parent;

  if (singleton.useContext() !== parent) {
    context = new Context(parent);
  }

  const res = fn(context);

  Context.clear();
  return res;
};

export default runWithContext;
