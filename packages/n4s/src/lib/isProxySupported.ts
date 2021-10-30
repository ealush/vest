import isFunction from 'isFunction';

export default function isProxySupported(): boolean {
  try {
    return isFunction(Proxy);
  } catch {
    return false;
  }
}
