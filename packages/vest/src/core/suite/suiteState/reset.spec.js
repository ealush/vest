import { dummyTest } from '../../../../testUtils/testDummy';
import get from '../../../hooks/get';
import create from '../create';
import * as suiteState from '.';

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
    suiteState.reset('suite');
    expect(get('suite')).isDeepCopyOf(initialState);
    expect(JSON.stringify(get('suite'))).toEqual(JSON.stringify(initialState));
  });

  it('Should initialize suite when not found', () => {
    const name = 'nonexistent_suite';
    expect(() => suiteState.getState(name)).toThrow();
    const expected = {
      ...initialState,
      name,
    };
    suiteState.reset(name);
    expect(get(name)).isDeepCopyOf(expected);
    expect(JSON.stringify(get(name))).toEqual(JSON.stringify(expected));
  });

  test('Should throw error when called withotu suite id', () => {
    expect(suiteState.reset).toThrow(
      '[Vest]: `vest.reset` must be called with suiteId.'
    );
  });
});
