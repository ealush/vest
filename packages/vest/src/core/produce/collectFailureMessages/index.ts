import { SEVERITY_GROUP_WARN } from '../constants';

const collectFailureMessages = (
  state: ISuiteState,
  severity: SeverityKey,
  { group, fieldName }: { group?: string; fieldName?: string } = {}
): GetResultType =>
  state.testObjects.reduce((collector, testObject) => {
    if (group && testObject.groupName !== group) {
      return collector;
    }

    if (fieldName && testObject.fieldName !== fieldName) {
      return collector;
    }

    if (!testObject.failed) {
      return collector;
    }

    if (
      (severity !== SEVERITY_GROUP_WARN && testObject.isWarning) ||
      (severity === SEVERITY_GROUP_WARN && !testObject.isWarning)
    ) {
      return collector;
    }

    collector[testObject.fieldName] = (
      collector[testObject.fieldName] || []
    ).concat(testObject.statement);

    return collector;
  }, {});

export default collectFailureMessages;
