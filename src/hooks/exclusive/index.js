import { singleton, throwError } from '../../lib';
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

    if (!ctx) {
        throwError(`${group} ${ERROR_HOOK_CALLED_OUTSIDE}`);
        return;
    }

    ctx.exclusive = ctx.exclusive || {};

    [].concat(item).forEach((fieldName) => {
        if (typeof fieldName === 'string') {
            ctx.exclusive[group] = ctx.exclusive[group] || {};
            ctx.exclusive[group][fieldName] = true;
        }
    });
};

/**
 * Adds a field or multiple fields to inclusion group.
 * @param {String[]|String} item Item to be added to inclusion group.
 */
export const only = (item) => addTo(GROUP_NAME_ONLY, item);

/**
 * Adds a field or multiple fields to exlusion group.
 * @param {String[]|String} item Item to be added to exlusion group.
 */
export const skip = (item) => addTo(GROUP_NAME_SKIP, item);

/**
 * Checks whether a certain field name is excluded by any of the exclusion groups.
 * @param {String} fieldName    FieldN name to test.
 * @returns {Boolean}
 */
export const isExcluded = (fieldName) => {
    const ctx = singleton.useContext();

    if (!(ctx && ctx.exclusive)) {
        return false;
    }

    if (
        ctx.exclusive[GROUP_NAME_SKIP] &&
        ctx.exclusive[GROUP_NAME_SKIP][fieldName]
    ) {

        return true;
    }

    if (ctx.exclusive[GROUP_NAME_ONLY]) {
        if (ctx.exclusive[GROUP_NAME_ONLY][fieldName]) {
            return false;
        }

        return true;
    }

    return false;
};
