import Context from '../../core/Context';

/**
 * Initializes a Vest context and runs a callback function.
 */
const runWithContext = <T>(ctxRef: Object, fn: (context: Context) => T): T => {
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
