export {};

declare global {
  namespace jest {
    interface It {
      withContext: (
        message: string,
        cb: () => void,
        getCTX?: () => Record<string, any>
      ) => void;
    }
    interface JestMatchers {
      isDeepCopyOf(clone: any): CustomMatcherResult;
    }
    interface Matchers {
      // toPass(): R;
      // toPassWith(res: any): R;
      isDeepCopyOf(clone: any): CustomMatcherResult;
    }
  }
}
