declare global {
  namespace jest {
    interface JestMatchers {
      isDeepCopyOf(clone: any): CustomMatcherResult;
    }
    interface Matchers {
      isDeepCopyOf(clone: any): CustomMatcherResult;
    }
  }
}
export {};
