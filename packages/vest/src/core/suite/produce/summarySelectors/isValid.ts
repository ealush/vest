import { useSummary } from 'genTestsSummary';

export function isValid(fieldName?: string): boolean {
  const summary = useSummary();

  return fieldName ? Boolean(summary.tests[fieldName]?.valid) : summary.valid;
}
