import { isNumberRule, isStringRule, startsWithRule } from 'lazy';
import { loose, shape } from 'schemaRules';

const addressShape = {
  city: isStringRule,
  street: isStringRule,
  zip: isNumberRule,
  name: shape({
    first: isStringRule,
    last: isStringRule,
  }),
};

const addressRule1 = shape(addressShape).run({
  city: 'NY',
  street: 'Main',
  zip: 12345,
  name: {
    first: 'John',
    last: 'Doe',
  },
});

// const userShape = {
//   address: addressRule,
//   age: optionalRule(isNumberRule),
//   meta: looseRule({ foo: isStringRule }),
//   name: isStringRule,
//   preferences: partialRule({
//     notifications: isBooleanRule,
//     theme: isStringRule,
//   }),
//   tags: isArrayOfRule(isStringRule),
// };
// const userRule = BuildShapeRule(userShape);

// type User = typeof userRule.infer;

// // Example usage:
// const exampleUser: User = {
//   address: { city: 'NY', street: 'Main', zip: 12345 },
//   meta: { foo: 'bar', extra: 42 },
//   name: 'Alice',
//   preferences: { theme: 'dark' },
//   tags: ['admin', 'user'],
//   age: undefined,
// };

// // --- Improved person schema with examples ---

// const personShape = {
//   age: isNumberRule,
//   email: isStringRule,
//   isActive: isBooleanRule,
//   name: isStringRule,
//   score: isNumberRule,
//   status: BuildRule(
//     (value: 'active' | 'inactive'): RuleRunReturn<'active' | 'inactive'> =>
//       ruleRunReturn(value === 'active' || value === 'inactive', value),
//   ),
//   tags: isArrayOfRule(isStringRule),
// };

// const person = BuildShapeRule(personShape);

// type Person = typeof person.infer;

// // Example usages

// // Removed unused validPerson variable

// // const result = person.run(validPerson);
// // console.log('Validation result:', result);

// // Example: Type error if wrong type
// // const invalidPerson: Person = {
// //   name: 123, // Error: should be string
// //   age: 'thirty', // Error: should be number
// //   isActive: 'yes', // Error: should be boolean
// //   tags: [1, 2], // Error: should be string[]
// //   score: 'high', // Error: should be number
// //   email: 12345, // Error: should be string
// //   status: 42, // Error: should be 'active' | 'inactive'
// // };
