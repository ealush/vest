import enforce from 'enforce';
import schema from 'schema';

describe('schema', () => {
  it('Should correctly present test results', () => {
    const Schema = schema(User);
    const res = Schema({
      user: {
        name: { first: {}, last: 'last' },
      },
      id: 'x.',
      friends: [
        {
          name: {
            first: 'first_name',
            last: 1,
            middle: [],
            username: 0,
          },
        },
      ],
    });

    expect(res.hasErrors()).toBe(true);
    expect(res.hasWarnings()).toBe(true);
    expect(res.hasErrors('user')).toBe(true);
    expect(res.hasWarnings('user')).toBe(false);
    expect(res.hasErrors('user.name')).toBe(true);
    expect(res.hasWarnings('user.name')).toBe(false);
    expect(res.hasErrors('user.name.first')).toBe(true);
    expect(res.hasErrors('user.name.last')).toBe(false);
    expect(res.hasErrors('user.name.middle')).toBe(false);
    expect(res.hasErrors('id')).toBe(true);
    expect(res.hasErrors('friends')).toBe(true);
    expect(res.hasErrors('friends[0]')).toBe(true);
    expect(res.hasErrors('friends[0].name')).toBe(true);
    expect(res.hasErrors('friends[0].name.first')).toBe(false);
    expect(res.hasErrors('friends[0].name.last')).toBe(false);

    expect(res).toMatchSnapshot();
  });

  it('Should bubble error and warning messages up to the ancestor', () => {
    const Schema = schema(User);
    const res = Schema({
      user: {
        name: { first: null, last: null },
      },
      id: null,
      friends: [
        {
          name: {
            first: null,
            last: null,
            middle: null,
          },
        },
        {
          name: {
            first: null,
            last: null,
            middle: null,
          },
        },
      ],
    });

    expect(res.getErrors('user.name')).toEqual([
      ...res.getErrors('user.name.username'),
      ...res.getErrors('user.name.first'),
      ...res.getErrors('user.name.last'),
      ...res.getErrors('user.name.middle'),
    ]);
    expect(res.getWarnings('user.name')).toEqual(
      res.getWarnings('user.name.last')
    );
    expect(res.getErrors('friends')).toEqual([
      ...res.getErrors('friends[0].id'),
      ...res.getErrors('friends[0].name.first'),
      ...res.getErrors('friends[0].name.last'),
      ...res.getErrors('friends[0].name.middle'),
    ]);
  });
});

const Name = enforce.loose({
  first: enforce.isString().message('First name must be a string'),
  last: enforce.isString().warn().message('last name must be a string'),
  middle: enforce
    .optional(enforce.isString().message('middle must be a string'))
    .message('if present, middle name must be a string'),
});

const Entity = enforce.loose({
  id: enforce
    .isString()
    .startsWith('x0.')
    .message('id must be a string starting with x0.'),
});

const Friends = enforce.isArrayOf(
  enforce.template(
    enforce.loose({
      name: Name,
    }),
    Entity
  )
);
const User = enforce.template(
  enforce.loose({
    user: enforce.shape({
      name: enforce.template(
        Name,
        enforce.loose({
          username: enforce.isString().message('User name must be a string'),
        })
      ),
    }),
    friends: Friends,
  }),
  Entity
);
