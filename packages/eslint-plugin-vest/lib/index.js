/**
 * @fileoverview Eslint plugin for vest validations.
 * @author ealush
 */
"use strict";

module.exports.rules = {
  "hook-scope": require("./rules/hook-scope"),
  "exclude-before-test": require("./rules/exclude-before-test"),
};
