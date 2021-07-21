export type TRuleReturn =
  | boolean
  | {
      pass: boolean;
      message?: string | (() => string);
    };

export type TRuleDetailedResult = { pass: boolean; message?: string };

export type TLazyRuleMethods = {
  test: (value: unknown) => boolean;
  run: (value: unknown) => TRuleDetailedResult;
};

export function failing(): TRuleDetailedResult {
  return { pass: false };
}

export function passing(): TRuleDetailedResult {
  return { pass: true };
}
