import { RuleRunReturn } from '../../utils/RuleRunReturn';

export function mapPassing<TInput, TOutput>(
  transform: (value: TInput) => TOutput,
): (value: TInput) => RuleRunReturn<TOutput> {
  return (value: TInput) => RuleRunReturn.Passing(transform(value));
}
