import { describe, it, expect, vi } from 'vitest';

import { Protocol } from '../Protocol';
import { VEST_RUNTIME_VERSION } from '../Version';

describe('Protocol', () => {
  it('wraps payloads with the sentinel and version', () => {
    const envelope = Protocol.wrap('payload');

    expect(envelope.__vest_sentinel__).toBe(true);
    expect(envelope.version).toBe(VEST_RUNTIME_VERSION);
    expect(envelope.payload).toBe('payload');
  });

  it('validates envelopes with matching versions', () => {
    const envelope = Protocol.wrap('payload');

    expect(Protocol.validate(envelope)).toBe(true);
  });

  it('rejects envelopes with mismatched versions and warns', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const envelope = Protocol.wrap('payload');
    const mismatched = { ...envelope, version: `${VEST_RUNTIME_VERSION}-x` };

    expect(Protocol.validate(mismatched)).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Version Mismatch'),
    );

    consoleSpy.mockRestore();
  });

  it('rejects non-envelope payloads', () => {
    expect(Protocol.validate('payload')).toBe(false);
    expect(Protocol.validate({})).toBe(false);
    expect(Protocol.validate({ __vest_sentinel__: true })).toBe(false);
  });
});
