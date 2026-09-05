import { RuleRunReturn } from '../../utils/RuleRunReturn';

/**
 * Marks a parser as a pre-type-check transform.
 * Parsers tagged with this symbol are prepended to the chain
 * so they run before type checks (e.g. defaultTo).
 */
export const CHAIN_PREPEND: unique symbol = Symbol('chainPrepend');

const parserRules = new WeakSet<CallableFunction>();

export function registerParserRules(
  rules: Readonly<Record<string, CallableFunction>>,
): void {
  for (const rule of Object.values(rules)) parserRules.add(rule);
}

export function isParserRule(rule: unknown): rule is CallableFunction {
  return typeof rule === 'function' && parserRules.has(rule);
}

export function mapPassing<TInput, TOutput>(
  transform: (value: TInput) => TOutput,
): (value: TInput) => RuleRunReturn<TOutput> {
  return (value: TInput) => RuleRunReturn.Passing(transform(value));
}
