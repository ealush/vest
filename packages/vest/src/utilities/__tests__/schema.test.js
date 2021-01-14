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

  it('Should return error messages when they should appear', () => {
    const Name = enforce.loose({
      name: enforce
        .loose({
          first: enforce.isString().isNotEmpty().message('first_name_error'),
          last: enforce.isString().isNotEmpty().message('last_name_error'),
        })
        .message('name_error'),
    });

    const Schema = schema(Name);
    const res = Schema({ name: {} });

    expect(res.hasErrors()).toBe(true);
    expect(res.getErrors()).toEqual({
      name: ['name_error', 'first_name_error', 'last_name_error'],
      'name.first': ['first_name_error'],
      'name.last': ['last_name_error'],
    });
  });
});

describe('schema function body', () => {
  const Shape = enforce.shape({
    a: enforce.isNumber().message('"a" must be a number'),
    b: enforce.isString().isNumeric().message('"b" must be a numeric string'),
    c: enforce.isArrayOf(
      enforce.shape({ id: enforce.isString() }).message('id must be a string')
    ),
  });

  const data = {
    a: 'not_a_number',
    b: 22,
    c: [{ id: 1 }, { id: 2 }, { id: '3' }],
  };

  it('passes all arguments to function body', () => {
    const body = jest.fn();

    const Schema = schema(Shape, body);
    Schema(data, 'args1', 'args2', 'etc');

    expect(body).toHaveBeenCalledWith(data, 'args1', 'args2', 'etc');
  });

  describe('schema.skip', () => {
    it('Should validate all but skipped fields', () => {
      const data = {
        a: 'not_a_number',
        b: 22,
        c: [{ id: 1 }, { id: 2 }, { id: '3' }],
      };
      {
        const Schema = schema(Shape, () => {
          schema.skip('a');
        });
        const result = Schema(data);
        expect(result.getErrors('a')).toEqual([]);
        expect(result.hasErrors('a')).toBe(false);
        expect(result.getErrors('b')).toEqual(['"b" must be a numeric string']);
        expect(result.hasErrors('b')).toBe(true);
        expect(result.tests).not.toHaveProperty('a');
        expect(result.tests.b).toBeDefined();
        expect(result.tests.c).toBeDefined();
        expect(result.tests['c[0]']).toBeDefined();
        expect(result.tests['c[0].id']).toBeDefined();
        expect(result.tests['c[1].id']).toBeDefined();
        expect(result.tests['c[2].id']).toBeDefined();
        expect(result.tests).toMatchSnapshot();
        expect(result.getErrors()).toMatchSnapshot();
      }
      {
        const Schema = schema(Shape, () => {
          schema.skip('c');
        });
        const result = Schema(data);
        expect(result.getErrors('a')).toEqual(['"a" must be a number']);
        expect(result.hasErrors('a')).toBe(true);
        expect(result.hasErrors('c')).toBe(false);
        expect(result.getErrors('c')).toEqual([]);
        expect(result.hasErrors('c[0]')).toBe(false);
        expect(result.hasErrors('c[0].id')).toBe(false);
        expect(result.tests.a).toBeDefined();
        expect(result.tests.b).toBeDefined();
        expect(result.tests).not.toHaveProperty('c');
        expect(result.tests).not.toHaveProperty('c[0]');
        expect(result.tests).not.toHaveProperty('c[1]');
        expect(result.tests).not.toHaveProperty('c[2]');
        expect(result.tests).not.toHaveProperty('c[0].id');
        expect(result.tests).not.toHaveProperty('c[1].id');
        expect(result.tests).not.toHaveProperty('c[2].id');
        expect(result.tests).toMatchSnapshot();
        expect(result.getErrors()).toMatchSnapshot();
      }
      {
        const Schema = schema(Shape, () => {
          schema.skip('a');
          schema.skip('b');
        });
        const result = Schema(data);
        expect(result.tests.a).not.toBeDefined();
        expect(result.tests.b).not.toBeDefined();
        expect(result.tests.c).toBeDefined();
        expect(result.tests).toMatchSnapshot();
        expect(result.getErrors()).toMatchSnapshot();
      }
    });
  });
  describe('schema.only', () => {
    it('Should only validate included fields', () => {
      const data = {
        a: 'not_a_number',
        b: 22,
        c: [{ id: 1 }, { id: 2 }, { id: '3' }],
      };
      {
        const Schema = schema(Shape, () => {
          schema.only('a');
        });
        const result = Schema(data);
        expect(result.hasErrors('a')).toBe(true);
        expect(result.getErrors('a')).toEqual(['"a" must be a number']);
        expect(result.hasErrors('b')).toBe(false);
        expect(result.hasErrors('c')).toBe(false);
        expect(result.tests.a).toBeDefined();
        expect(result.tests.b).not.toBeDefined();
        expect(result.tests.c).not.toBeDefined();
        expect(result.tests['c[0]']).not.toBeDefined();
        expect(result.tests['c[0].id']).not.toBeDefined();
        expect(result.tests['c[1].id']).not.toBeDefined();
        expect(result.tests['c[2].id']).not.toBeDefined();
        expect(result.tests).toMatchSnapshot();
        expect(result.getErrors()).toMatchSnapshot();
      }
    });
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
