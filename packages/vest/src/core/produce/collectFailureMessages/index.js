/**
 * @param {string} suiteId            Current suite id.
 * @param {'warn'|'error'} severity   Filter by severity.
 * @param {string} [group]            Group to collect messages from.
 * @returns all messages for given criteria.
 */
const collectFailureMessages = (state, severity, group) => {
  const collector = {};

  const collectFrom = group ? state.groups[group] : state.tests;

  for (const fieldName in collectFrom) {
    if (collectFrom?.[fieldName] && collectFrom?.[fieldName][severity]) {
      collector[fieldName] = collectFrom[fieldName][severity];
    }
  }

  return collector;
};

export default collectFailureMessages;
