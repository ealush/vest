import { VEST_RUNTIME_VERSION } from './Version';

export const SENTINEL = '__vest_sentinel__' as const;

export interface VestEnvelope {
  [SENTINEL]: true;
  version: string;
  payload: string;
  meta?: Record<string, any>;
}

export const Protocol = {
  wrap: (serializedTree: string): VestEnvelope => ({
    [SENTINEL]: true,
    version: VEST_RUNTIME_VERSION,
    payload: serializedTree,
  }),
  validate: (input: any): input is VestEnvelope => {
    if (!input || typeof input !== 'object') {
      return false;
    }
    if (input[SENTINEL] !== true) {
      return false;
    }
    if (typeof input.payload !== 'string') {
      return false;
    }
    if (input.version !== VEST_RUNTIME_VERSION) {
      console.warn(
        `[Vest] Version Mismatch. Client: ${VEST_RUNTIME_VERSION}, Server: ${input.version}. Validation result ignored.`,
      );
      return false;
    }
    return true;
  },
};
