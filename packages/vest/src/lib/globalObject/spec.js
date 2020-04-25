import globalObject from '.';

it('Should expose global object', () => {
  expect(globalObject).toBe(global);
});
