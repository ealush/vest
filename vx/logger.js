/**
 * Minimal logger interface used across vx scripts.
 * @type {{ log: typeof console.log, info: typeof console.info, error: typeof console.error }}
 */
module.exports = {
  log: console.log, // eslint-disable-line no-console
  info: console.info, // eslint-disable-line no-console
  error: console.error, // eslint-disable-line no-console
};
