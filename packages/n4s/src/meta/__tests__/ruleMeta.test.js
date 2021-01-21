import RuleResult from 'RuleResult';
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

describe('Rule with "when"', () => {
  it('Should skip all excluded array items', () => {
    const Schema = enforce.shape({
      items: enforce.isArrayOf(
        enforce.shape({ checked: enforce.isBoolean() }).when(value => {
          return value.checked;
        })
      ),
    });

    const res = Schema.run({
      items: [
        { checked: true },
        { checked: false },
        { checked: false },
        { checked: true },
      ],
    });

    expect(res.children.items.children[0]).toBeInstanceOf(RuleResult);
    expect(res.children.items.children[1]).toBeUndefined();
    expect(res.children.items.children[2]).toBeUndefined();
    expect(res.children.items.children[3]).toBeInstanceOf(RuleResult);

    expect(res).toMatchSnapshot();
  });

  it('Should skip excluded object items', () => {
    const Schema = enforce.shape({
      example: enforce.isString().when(() => false),
      example1: enforce.isString(),
    });

    const res = Schema.run({
      example: 'something',
      example1: 'something',
    });

    expect(res.children.example).toBeUndefined();
    expect(res.children.example1).toBeInstanceOf(RuleResult);

    expect(res).toMatchSnapshot();
  });
  it('Should pass each item the value, key and parent', () => {
    const whenItems = jest.fn();
    const whenName = jest.fn();
    const Schema = enforce.shape({
      name: enforce
        .shape({
          first: enforce.isString(),
        })
        .when(whenName),
      items: enforce.isArrayOf(
        enforce.shape({ checked: enforce.isBoolean() }).when(whenItems)
      ),
    });

    const data = {
      name: {
        first: 'example',
      },
      items: [
        { checked: true },
        { checked: false },
        { checked: false },
        { checked: true },
      ],
    };

    Schema.run(data);

    expect(whenName).toHaveBeenCalledWith(data.name, 'name', data);

    expect(whenItems.mock.calls[0][0]).toBe(data.items[0]);
    expect(whenItems.mock.calls[1][0]).toBe(data.items[1]);
    expect(whenItems.mock.calls[2][0]).toBe(data.items[2]);
    expect(whenItems.mock.calls[3][0]).toBe(data.items[3]);
    expect(whenItems.mock.calls[0][1]).toBe(0); // key
    expect(whenItems.mock.calls[1][1]).toBe(1); // key
    expect(whenItems.mock.calls[2][1]).toBe(2); // key
    expect(whenItems.mock.calls[3][1]).toBe(3); // key
    expect(whenItems.mock.calls[0][2]).toBe(data.items); // parent
    expect(whenItems.mock.calls[1][2]).toBe(data.items); // parent
    expect(whenItems.mock.calls[2][2]).toBe(data.items); // parent
    expect(whenItems.mock.calls[3][2]).toBe(data.items); // parent
  });
});
