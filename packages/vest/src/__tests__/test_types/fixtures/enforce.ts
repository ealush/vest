import { enforce } from '../../../vest';

// Enforce call with value
enforce(0);
enforce(1);
enforce(undefined);
enforce(null);
enforce('');
enforce('Word');
enforce({});
enforce([]);

// Checking the rules can be called
enforce(0).isNumber();
enforce(1).isNumeric();
enforce(undefined).isUndefined();
enforce(null).isNull();
enforce('').isEmpty();
enforce('Word').longerThan(3);
enforce({}).isString();
enforce([]).isArray();

// Checking the rules can be chained
enforce(0).isNumber().isString().isArray();
enforce(1).isNumeric().longerThan(100);

// Checking lazy enforced rules
enforce.isArray();
enforce.isString().longerThan(2);

enforce.isArray().test([]);
enforce.isString().longerThan(2).test('yes');

// Extending enforce
enforce.extend({
  isLiteralNo: v => v === 'no',
});
enforce('no').isLiteralNo();
const x = enforce.isLiteralNo().test(12);

// Enforce template
const User = enforce.template(enforce.isString(), enforce.isNotEmpty());
User('hello');
// Chaining after template
User('example').isNotEmpty();
// Template composition
const LongName = enforce.template(enforce.longerThan('5'));
const LongUser = enforce.template(User, LongName);
LongUser('hello').notEquals('Bye');
// Lazy Evaluated templates
User.test(12);
LongUser.test('SomeUser');

// Compounds

// Shape
enforce({ user: { name: { first: 'first', last: 'last' } } }).shape({
  user: enforce.shape({
    name: enforce.shape({
      first: enforce.isString().isNotNumeric(),
      last: enforce.isString().isNotArray(),
      middle: enforce.optional(),
    }),
  }),
});
enforce
  .shape({
    user: enforce.shape({
      name: enforce.shape({
        first: enforce.isString().isNotNumeric(),
        last: enforce.isString().isNotArray(),
        middle: enforce.optional(enforce.isNumber()),
      }),
    }),
  })
  .isNotEmpty()
  .test({ user: { name: { first: 'first', last: 'last' } } });

// isArrayOf
enforce([1, 2, '3'])
  .isArrayOf(enforce.isNotNumeric(), enforce.isString())
  .isNotEmpty();
enforce
  .isArrayOf(enforce.isNotNumeric(), enforce.isString())
  .longerThanOrEquals(2)
  .test([1, 2, '3']);

// anyOf
enforce(1).anyOf(enforce.isNumber(), enforce.isArray());
enforce.anyOf(enforce.isNumber(), enforce.isArray()).test(1);

// allOf
enforce('hello').allOf(enforce.isString(), enforce.longerThan(3));
enforce.allOf(enforce.isString(), enforce.longerThan(3)).test('hello');