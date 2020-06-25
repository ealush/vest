import { SEVERITY_GROUP_WARN } from '../constants';

/**
 * Determines whether a certain test profile has failures.
 */
export const hasLogic = (
  testObject,
  severityKey: SeverityKey,
  fieldName?: string
): boolean => {
  if (!testObject.failed) {
    return false;
  }

  if (fieldName && fieldName !== testObject.fieldName) {
    return false;
  }

  if (
    (severityKey === SEVERITY_GROUP_WARN && !testObject.isWarning) ||
    (severityKey !== SEVERITY_GROUP_WARN && testObject.isWarning)
  ) {
    return false;
  }

  return true;
};

const has = (
  state: ISuiteState,
  severityKey: SeverityKey,
  fieldName: string
): boolean =>
  state.testObjects.some(testObject =>
    hasLogic(testObject, severityKey, fieldName)
  );

export default has;
