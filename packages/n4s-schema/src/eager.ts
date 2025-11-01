function _enforce(_value: any) {
  const _proxy = new Proxy(
    {},
    {
      get(_, _prop) {
        return undefined;
      },
    },
  );
  return _proxy;
}

export { _enforce };
