/* eslint-disable max-params */
import { hasLogic } from '../has';

/**
 * Checks whether there are failures in a given group.
 */
const hasByGroup = (
  state: ISuiteState,
  severityKey: SeverityKey,
  group: string,
  fieldName?: string
): boolean =>
  state.testObjects.some(testObject => {
    if (group !== testObject.groupName) {
      return false;
    }
    return hasLogic(testObject, severityKey, fieldName);
  });

export default hasByGroup;
