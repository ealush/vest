/**
 * Minimal logger interface used across vx scripts.
 * @type {{ log: typeof console.log, info: typeof console.info, error: typeof console.error }}
 */
export const log = console.log; // eslint-disable-line no-console
export const info = console.info; // eslint-disable-line no-console
export const error = console.error; // eslint-disable-line no-console
