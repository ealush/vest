import { useInfo } from './useInfo';

// @vx-allow use-use
export function info(): void {
  const setInfo = useInfo();
  setInfo();
}
