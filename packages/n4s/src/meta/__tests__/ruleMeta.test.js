import enforce from 'enforce';

describe('Rule with a message', () => {
  it('Should add message to result', () => {
    const res = enforce
      .shape({
        id: enforce.isNumeric().message('id must be numeric'),
        user: enforce.shape({
          name: enforce.shape({
            first: enforce
              .isString()
              .message(name => `${name} is not a valid first name`),
            last: enforce.isString().message('Last name is not valid'),
            middle: enforce
              .optional(enforce.isString())
              .message('When present, middle name must be a string'),
          }),
        }),
      })
      .run({
        user: {
          name: { first: 'somename', last: {} },
          id: 'id',
        },
      });

    expect(res.children.id.message).toBe('id must be numeric');
    expect(res.children.user.children.name.children.first.message).toBe(
      'somename is not a valid first name'
    );
    expect(res.children.user.children.name.children.middle.message).toBe(
      'When present, middle name must be a string'
    );
    expect(res).toMatchSnapshot();
  });
});

describe('Rule with a warning', () => {
  it('Should add a warning to the result', () => {
    const res = enforce
      .shape({
        id: enforce.isNumeric().warn(),
        user: enforce.shape({
          name: enforce.shape({
            first: enforce.isString().warn(),
            last: enforce.isString(),
            middle: enforce.optional(enforce.isString()).warn(),
            username: enforce.isString().longerThan(3).warn(),
          }),
        }),
      })
      .run({
        user: {
          name: { first: 'somename', last: {}, username: 'usr' },
          id: 'id',
        },
      });

    expect(res.children.id.warn).toBe(true);
    expect(res.children.user.children.name.children.first.warn).toBe(true);
    expect(res.children.user.children.name.children.middle.warn).toBe(true);
    expect(res).toMatchSnapshot();
  });
});
