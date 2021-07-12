import ctx from 'ctx';

export function useCarryOverTests() {
  return useStateRef().carryOverTests();
}
export function usePending() {
  return useStateRef().pending();
}
export function useLagging() {
  return useStateRef().lagging();
}
export function useSuiteId() {
  return useStateRef().suiteId();
}
export function useTestCallbacks() {
  return useStateRef().testCallbacks();
}
export function useTestObjects() {
  return useStateRef().testObjects();
}
export function useSkippedTests() {
  return useStateRef().skippedTests();
}
export function useOptionalFields() {
  return useStateRef().optionalFields();
}
export function useStateRef() {
  return ctx.use()!.stateRef!;
}
