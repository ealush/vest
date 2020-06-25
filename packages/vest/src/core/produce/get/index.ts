import collectFailureMessages from '../collectFailureMessages';

const get = (
  state: ISuiteState,
  severityKey: SeverityKey,
  fieldName?: string
): GetResultType => {
  const res = collectFailureMessages(state, severityKey, { fieldName });

  if (fieldName) {
    // @ts-ignore
    return res[fieldName] || [];
  } else {
    return res;
  }
};

export default get;
