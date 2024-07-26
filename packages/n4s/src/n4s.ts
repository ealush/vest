export { enforce } from '@/runtime/enforce';
export { ctx } from '@/runtime/enforceContext';

/* eslint-disable @typescript-eslint/no-namespace, @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars */
declare global {
  namespace n4s {
    interface EnforceCustomMatchers<R> {}
  }
}
