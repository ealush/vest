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
