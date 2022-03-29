import { useSummary } from 'genTestsSummary';

export function isValid(fieldName?: string): boolean {
  const summary = useSummary();

  return Boolean(fieldName ? summary.tests?.[fieldName]?.valid : summary.valid);
}
