import { singleton, throwError } from '../../lib';
import { ERROR_HOOK_CALLED_OUTSIDE } from '../constants';
import { GROUP_NAME_ONLY, GROUP_NAME_SKIP } from './constants';

type exclusiveItem = string|string[];

/**
 * Adds fields to a specified group.
 */
const addTo = (group: string, item: exclusiveItem) => {
    const ctx = singleton.useContext();

    if (!item) {
        return;
    }

    if (!ctx) {
        throwError(`${group} ${ERROR_HOOK_CALLED_OUTSIDE}`);
        return;
    }

    ctx.exclusive = ctx.exclusive || {};

    [].concat(item).forEach((fieldName: string) => {
        if (typeof fieldName === 'string') {
            ctx.exclusive[group] = ctx.exclusive[group] || {};
            ctx.exclusive[group][fieldName] = true;
        }
    });
};

/**
 * Adds a field or multiple fields to inclusion group.
 */
export const only = (item: exclusiveItem) => addTo(GROUP_NAME_ONLY, item);

/**
 * Adds a field or multiple fields to exlusion group.
 */
export const skip = (item: exclusiveItem) => addTo(GROUP_NAME_SKIP, item);

/**
 * Checks whether a certain field name is excluded by any of the exclusion groups.
 */
export const isExcluded = (fieldName: string): boolean => {
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
