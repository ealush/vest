import { enforce } from 'vest';

export const nestedAccountSchema = enforce.shape({
  profile: enforce.shape({ name: enforce.isString().trim().isNotBlank() }),
  contacts: enforce.isArrayOf(
    enforce.shape({
      email: enforce
        .isString()
        .trim()
        .toLower()
        .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
    }),
  ),
});

export type NestedAccountInput = Parameters<
  typeof nestedAccountSchema.parse
>[0];
export type NestedAccountOutput = ReturnType<typeof nestedAccountSchema.parse>;

export const validNestedAccount: NestedAccountInput = {
  profile: { name: 'Ada Lovelace' },
  contacts: [{ email: 'ada@example.com' }],
};

export const invalidNestedAccount: NestedAccountInput = {
  profile: { name: '' },
  contacts: [{ email: 'invalid' }],
};
