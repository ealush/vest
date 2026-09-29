import { describe, expect, it } from 'vitest';

import { enforce } from '../n4s';

describe('enforce.extend registration', () => {
  it('rejects non-callable extension rules before mutation', () => {
    const custom = enforce as unknown as Record<string, unknown>;
    expect(() =>
      (enforce.extend as any)({ invalidExtensionRule: 42 }),
    ).toThrowError(
      'enforce.extend() rule "invalidExtensionRule" must be a function',
    );
    expect(custom.invalidExtensionRule).toBeUndefined();
  });

  it('keeps explicit undefined output from a custom transform', () => {
    (enforce.extend as any)({
      explicitUndefinedTransform: () => ({ pass: true, type: undefined }),
    });
    const rule = (enforce as any).explicitUndefinedTransform();
    const result = rule.run('input');
    expect(result.pass).toBe(true);
    expect(result.type).toBeUndefined();
  });
});
