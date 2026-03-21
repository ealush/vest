import { useSuccess } from './useSuccess';

// @vx-allow use-use
export function success(): void {
  const setSuccess = useSuccess();
  setSuccess();
}
