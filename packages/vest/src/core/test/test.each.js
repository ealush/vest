import asArray from 'asArray';
import { withFirst } from 'withArgs';

/* eslint-disable jest/no-export */
export default function bindTestEach(test) {
  /**
   * Run multiple tests using a parameter table
   * @param {any[]} table         Array of arrays with params for each run (will accept 1d-array and treat every item as size one array)
   * @param {String} fieldName    Name of the field to test.
   * @param {String|function} [statement]  The message returned in case of a failure.  Follows printf syntax.
   * @param {function} testFn     The actual test callback.
   * @return {VestTest[]}           An array of VestTest instances.
   */
  function each(table) {
    if (!Array.isArray(table)) {
      throw new Error('[vest/test.each]: Expected table to be an array.');
    }

    return withFirst((fieldName, args) => {
      const [testFn, statement] = args.reverse();

      return table.map(item => {
        item = asArray(item);
        const itemStatement = typeof statement === 'function' ? statement(...item) : statement;
        return test(fieldName, itemStatement, () => testFn(...item));
      });
    })
  }

  test.each = each;
}
