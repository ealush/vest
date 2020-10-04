import vest from '..';

describe('Stateful behavior', () => {
  let result;
  const validate = genValidate(vest);

  test('Should merge skipped fields with previous values', () => {
    result = validate({ only: 'field_1' });
    expect(result.tests.field_1.errorCount).toBe(1);
    expect(result.errorCount).toBe(1);
    expect(Object.keys(result.tests)).toHaveLength(1);
    expect(result.tests).toHaveProperty('field_1');
    expect(result).toMatchSnapshot();

    result = validate({ only: 'field_5' });
    expect(result.errorCount).toBe(3);
    expect(result.tests.field_1.errorCount).toBe(1);
    expect(result.tests.field_5.errorCount).toBe(2);
    expect(Object.keys(result.tests)).toHaveLength(2);
    expect(result.tests).toHaveProperty('field_1');
    expect(result.tests).toHaveProperty('field_5');
    expect(result).toMatchSnapshot();

    result = validate();
    expect(result.errorCount).toBe(4);
    expect(result.tests.field_1.errorCount).toBe(1);
    expect(result.tests.field_2.errorCount).toBe(1);
    expect(result.tests.field_4.warnCount).toBe(1);
    expect(result.tests.field_5.errorCount).toBe(2);
    expect(Object.keys(result.tests)).toHaveLength(5);
    expect(result).toMatchSnapshot();
  });
});

function genValidate({ create, test, enforce, ...vest }) {
  return create('suite_name', ({ only } = {}) => {
    vest.only(only);
    test('field_1', 'field_statement_1', () => false);
    test('field_2', 'field_statement_2', () => {
      enforce(2).equals(3);
    });
    test('field_3', 'field_statement_3', () => {});
    test('field_4', 'field_statement_4', () => {
      vest.warn();
      throw new Error();
    });
    test('field_4', 'field_statement_4', () => {
      vest.warn();
    });
    test('field_5', 'field_statement_5', () => false);
    test('field_5', 'field_statement_6', () => false);
  });
}
