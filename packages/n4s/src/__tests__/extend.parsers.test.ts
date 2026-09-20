import { describe, expect, it } from 'vitest';

import { EnforceSchemaError, enforce } from '../n4s';
import { mapWithoutValidation } from '../schema/mapWithoutValidation';

describe('enforce.extend parser registration', () => {
  it('rejects an unknown parser name before registering any rule', () => {
    const custom = enforce as unknown as Record<string, unknown>;
    expect(() =>
      (enforce.extend as any)(
        { atomicParserRule: (value: unknown) => ({ pass: true, type: value }) },
        { parsers: ['missingParserRule'] },
      ),
    ).toThrowError(EnforceSchemaError);
    expect(custom.atomicParserRule).toBeUndefined();
  });

  it('rejects duplicate parser names', () => {
    expect(() =>
      (enforce.extend as any)(
        {
          duplicateParserRule: (value: unknown) => ({
            pass: true,
            type: value,
          }),
        },
        { parsers: ['duplicateParserRule', 'duplicateParserRule'] },
      ),
    ).toThrowError(
      'enforce.extend() parser "duplicateParserRule" is listed more than once',
    );
  });

  it('rejects inherited parser names', () => {
    const rules = Object.assign(
      Object.create({ inheritedParserRule: () => true }),
      { ownParserRule: () => true },
    );
    expect(() =>
      (enforce.extend as any)(rules, {
        parsers: ['inheritedParserRule'],
      }),
    ).toThrowError(
      'enforce.extend() parser "inheritedParserRule" is not a declared rule',
    );
  });

  it('rejects non-callable extension rules before mutation', () => {
    const custom = enforce as unknown as Record<string, unknown>;
    expect(() =>
      (enforce.extend as any)({ invalidExtensionRule: 42 }),
    ).toThrowError(
      'enforce.extend() rule "invalidExtensionRule" must be a function',
    );
    expect(custom.invalidExtensionRule).toBeUndefined();
  });

  it('keeps explicit undefined output from a valid custom parser', () => {
    (enforce.extend as any)(
      {
        explicitUndefinedParser: () => ({ pass: true, type: undefined }),
      },
      { parsers: ['explicitUndefinedParser'] },
    );
    const rule = (enforce as any).explicitUndefinedParser();
    expect(mapWithoutValidation(rule, 'input')).toBeUndefined();
  });
});
