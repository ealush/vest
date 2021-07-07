/**
 * Checks that at all passed arguments evaluate to a truthy value.
 */
declare function all(...args: unknown[]): boolean;
/**
 * Checks that at least one passed argument evaluates to a truthy value.
 */
declare function any(...args: unknown[]): boolean;
/**
 * Checks that at none of the passed arguments evaluate to a truthy value.
 */
declare function none(...args: unknown[]): boolean;
/**
 * Checks that at only one passed argument evaluates to a truthy value.
 */
declare function one(...args: unknown[]): boolean;
export { all, any, none, one };
