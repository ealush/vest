import vest from 'vest';

describe('suite.subscribe', () => {
  let suite;
  let handler;
  beforeEach(() => {
    handler = jest.fn();
    suite = vest.create(() => {});
  });

  it('Should call handler on suite subscription initialization', () => {
    suite();

    expect(handler).toHaveBeenCalledTimes(0);
    suite.subscribe(handler);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('Should call handler on suite subscription initialization', () => {
    suite();

    suite.subscribe(handler);
    expect(handler.mock.calls[0]).toMatchSnapshot();
  });
});
