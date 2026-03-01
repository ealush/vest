import { RuleRunReturn } from '../../utils/RuleRunReturn';

const TRUTHY_STRINGS = new Set(['true', '1', 'yes', 'on']);
const FALSY_STRINGS = new Set(['false', '0', 'no', 'off']);

function parseStringBoolean(value: string): boolean | undefined {
  const normalized = value.trim().toLowerCase();
  if (TRUTHY_STRINGS.has(normalized)) {
    return true;
  }
  if (FALSY_STRINGS.has(normalized)) {
    return false;
  }

  return undefined;
}

function parseNumberBoolean(value: number): boolean | undefined {
  if (value === 1) return true;
  if (value === 0) return false;
  return undefined;
}

function parseBooleanValue(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return parseStringBoolean(value);
  if (typeof value === 'number') return parseNumberBoolean(value);
  return undefined;
}

export function toBoolean(value: unknown): RuleRunReturn<boolean> {
  const parsed = parseBooleanValue(value);
  if (parsed !== undefined) {
    return RuleRunReturn.Passing(parsed);
  }

  return RuleRunReturn.Failing(false, 'Could not parse to boolean');
}
