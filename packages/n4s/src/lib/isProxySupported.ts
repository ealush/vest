import { isFunction } from 'vest-utils';

export default function isProxySupported(): boolean {
  try {
    return isFunction(Proxy);
  } catch {
    return false;
  }
}
