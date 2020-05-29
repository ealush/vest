import getSuiteState from '../../core/state/getSuiteState';
import patch from '../../core/state/patch';
import singleton from '../../lib/singleton';
import throwError from '../../lib/throwError';
import { ERROR_HOOK_CALLED_OUTSIDE } from '../constants';
import { GROUP_NAME_ONLY, GROUP_NAME_SKIP } from './constants';

/**
 * Adds fields to a specified group.
 * @param {String} group            To add the fields to.
 * @param {String[]|String} item    A field name or a list of field names.
 */
const addTo = (group, item) => {
  const ctx = singleton.useContext();

  if (!item) {
    return;
  }
  if (ctx?.suiteId === undefined) {
    throwError(`${group} ${ERROR_HOOK_CALLED_OUTSIDE}`);
    return;
  }

  patch(ctx.suiteId, state => {
    const nextState = { ...state };
    [].concat(item).forEach(fieldName => {
      if (typeof fieldName === 'string') {
        nextState.exclusive[group] = nextState.exclusive[group] || {};
        nextState.exclusive[group][fieldName] = true;
      }
    });
    return nextState;
  });
};

/**
 * Adds a field or multiple fields to inclusion group.
 * @param {String[]|String} item Item to be added to inclusion group.
 */
export const only = item => addTo(GROUP_NAME_ONLY, item);

/**
 * Adds a field or multiple fields to exclusion group.
 * @param {String[]|String} item Item to be added to exclusion group.
 */
export const skip = item => addTo(GROUP_NAME_SKIP, item);

/**
 * Checks whether a certain field name is excluded by any of the exclusion groups.
 * @param {String} fieldName    FieldN name to test.
 * @returns {Boolean}
 */
export const isExcluded = fieldName => {
  const ctx = singleton.useContext();

  if (ctx?.suiteId === undefined) {
    return false;
  }

  const state = getSuiteState(ctx.suiteId);

  const group = ctx.groupName;

  // If we're inside a group but what we're checking
  // is a different field.
  if (group && fieldName !== group) {
    // If the group is `only`ed
    if (state.exclusive?.[GROUP_NAME_ONLY]?.[group]) {
      return !!state.exclusive?.[GROUP_NAME_SKIP]?.[fieldName]; // excluded if current field is skipped
    }
  }

  // If field is skipped
  if (state.exclusive?.[GROUP_NAME_SKIP]?.[fieldName]) {
    return true; // excluded
  }

  // If there is _ANY_ `only`ed group
  if (state.exclusive?.[GROUP_NAME_ONLY]) {
    // If the current field is `only`ed
    if (state.exclusive[GROUP_NAME_ONLY]?.[fieldName]) {
      return false; // Not excluded
    }

    // There's an `only`ed field, but it's not this one
    return true; // excluded
  }

  return false; // Not excluded
};
