import EnforceContext from 'EnforceContext';

/**
 * Determines whether we should bail out of an enforcement.
 *
 * @param {EnforceContext} ctx
 * @param {RuleResult} result
 */
export default function shouldFailFast(ctx, result) {
  if (result.pass || result.warn) {
    return false;
  }

  return !!EnforceContext.is(ctx) && ctx.failFast;
}
