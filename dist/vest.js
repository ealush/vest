(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.vest = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var enforce_min = createCommonjsModule(function (module, exports) {
    !function (n, e) {
       module.exports = e() ;
    }(commonjsGlobal, function () {

      function n(e) {
        return (n = "function" == typeof Symbol && "symbol" == _typeof(Symbol.iterator) ? function (n) {
          return _typeof(n);
        } : function (n) {
          return n && "function" == typeof Symbol && n.constructor === Symbol && n !== Symbol.prototype ? "symbol" : _typeof(n);
        })(e);
      }

      function e(n, e, t) {
        return e in n ? Object.defineProperty(n, e, {
          value: t,
          enumerable: !0,
          configurable: !0,
          writable: !0
        }) : n[e] = t, n;
      }

      function t(n, e) {
        var t = Object.keys(n);

        if (Object.getOwnPropertySymbols) {
          var r = Object.getOwnPropertySymbols(n);
          e && (r = r.filter(function (e) {
            return Object.getOwnPropertyDescriptor(n, e).enumerable;
          })), t.push.apply(t, r);
        }

        return t;
      }

      function r(n) {
        for (var r = 1; r < arguments.length; r++) {
          var o = null != arguments[r] ? arguments[r] : {};
          r % 2 ? t(Object(o), !0).forEach(function (t) {
            e(n, t, o[t]);
          }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(n, Object.getOwnPropertyDescriptors(o)) : t(Object(o)).forEach(function (e) {
            Object.defineProperty(n, e, Object.getOwnPropertyDescriptor(o, e));
          });
        }

        return n;
      }

      var o = function o(n, e) {
        return Object.prototype.hasOwnProperty.call(n, e) && "function" == typeof n[e];
      },
          u = Function("return this")(),
          i = function i() {
        return "function" == typeof u.Proxy;
      };

      function a(n) {
        return Boolean(Array.isArray(n));
      }

      function c(n) {
        return Boolean("number" == typeof n);
      }

      function f(n) {
        return Boolean("string" == typeof n);
      }

      function s(n, e) {
        return e instanceof RegExp ? e.test(n) : "string" == typeof e && new RegExp(e).test(n);
      }

      function l(e, t) {
        return Array.isArray(t) && ["string", "number", "boolean"].includes(n(e)) ? t.includes(e) : "string" == typeof t && "string" == typeof e && t.includes(e);
      }

      function y(n, e) {
        return n === e;
      }

      function p(n) {
        var e = !isNaN(parseFloat(n)) && !isNaN(Number(n)) && isFinite(n);
        return Boolean(e);
      }

      function g(n, e) {
        return p(n) && p(e) && Number(n) === Number(e);
      }

      function b(e) {
        return !e || (p(e) ? 0 === e : Object.prototype.hasOwnProperty.call(e, "length") ? 0 === e.length : "object" !== n(e) || 0 === Object.keys(e).length);
      }

      function m(n, e) {
        return p(n) && p(e) && Number(n) > Number(e);
      }

      function v(n, e) {
        return p(n) && p(e) && Number(n) >= Number(e);
      }

      function h(n, e) {
        return p(n) && p(e) && Number(n) < Number(e);
      }

      function O(n, e) {
        return p(n) && p(e) && Number(n) <= Number(e);
      }

      function N(n, e) {
        return n.length === e;
      }

      a.negativeForm = "isNotArray", c.negativeForm = "isNotNumber", f.negativeForm = "isNotString", s.negativeForm = "notMatches", l.negativeForm = "notInside", y.negativeForm = "notEquals", p.negativeForm = "isNotNumeric", g.negativeForm = "numberNotEquals", b.negativeForm = "isNotEmpty", m.alias = "gt", v.alias = "gte", h.alias = "lt", O.alias = "lte", N.negativeForm = "lengthNotEquals";

      function d(n) {
        return !!n;
      }

      d.negativeForm = "isFalsy";

      var j = function (n) {
        var e = function e(_e) {
          var t = n[_e].negativeForm,
              r = n[_e].alias;
          t && (n[t] = function () {
            return !n[_e].apply(n, arguments);
          }), r && (n[r] = n[_e]);
        };

        for (var t in n) {
          e(t);
        }

        return n;
      }({
        isArray: a,
        isNumber: c,
        isString: f,
        matches: s,
        inside: l,
        equals: y,
        numberEquals: g,
        isNumeric: p,
        isEmpty: b,
        greaterThan: m,
        greaterThanOrEquals: v,
        lessThan: h,
        lessThanOrEquals: O,
        longerThan: function longerThan(n, e) {
          return n.length > e;
        },
        longerThanOrEquals: function longerThanOrEquals(n, e) {
          return n.length >= e;
        },
        shorterThan: function shorterThan(n, e) {
          return n.length < e;
        },
        shorterThanOrEquals: function shorterThanOrEquals(n, e) {
          return n.length <= e;
        },
        lengthEquals: N,
        isOdd: function isOdd(n) {
          return !!p(n) && n % 2 != 0;
        },
        isEven: function isEven(n) {
          return !!p(n) && n % 2 == 0;
        },
        isTruthy: d
      });

      function E(e, t) {
        if ("function" == typeof e) {
          for (var r = arguments.length, o = new Array(r > 2 ? r - 2 : 0), u = 2; u < r; u++) {
            o[u - 2] = arguments[u];
          }

          if (!0 !== e.apply(void 0, [t].concat(o))) throw new Error("[Enforce]: invalid ".concat(n(t), " value"));
        }
      }

      function w() {
        var n = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
            t = r({}, j, {}, n);
        if (i()) return function (n) {
          var e = new Proxy(t, {
            get: function get(t, r) {
              if (o(t, r)) return function () {
                for (var o = arguments.length, u = new Array(o), i = 0; i < o; i++) {
                  u[i] = arguments[i];
                }

                return E.apply(void 0, [t[r], n].concat(u)), e;
              };
            }
          });
          return e;
        };
        var u = Object.keys(t);
        return function (n) {
          return u.reduce(function (u, i) {
            return _extends(u, r({}, o(t, i) && e({}, i, function () {
              for (var e = arguments.length, r = new Array(e), o = 0; o < e; o++) {
                r[o] = arguments[o];
              }

              return E.apply(void 0, [t[i], n].concat(r)), u;
            })));
          }, {});
        };
      }

      var F = new w();
      return F.Enforce = w, F;
    });
  });

  var any = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
       module.exports = factory() ;
    })(commonjsGlobal, function () {
      /**
       * Accepts a value or a function, and coerces it into a boolean value
       * @param {*|Function} [arg] Any expression or value
       * @return {Boolean}
       */

      var run = function run(arg) {
        if (typeof arg === 'function') {
          try {
            var output = arg();
            return output != false && Boolean(output); // eslint-disable-line
          } catch (err) {
            return false;
          }
        }

        return arg != false && Boolean(arg); // eslint-disable-line
      };
      /**
       * Checks that at least one passed argument evaluates to a truthy value.
       * @param  {[]*} [args] Any amount of values or expressions.
       * @returns {Boolean}
       */


      var any = function any() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        return args.some(run);
      };

      return any;
    });
  });

  /**
   * @type {Object} Reference to global object.
   */
  var globalObject = Function('return this')();

  /**
   * Throws a timed out error.
   * @param {String} message  Error message to display.
   * @param {Error} [type]    Alternative Error type.
   */
  var throwError = function throwError(message) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : Error;
    return setTimeout(function () {
      throw new type("[Vest]: ".concat(message));
    });
  };

  /**
   * @type {String} Vest's major version.
   */
  var VEST_MAJOR = "1.0.5".split('.')[0];
  /**
   * @type {Symbol} Used to store a global instance of Vest.
   */

  var SYMBOL_VEST = Symbol["for"]("VEST#".concat(VEST_MAJOR));

  /**
   * Throws an error when multiple versions of Vest are detected on the same runtime.
   * @param  {String[]} versions List of detected Vest versions.
   */

  var throwMultipleVestError = function throwMultipleVestError() {
    for (var _len = arguments.length, versions = new Array(_len), _key = 0; _key < _len; _key++) {
      versions[_key] = arguments[_key];
    }

    throwError("Multiple versions of Vest detected: (".concat(versions.join(), ").\n    Most features should work regularly, but for optimal feature compatibility, you should have all running instances use the same version."));
  };
  /**
   * Registers current Vest instance on global object.
   * @param {Object} vest Reference to Vest.
   * @return {Function} Global Vest reference.
   */


  var register = function register(vest) {
    var existing = globalObject[SYMBOL_VEST];

    if (existing) {
      if (existing.VERSION !== vest.VERSION) {
        throwMultipleVestError(vest.VERSION, existing.VERSION);
      }
    } else {
      globalObject[SYMBOL_VEST] = vest;
    }

    return globalObject[SYMBOL_VEST];
  };
  /**
   * @returns Global Vest instance.
   */


  var use = function use() {
    return globalObject[SYMBOL_VEST];
  };
  /**
   * @returns Current Vest context.
   */


  var useContext = function useContext() {
    return use().ctx;
  };

  var singleton = {
    use: use,
    useContext: useContext,
    register: register
  };

  /**
   * Creates a new context object, and assigns it as a static property on Vest's singleton.
   * @param {Object} parent   Parent context.
   */

  function Context(parent) {
    singleton.use().ctx = this;

    _extends(this, parent);
  }
  /**
   * Sets a testObject reference on context.
   * @param {TestObject} A TestObject instance.
   */


  Context.prototype.setCurrentTest = function (testObject) {
    this.currentTest = testObject;
  };
  /**
   * Removes current test from context.
   */


  Context.prototype.removeCurrentTest = function () {
    delete this.currentTest;
  };
  /**
   * Clears stored instance from constructor function.
   */


  Context.clear = function () {
    singleton.use().ctx = null;
  };

  /**
   *  @type {String}  Error message to display when a hook was called outside of context.
   */
  var ERROR_HOOK_CALLED_OUTSIDE = 'hook called outside of a running suite.';

  /**
   * @type {String} Exclusivity group name: only.
   */
  var GROUP_NAME_ONLY = 'only';
  /**
   * @type {String} Exclusivity group name: skip.
   */

  var GROUP_NAME_SKIP = 'skip';

  /**
   * Adds fields to a specified group.
   * @param {String} group            To add the fields to.
   * @param {String[]|String} item    A field name or a list of field names.
   */

  var addTo = function addTo(group, item) {
    var ctx = singleton.useContext();

    if (!item) {
      return;
    }

    if (!ctx) {
      throwError("".concat(group, " ").concat(ERROR_HOOK_CALLED_OUTSIDE));
      return;
    }

    ctx.exclusive = ctx.exclusive || {};
    [].concat(item).forEach(function (fieldName) {
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


  var only = function only(item) {
    return addTo(GROUP_NAME_ONLY, item);
  };
  /**
   * Adds a field or multiple fields to exlusion group.
   * @param {String[]|String} item Item to be added to exlusion group.
   */

  var skip = function skip(item) {
    return addTo(GROUP_NAME_SKIP, item);
  };
  /**
   * Checks whether a certain field name is excluded by any of the exclusion groups.
   * @param {String} fieldName    FieldN name to test.
   * @returns {Boolean}
   */

  var isExcluded = function isExcluded(fieldName) {
    var ctx = singleton.useContext();

    if (!(ctx && ctx.exclusive)) {
      return false;
    }

    if (ctx.exclusive[GROUP_NAME_SKIP] && ctx.exclusive[GROUP_NAME_SKIP][fieldName]) {
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

  /**
   * Describes a test call inside a Vest suite.
   * @param {Object} ctx                  Parent context.
   * @param {String} fieldName            Name of the field being tested.
   * @param {String} statement            The message returned when failing.
   * @param {Promise|Function} testFn     The actual test callbrack or promise.
   */
  function TestObject(ctx, fieldName, statement, testFn) {
    _extends(this, {
      ctx: ctx,
      testFn: testFn,
      fieldName: fieldName,
      statement: statement,
      isWarning: false,
      failed: false
    });
  }
  /**
   * @returns {Boolean} Current validity status of a test.
   */


  TestObject.prototype.valueOf = function () {
    return this.failed !== true;
  };
  /**
   * Sets a test to failed.
   * @returns {TestObject} Current instance.
   */


  TestObject.prototype.fail = function () {
    this.ctx.result.markFailure({
      fieldName: this.fieldName,
      statement: this.statement,
      isWarning: this.isWarning
    });
    this.failed = true;
    return this;
  };
  /**
   * Sets a current test's `isWarning` to true.
   * @returns {TestObject} Current instance.
   */


  TestObject.prototype.warn = function () {
    this.isWarning = true;
    return this;
  };

  /**
   * Runs async test.
   * @param {TestObject} testObject A TestObject instance.
   */

  var runAsync = function runAsync(testObject) {
    var testFn = testObject.testFn,
        statement = testObject.statement,
        ctx = testObject.ctx;

    var done = function done() {
      return ctx.result.markAsDone(testObject);
    };

    var fail = function fail(rejectionMessage) {
      testObject.statement = typeof rejectionMessage === 'string' ? rejectionMessage : statement;
      testObject.fail();
      done();
    };

    ctx.setCurrentTest(testObject);

    try {
      testFn.then(done, fail);
    } catch (e) {
      fail();
    }

    ctx.removeCurrentTest();
  };
  /**
   * Runs test callback.
   * @param {TestObject} testObject TestObject instance.
   * @returns {*} Result from test callback.
   */

  var runTest = function runTest(testObject) {
    var result;
    testObject.ctx.setCurrentTest(testObject);

    try {
      result = testObject.testFn.apply(testObject);
    } catch (e) {
      result = false;
    }

    testObject.ctx.removeCurrentTest();

    if (result === false) {
      testObject.fail();
    }

    return result;
  };
  /**
   * Registers test, if async - adds to pending array
   * @param {TestObject} testObject   A TestObject Instance.
   */


  var register$1 = function register(testObject) {
    var testFn = testObject.testFn,
        ctx = testObject.ctx,
        fieldName = testObject.fieldName;
    var isPending = false;
    var result;

    if (isExcluded(fieldName)) {
      ctx.result.addToSkipped(fieldName);
      return;
    }

    ctx.result.markTestRun(fieldName);

    if (testFn && typeof testFn.then === 'function') {
      isPending = true;
    } else {
      result = runTest(testObject);
    }

    if (result && typeof result.then === 'function') {
      isPending = true;
      testObject.testFn = result;
    }

    if (isPending) {
      ctx.result.setPending(testObject);
    }
  };
  /**
   * Test function used by consumer to provide their own validations.
   * @param {String} fieldName            Name of the field to test.
   * @param {String} [statement]          The message returned in case of a failure.
   * @param {function} testFn             The actual test callback.
   * @return {TestObject}                 A TestObject instance.
   */


  var test = function test(fieldName) {
    var statement, testFn;

    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    if (typeof args[0] === 'string') {
      statement = args[0];
      testFn = args[1];
    } else if (typeof args[0] === 'function') {
      testFn = args[0];
    }

    if (typeof testFn !== 'function') {
      return;
    }

    var testObject = new TestObject(singleton.useContext(), fieldName, statement, testFn);
    register$1(testObject);
    return testObject;
  };

  var suiteResult = function suiteResult(name) {
    var pending = {
      tests: []
    };
    var doneCallbacks = [];
    var fieldCallbacks = {};
    var isAsync = false;
    /**
     * Adds a testObject to pending list.
     * @param {Object} testObject
     */

    var setPending = function setPending(testObject) {
      isAsync = true;
      pending.tests.push(testObject);
    };
    /**
     * Clears a testObject from pending list.
     * @param {Object} testObject
     */


    var clearFromPending = function clearFromPending(testObject) {
      pending.tests = pending.tests.filter(function (t) {
        return t !== testObject;
      });
    };
    /**
     * Checks if a specified field has any remaining tests.
     * @param {String} fieldName
     * @returns {Boolean}
     */


    var hasRemaining = function hasRemaining(fieldName) {
      if (!pending.tests.length) {
        return false;
      }

      if (fieldName) {
        return pending.tests.some(function (testObject) {
          return testObject.fieldName === fieldName;
        });
      }

      return !!pending.tests.length;
    };
    /**
     * Bumps test counters to indicate tests that are being performed
     * @param {string} fieldName - The name of the field.
     */


    var markTestRun = function markTestRun(fieldName) {
      if (!output.tests[fieldName]) {
        output.tests[fieldName] = {
          testCount: 0,
          errorCount: 0,
          warnCount: 0
        };
        output.tested.push(fieldName);
      }

      output.tests[fieldName].testCount++;
      output.testCount++;
    };
    /**
     * Marks a test as failed.
     * @param {Object} testData
     * @param {String} testData.fieldName       Name of field being tested.
     * @param {String} [testData.statement]     Failure message to display.
     * @param {Boolean} [testData.isWarning]    Indicates warn only test.
     */


    var markFailure = function markFailure(_ref) {
      var fieldName = _ref.fieldName,
          statement = _ref.statement,
          isWarning = _ref.isWarning;

      if (!output.tests[fieldName]) {
        return;
      }

      var severityGroup, severityCount;

      if (isWarning) {
        severityGroup = 'warnings';
        severityCount = 'warnCount';
      } else {
        severityGroup = 'errors';
        severityCount = 'errorCount';
      }

      output.tests[fieldName][severityGroup] = output.tests[fieldName][severityGroup] || [];

      if (statement) {
        output.tests[fieldName][severityGroup].push(statement);
      }

      output[severityCount]++;
      output.tests[fieldName][severityCount]++;
    };
    /**
     * Uniquely add a field to the `skipped` list
     * @param {string} fieldName - The name of the field.
     */


    var addToSkipped = function addToSkipped(fieldName) {
      !output.skipped.includes(fieldName) && output.skipped.push(fieldName);
    };
    /**
     * Runs callbacks of specified field, or of the whole suite.
     * @param {String} [fieldName]
     */


    var runCallbacks = function runCallbacks(fieldName) {
      if (!fieldName) {
        return doneCallbacks.forEach(function (cb) {
          return cb(output);
        });
      }

      if (Array.isArray(fieldCallbacks[fieldName])) {
        return fieldCallbacks[fieldName].forEach(function (cb) {
          return cb(output);
        });
      }
    };
    /**
     * Removes a field from pending, and runs its callbacks. If all fields are done, runs all callbacks.
     * @param {Object} testObject a testObject to remove from pending.
     */


    var markAsDone = function markAsDone(testObject) {
      if (output.canceled) {
        return;
      }

      if (testObject) {
        clearFromPending(testObject);

        if (!hasRemaining(testObject.fieldName)) {
          runCallbacks(testObject.fieldName);
        }
      }

      if (!hasRemaining()) {
        runCallbacks();
      }
    };
    /**
     * Registers a callback to run once the suite or a specified field finished running.
     * @param {String} [name] Name of the field to call back after,
     * @param {Function} callback A callback to run once validation is finished.
     * @returns {Object} Output object.
     */


    var done = function done() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var length = args.length,
          callback = args[length - 1],
          name = args[length - 2];

      if (typeof callback !== 'function') {
        return output;
      }

      if (!isAsync) {
        callback(output);
        return output;
      }

      if (name && !hasRemaining(name)) {
        callback(output);
        return output;
      }

      if (name) {
        fieldCallbacks[name] = fieldCallbacks[name] || [];
        fieldCallbacks[name].push(callback);
      } else {
        doneCallbacks.push(callback);
      }

      return output;
    };
    /**
     * cancels done callbacks. They won't invoke when async operations complete
     */


    var cancel = function cancel() {
      output.canceled = true;
      return output;
    };
    /**
     * Collects all fields that have an array of specified group in their results.
     * @param {String} group Group name (warnings or errors).
     * @returns {Object} Object of array per field.
     */


    var collectFailureMessages = function collectFailureMessages(group) {
      var collector = {};

      for (var fieldName in output.tests) {
        if (output.tests[fieldName] && output.tests[fieldName][group]) {
          collector[fieldName] = output.tests[fieldName][group];
        }
      }

      return collector;
    };
    /**
     * Gets all the errors of a field, or of the whole object.
     * @param {string} fieldName - The name of the field.
     * @return {array | object} The field's errors, or all errors.
     */


    var getErrors = function getErrors(fieldName) {
      if (!fieldName) {
        return collectFailureMessages('errors');
      }

      if (output.tests[fieldName].errors) {
        return output.tests[fieldName].errors;
      }

      return [];
    };
    /**
     * Gets all the warnings of a field, or of the whole object.
     * @param {string} [fieldName] - The name of the field.
     * @return {array | object} The field's warnings, or all warnings.
     */


    var getWarnings = function getWarnings(fieldName) {
      if (!fieldName) {
        return collectFailureMessages('warnings');
      }

      if (output.tests[fieldName].warnings) {
        return output.tests[fieldName].warnings;
      }

      return [];
    };
    /**
     * Checks if a certain field (or the whole suite) has errors.
     * @param {string} [fieldName]
     * @return {boolean}
     */


    var hasErrors = function hasErrors(fieldName) {
      if (!fieldName) {
        return !!output.errorCount;
      }

      return Boolean(output.tests[fieldName] && output.tests[fieldName].errorCount);
    };
    /**
     * Checks if a certain field (or the whole suite) has warnings
     * @param {string} [fieldName]
     * @return {boolean}
     */


    var hasWarnings = function hasWarnings(fieldName) {
      if (!fieldName) {
        return !!output.warnCount;
      }

      return Boolean(output.tests[fieldName] && output.tests[fieldName].warnCount);
    };

    var output = {
      name: name,
      errorCount: 0,
      warnCount: 0,
      testCount: 0,
      tests: {},
      skipped: [],
      tested: []
    };
    Object.defineProperties(output, {
      hasErrors: {
        value: hasErrors,
        writable: true,
        configurable: true,
        enumerable: false
      },
      hasWarnings: {
        value: hasWarnings,
        writable: true,
        configurable: true,
        enumerable: false
      },
      getErrors: {
        value: getErrors,
        writable: true,
        configurable: true,
        enumerable: false
      },
      getWarnings: {
        value: getWarnings,
        writable: true,
        configurable: true,
        enumerable: false
      },
      done: {
        value: done,
        writable: true,
        configurable: true,
        enumerable: false
      },
      cancel: {
        value: cancel,
        writable: true,
        configurable: true,
        enumerable: false
      }
    });
    return {
      markTestRun: markTestRun,
      markFailure: markFailure,
      setPending: setPending,
      addToSkipped: addToSkipped,
      markAsDone: markAsDone,
      pending: pending.tests,
      output: output
    };
  };

  /**
   * @type {String}
   */
  var SUITE_INIT_ERROR = 'Suite initialization error.';

  /**
   * Initializes a validation suite, creates a validation context.
   * @param {String} name     Descriptive name for validation suite.
   * @param {Function} tests  Validation suite body.
   * @returns {Object} Vest output object.
   */

  var validate = function validate(name, tests) {
    if (typeof name !== 'string') {
      return throwError(SUITE_INIT_ERROR + ' Expected name to be a string.', TypeError);
    }

    if (typeof tests !== 'function') {
      return throwError(SUITE_INIT_ERROR + ' Expected tests to be a function.', TypeError);
    }

    var result = suiteResult(name);
    new Context({
      result: result
    });
    tests();
    Context.clear();

    _toConsumableArray(result.pending).forEach(runAsync);

    return result.output;
  };

  /**
   * @returns {Object} Current output object.
   */

  var draft = function draft() {
    var ctx = singleton.useContext();

    if (ctx) {
      return ctx.result.output;
    }

    throwError('draft ' + ERROR_HOOK_CALLED_OUTSIDE);
  };

  /**
   * @type {String} Error message to display when `warn` gets called outside of a test.
   */
  var ERROR_OUTSIDE_OF_TEST = 'warn hook called outside of a test callback. It won\'t have an effect.';

  /**
   * Sets a running test to warn only mode.
   */

  var warn = function warn() {
    var ctx = singleton.useContext();

    if (!ctx) {
      throwError('warn ' + ERROR_HOOK_CALLED_OUTSIDE);
      return;
    }

    if (!ctx.currentTest) {
      throwError(ERROR_OUTSIDE_OF_TEST);
      return;
    }

    ctx.currentTest.warn();
  };

  /**
   * @type {String} Version number derived from current tag.
   */
  var VERSION = "1.0.5";

  var index = singleton.register({
    VERSION: VERSION,
    enforce: enforce_min,
    draft: draft,
    Enforce: enforce_min.Enforce,
    test: test,
    any: any,
    validate: validate,
    only: only,
    skip: skip,
    warn: warn
  });

  return index;

})));
//# sourceMappingURL=vest.js.map
