/**
 * Module: `src/Isolate/IsolateStatus.ts`.
 *
 * Provides `IsolateStatus`-related runtime and type utilities used by `vestjs-runtime`.
 */
export const IsolateStatus = {
  DONE: 'DONE',
  HAS_PENDING: 'HAS_PENDING',
  INITIAL: 'INITIAL',
  PENDING: 'PENDING',
} as const;

export type IsolateStatus = (typeof IsolateStatus)[keyof typeof IsolateStatus];
