export const IsolateStatus = {
  INITIAL: 'INITIAL',
  PENDING: 'PENDING',
  DONE: 'DONE',
} as const;

export type IsolateStatus = (typeof IsolateStatus)[keyof typeof IsolateStatus];
