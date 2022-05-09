import { TestsContainer, useSummary } from 'genTestsSummary';

export function isValid(fieldName?: string): boolean {
  const summary = useSummary();

  return fieldName
    ? Boolean(isFieldValid(summary.tests, fieldName))
    : summary.valid;
}

export function isValidByGroup(groupName: string, fieldName?: string): boolean {
  const summary = useSummary();

  const group = summary.groups[groupName];

  if (!group) {
    return false;
  }

  if (fieldName) {
    return isFieldValid(group, fieldName);
  }

  for (const fieldName in group) {
    if (!isFieldValid(group, fieldName)) {
      return false;
    }
  }

  return true;
}

function isFieldValid(
  testContainer: TestsContainer,
  fieldName: string
): boolean {
  return !!testContainer[fieldName]?.valid;
}
