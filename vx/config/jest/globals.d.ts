declare global {
  namespace jest {
    interface Matchers<R> {
      isDeepCopyOf(clone: any): CustomMatcherResult;
    }
  }
}
export {};
