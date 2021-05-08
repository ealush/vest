import hasOwnProperty from 'hasOwnProperty';

import assign from 'assign';
import { isBoolean } from 'isBoolean';
import { isEmpty } from 'isEmpty';
import { isNull } from 'isNull';
import { isUndefined } from 'isUndefined';
import { HAS_WARNINGS, HAS_ERRORS } from 'sharedKeys';

/**
 * Stores a rule result in an easy to inspect and manipulate structure.
 *
 * @param {boolean|RuleResult} ruleRunResult
 */
export default function RuleResult(ruleRunResult) {
  if (isUndefined(ruleRunResult)) {
    return;
  }

  if (isBoolean(ruleRunResult)) {
    this.setFailed(!ruleRunResult);
  } else {
    this.extend(ruleRunResult);
  }
}

/**
 * Determines whether a given value is a RuleResult instance
 * @param {*} res
 * @return {boolean}
 */
RuleResult.is = function (res) {
  return res instanceof RuleResult;
};

/**
 * Marks the current result object as an array
 */
RuleResult.prototype.asArray = function () {
  this.isArray = true;
  return this;
};

/**
 * @param {string} key
 * @param {value} value
 * @return {RuleResult} current instance
 */
RuleResult.prototype.setAttribute = function (key, value) {
  this[key] = value;
  return this;
};

/**
 * @param {boolean} failed
 * @return {RuleResult} current instance
 */
RuleResult.prototype.setFailed = function (failed) {
  this.setAttribute(this.warn ? HAS_WARNINGS : HAS_ERRORS, failed);
  return this.setAttribute('failed', failed);
};

/**
 * Adds a nested result object
 *
 * @param {string} key
 * @param {RuleResult} child
 */
RuleResult.prototype.setChild = function (key, child) {
  if (isNull(child)) {
    return null;
  }

  const isWarning =
    this[HAS_WARNINGS] || child[HAS_WARNINGS] || child.warn || this.warn;
  this.setAttribute(HAS_WARNINGS, (isWarning && child.failed) || false);
  this.setAttribute(
    HAS_ERRORS,
    this[HAS_ERRORS] ||
      child[HAS_ERRORS] ||
      (!isWarning && child.failed) ||
      false
  );
  this.setFailed(this.failed || child.failed);
  this.children = this.children || {};
  this.children[key] = child;
  return child;
};

/**
 * Retrieves a child by its key
 *
 * @param {string} key
 * @return {RuleResult|undefined}
 */
RuleResult.prototype.getChild = function (key) {
  return (this.children || {})[key];
};

/**
 * Extends current instance with a new provided result
 * @param {Boolean|RuleResult} newRes
 */
RuleResult.prototype.extend = function (newRes) {
  if (isNull(newRes)) {
    return this;
  }

  const res = RuleResult.is(newRes)
    ? newRes
    : new RuleResult().setAttribute('warn', !!this.warn).setFailed(!newRes);

  const failed = this.failed || res.failed;

  const children = mergeChildren(res, this).children;

  assign(this, res);
  if (!isEmpty(children)) {
    this.children = children;
  }

  this.setFailed(failed);
  this.setAttribute(HAS_WARNINGS, !!(this[HAS_WARNINGS] || res[HAS_WARNINGS]));
  this.setAttribute(HAS_ERRORS, !!(this[HAS_ERRORS] || res[HAS_ERRORS]));
};

Object.defineProperty(RuleResult.prototype, 'pass', {
  get() {
    return !this.failed;
  },
});

/**
 * Deeply merge the nested children of compound rules
 *
 * @param {?RuleResult} base
 * @param {?RuleResult} add
 * @return {RuleResult}
 */
function mergeChildren(base, add) {
  const isRuleResultBase = RuleResult.is(base);
  const isRuleResultAdd = RuleResult.is(add);

  // If both base and add are result objects
  if (isRuleResultBase && isRuleResultAdd) {
    // Use failed if either is failing
    base.setFailed(base.failed || add.failed);

    // If neither has a children object, or the children object is
    if (isEmpty(base.children) && isEmpty(add.children)) {
      return base;
    }
    // If both have a children object
    if (base.children && add.children) {
      // Merge all the "right side" children back to base
      for (const key in base.children) {
        mergeChildren(base.children[key], add.children[key]);
      }

      // If a child exists in "add" but not in "base", just copy the child as is
      for (const key in add.children) {
        if (!hasOwnProperty(base.children, key)) {
          base.setChild(key, add.children[key]);
        }
      }

      // Return the modified base object
      return base;

      // If base has no children (but add does)
    } else if (!base.children) {
      // Use add's children
      base.children = add.children;

      // If add has no children
    } else if (!add.children) {
      // return base as is
      return base;
    }
    // If only base is `RuleResult`
  } else if (isRuleResultBase) {
    // Return base as is
    return base;

    // If only add is RuleResult
  } else if (isRuleResultAdd) {
    // Return add as is
    return add;
  }

  // That's a weird case. Let's fail. Very unlikely.
  return new RuleResult(false);
}
