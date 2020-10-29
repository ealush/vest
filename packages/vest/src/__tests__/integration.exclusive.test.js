import vest from '..';

let validate;

beforeEach(() => {
  validate = genValidate(vest);
});

describe('only', () => {
  it('Should only have `only`ed fields', () => {
    const res = validate({
      only: ['field_1', 'field_2'],
    });

    expect(res.tests).toHaveProperty('field_1');
    expect(res.tests).toHaveProperty('field_2');
    expect(res.tests).not.toHaveProperty('field_3');
    expect(res.tests).not.toHaveProperty('field_4');
    expect(res.tests).not.toHaveProperty('field_5');
  });
  it('Should only have `only`ed field', () => {
    const res = validate({
      only: 'field_1',
    });

    expect(res.tests).toHaveProperty('field_1');
    expect(res.tests).not.toHaveProperty('field_2');
    expect(res.tests).not.toHaveProperty('field_3');
    expect(res.tests).not.toHaveProperty('field_4');
    expect(res.tests).not.toHaveProperty('field_5');
  });
});
describe('skip', () => {
  it('Should have all but `skip`ped fields', () => {
    const res = validate({
      skip: ['field_1', 'field_2'],
    });

    expect(res.tests).not.toHaveProperty('field_1');
    expect(res.tests).not.toHaveProperty('field_2');
    expect(res.tests).toHaveProperty('field_3');
    expect(res.tests).toHaveProperty('field_4');
    expect(res.tests).toHaveProperty('field_5');
  });
  it('Should have all but `skip`ped field', () => {
    const res = validate({
      skip: 'field_1',
    });

    expect(res.tests).not.toHaveProperty('field_1');
    expect(res.tests).toHaveProperty('field_2');
    expect(res.tests).toHaveProperty('field_3');
    expect(res.tests).toHaveProperty('field_4');
    expect(res.tests).toHaveProperty('field_5');
  });
});

describe('Combined', () => {
  test('Last declaration wins', () => {
    const res = validate({
      only: ['field_1', 'field_2', 'field_3'],
      skip: ['field_1'],
      skip_last: 'field_3',
    });

    expect(res.tests).toHaveProperty('field_1');
    expect(res.tests).toHaveProperty('field_2');
    expect(res.tests).not.toHaveProperty('field_3');
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
