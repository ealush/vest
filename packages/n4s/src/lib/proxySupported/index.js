const GLOBAL_OBJECT = Function('return this')();

const proxySupported = () => typeof GLOBAL_OBJECT.Proxy === 'function';

export default proxySupported;
