import collectFailureMessages from 'collectFailureMessages';

/**
 * @param {'errors'|'warnings'} severityKey lookup severity
 * @param {string} [fieldName]
 * @returns suite or field's errors or warnings.
 */
export default function getFailures(severityKey, fieldName) {
  return collectFailureMessages(severityKey, { fieldName });

}
