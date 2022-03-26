import type { RuleReturn } from 'ruleReturn';

export function condition(
  value: any,
  callback: (value: any) => RuleReturn
): RuleReturn {
  try {
    return callback(value);
  } catch {
    return false;
  }
}
