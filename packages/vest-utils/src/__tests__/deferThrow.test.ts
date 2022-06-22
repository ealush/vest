import { deferThrow } from 'vest-utils';

// @ts-ignore
const _to = global.setTimeout;
describe('deferThrow', () => {
  beforeEach(() => {
    // @ts-ignore
    global.setTimeout = jest.fn();
  });

  afterEach(() => {
    global.setTimeout = _to;
  });
  it('Should start a timer', () => {
    deferThrow();
    expect(global.setTimeout).toHaveBeenCalled();
  });

  it('Should throw a timed out error with the provided message', () => {
    deferThrow('message');
    const timeoutCB = global.setTimeout.mock.calls[0][0];
    expect(() => timeoutCB()).toThrow('message');
  });
});
