import type { FieldSnapshot, SuiteFocus, SuiteSnapshot } from '../types';

export type SuiteStatus = 'valid' | 'invalid' | 'unknown';

export function deriveSuiteStatus(snapshot?: SuiteSnapshot): SuiteStatus {
  if (!snapshot) {
    return 'unknown';
  }
  if (snapshot.valid === true) {
    return 'valid';
  }
  if (snapshot.valid === false) {
    return 'invalid';
  }
  return 'unknown';
}

export function getFieldStatusLabel(status: FieldSnapshot['status']) {
  switch (status) {
    case 'failing':
      return 'error';
    case 'warning':
      return 'warning';
    case 'pending':
      return 'pending';
    case 'passing':
      return 'passing';
    default:
      return 'idle';
  }
}

export function getFocusTag(
  focus: SuiteFocus,
  fieldName: string,
): 'only' | 'skip' | null {
  if (!focus?.mode) {
    return null;
  }

  if (focus.matchAll) {
    return focus.mode;
  }

  return focus.match.includes(fieldName) ? focus.mode : null;
}

export function filterFields(fields: FieldSnapshot[], query: string) {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return fields;
  }

  return fields.filter(field => field.name.toLowerCase().includes(trimmed));
}

export function getInputFromArgs(args: unknown[]) {
  if (!args?.length) {
    return {};
  }
  return args[0] ?? {};
}
