import ctx from 'ctx';

const getStateRef = () => ctx.use().stateRef;

export function usePending() {
  return getStateRef().pending();
}
export function useSuiteId() {
  return getStateRef().suiteId();
}
export function useTestCallbacks() {
  return getStateRef().testCallbacks();
}
export function useTestObjects() {
  return getStateRef().testObjects();
}
export function useSkippedTests() {
  return getStateRef().skippedTests();
}
export function useOptionalFields() {
  return getStateRef().optionalFields();
}
