import isFunction from 'isFunction';

const GLOBAL_OBJECT = Function('return this')();

const proxySupported = () => isFunction(GLOBAL_OBJECT.Proxy);

export default proxySupported;
