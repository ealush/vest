function enforce(value: any) {
  const proxy = new Proxy(
    {},
    {
      get(_, prop) {},
    },
  );
}
