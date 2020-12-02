import enforce from 'enforce';
import runtimeRules from 'runtimeRules';

describe('enforce.template', () => {
  test('enforce has `template` static function', () => {
    expect(typeof enforce.template).toBe('function');
  });

  describe('Return value', () => {
    it('Should return a function', () => {
      const x = enforce.template(enforce.isArray(), enforce.longerThan(5));

      expect(typeof x).toBe('function');
    });

    it('Should have a static function called `run`', () => {
      const x = enforce.template(enforce.isArray(), enforce.longerThan(5));

      expect(typeof x.run).toBe('function');
    });
  });

  describe('When the returned function gets called', () => {
    it('Should throw an error when invalid', () => {
      const x = enforce.template(enforce.isArray(), enforce.longerThan(2));
      const y = enforce.template(enforce.isString(), enforce.isNumeric());
      expect(() => x([])).toThrow();
      expect(() => y('')).toThrow();
      expect(() => x([1])).toThrow();
      expect(() => x('hello')).toThrow();
      expect(() => y('hello')).toThrow();
    });

    it('Should return silently when valid', () => {
      const x = enforce.template(enforce.isArray(), enforce.longerThan(2));
      const y = enforce.template(enforce.isString(), enforce.isNumeric());

      x([1, 2, 3]);
      y('123');
    });

    it('Should return rules proxy', () => {
      const x = enforce.template(enforce.isArray());
      expect(x([])).toEqual(enforce(1));
      Object.keys(runtimeRules).forEach(k => {
        expect(typeof x([])[k]).toBe('function');
      });
    });
  });

  describe('When the `run` function gets called', () => {
    it('Should return `false` when invalid', () => {
      const x = enforce.template(enforce.isNumber().greaterThan(50));
      const y = enforce.template(
        enforce.isString().isNumeric(),
        enforce.isOdd()
      );

      expect(x).not.toPassWith(10);
      expect(x).not.toPassWith('90');
      expect(y).not.toPassWith(true);
      expect(x).not.toPassWith('90');
    });
    it('Should return `true` when valid', () => {
      const x = enforce.template(enforce.isNumber().greaterThan(50));
      const y = enforce.template(
        enforce.isString().isNumeric(),
        enforce.isOdd()
      );

      expect(x).toPassWith(51);
      expect(y).toPassWith('11');
    });
  });

  describe('joined templates', () => {
    it('Should validate all joined templates', () => {
      const X = enforce.template(enforce.isString(), enforce.longerThan(2));
      const Y = enforce.template(enforce.isNumeric());
      const Z = enforce.template(enforce.isEven());

      expect(() => enforce.template(X, Y, Z)('a')).toThrow();
      expect(() => enforce.template(X, Y, Z)('abc')).toThrow();
      expect(() => enforce.template(X, Y, Z)('111')).toThrow();
      expect(() => enforce.template(X, Y, Z)(112)).toThrow();
      enforce.template(X, Y, Z)('112');
      expect(enforce.template(X, Y, Z).run('112')).toMatchSnapshot();
      enforce.template(X, Y)('111');
      expect(enforce.template(X, Y).run('111')).toMatchSnapshot();
      enforce.template(X)('abc');
      expect(enforce.template(X).run('abc')).toMatchSnapshot();
    });
  });
});

describe('With nested values', () => {
  const Person = enforce.template(
    enforce.loose({
      name: enforce.loose({
        first: enforce.isString().isNotEmpty(),
        last: enforce.isString().longerThan(2),
        middle: enforce.optional(enforce.isString().isNotEmpty()),
      }),
    })
  );

  const Entity = enforce.template(
    enforce.loose({
      id: enforce
        .isString()
        .startsWith('o.')
        .message('Entity id must be valid'),
    })
  );

  const User = enforce.template(
    enforce.loose({
      name: enforce.loose({ username: enforce.isString().longerThan(3) }),
      friends: enforce
        .isArrayOf(Entity)
        .message('friend id must be a valid entity id'),
    }),
    Entity,
    Person
  );

  it('Should correctly validate template', () => {
    const res_1 = User.run({
      name: {
        first: 'Klaus',
        last: 'Hargreeves',
        username: 'No.5',
      },
      id: 'o.5',
      friends: [
        { id: 'o.1' },
        { id: 'o.2' },
        { id: 'o.3' },
        { id: 'o.4' },
        { id: 'o.6' },
        { id: 'o.7' },
      ],
    });

    expect(res_1.pass).toBe(true);
    expect(res_1).toMatchSnapshot();

    const res_2 = User.run({
      name: {
        first: 'Klaus',
        last: 'Hargreeves',
        username: 'No.5',
      },
      id: 'o.5',
      friends: [{ id: 'o.1' }, { id: 'invalid_id' }],
    });

    expect(res_2.pass).toBe(false);
    expect(res_2).toMatchSnapshot();

    const res_3 = User.run({
      name: {
        first: 'Klaus',
        last: 'Hargreeves',
        username: '#5',
      },
      id: 'x5',
      friends: [{ id: 'o.1' }],
    });

    expect(res_3.pass).toBe(false);
    expect(res_3).toMatchSnapshot();
  });
});
