import compose from 'compose';
import enforce from 'n4s';
import * as ruleReturn from 'ruleReturn';

describe('compose', () => {
  it('Should create "and" relationship between composed rules', () => {
    const NumberAboveTen = compose(enforce.isNumber(), enforce.greaterThan(10));

    expect(() => NumberAboveTen(5)).toThrow();
    expect(() => NumberAboveTen('11')).toThrow();
    expect(() => NumberAboveTen(10)).toThrow();
    NumberAboveTen(11); // does not throw
  });

  it('Should allow lazy evaluation of composed rules', () => {
    const NumericStringBetweenThreeAndFive = compose(
      enforce.isNumeric(),
      enforce.isString(),
      enforce.greaterThan(3),
      enforce.lessThan(5)
    );

    expect(NumericStringBetweenThreeAndFive.run('4')).toEqual(
      ruleReturn.passing()
    );
    expect(NumericStringBetweenThreeAndFive.run('3')).toEqual(
      ruleReturn.failing()
    );
    expect(NumericStringBetweenThreeAndFive.run(5)).toEqual(
      ruleReturn.failing()
    );
    expect(NumericStringBetweenThreeAndFive.test('4')).toBe(true);
    expect(NumericStringBetweenThreeAndFive.test('3')).toBe(false);
    expect(NumericStringBetweenThreeAndFive.test(5)).toBe(false);
  });

  it('Should allow running composite as part of a shape', () => {
    const Name = compose(
      enforce.shape({
        first: enforce.isString().isNotEmpty(),
        last: enforce.isString().isNotEmpty(),
        middle: enforce.optional(enforce.isString().isNotEmpty()),
      })
    );

    expect(
      enforce
        .shape({
          name: Name,
        })
        .run({
          name: {
            first: 'John',
            last: 'Doe',
          },
        })
    ).toEqual(ruleReturn.passing());

    expect(
      enforce
        .shape({
          name: Name,
        })
        .run({
          name: {
            first: 'John',
            last: 'Doe',
            middle: '',
          },
        })
    ).toEqual(ruleReturn.failing());
  });
  it('Should allow composing compositions', () => {
    const Name = compose(
      enforce.loose({
        name: enforce.shape({
          first: enforce.isString().isNotEmpty(),
          last: enforce.isString().isNotEmpty(),
          middle: enforce.optional(enforce.isString().isNotEmpty()),
        }),
      })
    );

    const Entity = compose(
      enforce.loose({
        id: enforce.isNumeric(),
      })
    );

    const User = compose(Name, Entity);

    expect(
      User.run({
        id: '1',
        name: {
          first: 'John',
          middle: 'M',
          last: 'Doe',
        },
      })
    ).toEqual(ruleReturn.passing());
    User({
      id: '1',
      name: {
        first: 'John',
        middle: 'M',
        last: 'Doe',
      },
    });

    // failing
    expect(
      User.run({
        id: '_',
        name: {
          first: 'John',
        },
      })
    ).toEqual(ruleReturn.failing());

    expect(() =>
      User({
        name: {
          first: 'John',
        },
        id: '__',
      })
    ).toThrow();
  });
});
