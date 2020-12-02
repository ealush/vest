import enforce from 'enforce';

describe('Deep enforcements', () => {
  it('Should match sucessful shapshot', () => {
    expect(
      enforce.shape(User).run({
        age: 18,
        country: 'US',
        user: {
          id: 20,
          name: { first: 'Teddie', last: 'Montes' },
        },
      })
    ).toMatchSnapshot();
  });

  it('Should match a partially failing shapshot', () => {
    expect(
      enforce.shape(User).run({
        age: 18,
        country: 'US',
        user: {
          id: null,
          name: { last: 'Montes' },
        },
      })
    ).toMatchSnapshot();
  });

  it('Should match a failing snapshot', () => {
    expect(enforce.shape(User).run({})).toMatchSnapshot();
    expect(enforce.shape(User)).not.toPassWith({});
  });
});

const User = {
  age: enforce.allOf(enforce.isNumeric(), enforce.greaterThanOrEquals(18)),
  country: enforce.oneOf(
    enforce.equals('US'),
    enforce.equals('Peru'),
    enforce.equals('Russia')
  ),
  user: enforce.shape({
    name: enforce.shape({
      first: enforce.isString().longerThan(2),
      last: enforce.isString().longerThan(1),
      middle: enforce.optional(enforce.isString()),
    }),
    id: enforce.anyOf(enforce.isString(), enforce.isNumber()),
  }),
};
