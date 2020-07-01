import { dummyTest } from '../../../../testUtils/testDummy';
import get from '../../../hooks/get';
import create from '../../createSuite';
import reset from '.';

const validate = create('suite', () => {
  dummyTest.failing('f1', 'm1');
  dummyTest.failing('f2', 'm2');
  dummyTest.passingWarning('f3', 'm3');
  dummyTest.failingWarning('f2', 'm2');
});

describe('vest.reset', () => {
  const initialState = get('suite');

  test('sanity', () => {
    expect(initialState).toMatchSnapshot();
    expect(get('suite').hasErrors()).toBe(false);
    expect(get('suite').hasWarnings()).toBe(false);
    validate();
    expect(get('suite')).not.toEqual(initialState);
    expect(get('suite')).toMatchSnapshot();
    expect(get('suite').hasErrors()).toBe(true);
    expect(get('suite').hasWarnings()).toBe(true);
  });

  it('Should return to initial state after reset', () => {
    expect(get('suite')).not.isDeepCopyOf(initialState);
    reset('suite');
    expect(get('suite')).isDeepCopyOf(initialState);
    expect(JSON.stringify(get('suite'))).toEqual(JSON.stringify(initialState));
  });

  test('Shoyud throw error when called withotu suite id', () => {
    expect(reset).toThrow('[Vest]: `vest.reset` must be called with suiteId.');
  });
});
