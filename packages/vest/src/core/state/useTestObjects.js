import context from 'ctx';

export default function usePending() {
  return context.use().stateRef.testObjects();
}
