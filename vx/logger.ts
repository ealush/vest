export type Logger = {
  log: typeof console.log;
  info: typeof console.info;
  error: typeof console.error;
};

export const log: Logger['log'] = console.log; // eslint-disable-line no-console
export const info: Logger['info'] = console.info; // eslint-disable-line no-console
export const error: Logger['error'] = console.error; // eslint-disable-line no-console
