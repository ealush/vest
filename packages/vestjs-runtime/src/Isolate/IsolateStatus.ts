export const IsolateStatus = {
  DONE: 'DONE',
  HAS_PENDING: 'HAS_PENDING',
  INITIAL: 'INITIAL',
  PENDING: 'PENDING',
} as const;

export type IsolateStatus = (typeof IsolateStatus)[keyof typeof IsolateStatus];
