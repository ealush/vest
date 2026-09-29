import { RuleRunReturn } from '../../utils/RuleRunReturn';

/**
 * Marks a parser as a pre-type-check transform.
 * Parsers tagged with this symbol are prepended to the chain
 * so they run before type checks (e.g. defaultTo).
 */
export const CHAIN_PREPEND: unique symbol = Symbol('chainPrepend');

export function mapPassing<TInput, TOutput>(
  transform: (value: TInput) => TOutput,
): (value: TInput) => RuleRunReturn<TOutput> {
  return (value: TInput) => RuleRunReturn.Passing(transform(value));
}
