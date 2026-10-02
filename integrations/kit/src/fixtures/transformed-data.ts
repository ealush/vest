import { enforce } from 'vest';

export const transformedAccountSchema = enforce.shape({
  age: enforce.isNumeric().toNumber(),
  email: enforce.isString().trim().toLower(),
});

export type TransformedAccountInput = Parameters<
  typeof transformedAccountSchema.parse
>[0];
export type TransformedAccountOutput = ReturnType<
  typeof transformedAccountSchema.parse
>;
