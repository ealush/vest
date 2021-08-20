import type { TRuleReturn } from 'ruleReturn';

export default function condition(
  value: any,
  callback: (value: any) => TRuleReturn
): TRuleReturn {
  try {
    return callback(value);
  } catch {
    return false;
  }
}
