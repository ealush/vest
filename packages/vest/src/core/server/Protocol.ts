import { VEST_VERSION } from '../../constants';

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
    version: VEST_VERSION,
    payload: serializedTree,
  }),
  validate: (input: any): input is VestEnvelope =>
    isEnvelope(input) && isValidVersion(input),
};

function isEnvelope(input: any): input is VestEnvelope {
  return (
    !!input &&
    typeof input === 'object' &&
    input[SENTINEL] === true &&
    typeof input.payload === 'string'
  );
}

function isValidVersion(input: VestEnvelope): boolean {
  if (input.version !== VEST_VERSION) {
    // eslint-disable-next-line no-console
    console.warn(
      `[Vest] Version Mismatch. Client: ${VEST_VERSION}, Server: ${input.version}. Validation result ignored.`,
    );
    return false;
  }
  return true;
}
