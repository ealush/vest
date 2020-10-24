import vest from '..';

const suite = ({ create, test, enforce, ...vest }) =>
  create('suite_name', () => {
    vest.skip('field_5');
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
  })();

describe('Base behavior', () => {
  let res;

  beforeEach(() => {
    res = suite(vest);
  });

  test.skipOnWatch('Should produce correct validation result', () => {
    expect(res.tests).toHaveProperty('field_1');
    expect(res.tests).toHaveProperty('field_2');
    expect(res.tests).toHaveProperty('field_3');
    expect(res.tests).toHaveProperty('field_4');
    expect(res.tests).not.toHaveProperty('field_5');
    expect(suite(vest)).toMatchSnapshot();
  });

  it('Should run done callbacks immediately', () => {
    const callback = jest.fn();
    res.done(callback);

    expect(callback).toHaveBeenCalled();
  });
});
