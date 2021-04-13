import vest from 'vest';

let validate;

beforeEach(() => {
  validate = genValidate(vest);
});

describe('only', () => {
  it('Should only count included fields', () => {
    const res = validate({
      only: ['field_1', 'field_2'],
    });

    expect(res.tests.field_1.testCount).toBe(1);
    expect(res.tests.field_2.testCount).toBe(1);
    expect(res.tests.field_3.testCount).toBe(0);
    expect(res.tests.field_4.testCount).toBe(0);
    expect(res.tests.field_5.testCount).toBe(0);
  });
  it('Should only count included field', () => {
    const res = validate({
      only: 'field_1',
    });

    expect(res.tests.field_1.testCount).toBe(1);
    expect(res.tests.field_2.testCount).toBe(0);
    expect(res.tests.field_3.testCount).toBe(0);
    expect(res.tests.field_4.testCount).toBe(0);
    expect(res.tests.field_5.testCount).toBe(0);
  });
});
describe('skip', () => {
  it('Should count all but excluded fields', () => {
    const res = validate({
      skip: ['field_1', 'field_2'],
    });

    expect(res.tests.field_1.testCount).toBe(0);
    expect(res.tests.field_2.testCount).toBe(0);
    expect(res.tests.field_3.testCount).toBe(1);
    expect(res.tests.field_4.testCount).toBe(1);
    expect(res.tests.field_5.testCount).toBe(1);
  });

  it('Should count all but excluded field', () => {
    const res = validate({
      skip: 'field_1',
    });

    expect(res.tests.field_1.testCount).toBe(0);
    expect(res.tests.field_2.testCount).toBe(1);
    expect(res.tests.field_3.testCount).toBe(1);
    expect(res.tests.field_4.testCount).toBe(1);
    expect(res.tests.field_5.testCount).toBe(1);
  });
});

describe('Combined', () => {
  test('Last declaration wins', () => {
    const res = validate({
      only: ['field_1', 'field_2', 'field_3'],
      skip: ['field_1'],
      skip_last: 'field_3',
    });

    expect(res.tests.field_1.testCount).toBe(1);
    expect(res.tests.field_2.testCount).toBe(1);
    expect(res.tests.field_3.testCount).toBe(0);
  });
});

function genValidate(vest) {
  return vest.create('suite_name', (exclusion = {}) => {
    vest.skip(exclusion.skip);
    vest.only(exclusion.only);
    vest.skip(exclusion.skip_last);

    vest.test('field_1', 'msg', Function.prototype);
    vest.test('field_2', 'msg', Function.prototype);
    vest.test('field_3', 'msg', Function.prototype);
    vest.test('field_4', 'msg', Function.prototype);
    vest.test('field_5', 'msg', Function.prototype);
  });
}
