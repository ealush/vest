export default function isProxySupported(): boolean {
  try {
    return typeof Proxy === 'function';
  } catch {
    return false;
  }
}
