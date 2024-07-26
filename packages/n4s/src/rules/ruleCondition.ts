import type { RuleReturn } from '@/lib/ruleReturn';

export function condition(
  value: any,
  callback: (value: any) => RuleReturn,
): RuleReturn {
  try {
    return callback(value);
  } catch {
    return false;
  }
}
