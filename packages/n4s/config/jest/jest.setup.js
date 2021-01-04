expect.extend({
  toPass: res => ({
    pass: res.pass,
    message: () => 'enforceResult.pass failed validation',
  }),
  toPassWith: (enforcement, value) => {
    return {
      pass:
        enforcement.run(value).pass === true &&
        enforcement.test(value) === true,
      message: () => 'enforceResult.pass failed validation',
    };
  },
});
