import run from 'runAnyoneMethods';

/**
 * Checks that at least one passed argument evaluates to a truthy value.
 * @param  {[]*} [args] Any amount of values or expressions.
 * @returns {Boolean}
 */
const any = (...args) => args.some(run);

export default any;
