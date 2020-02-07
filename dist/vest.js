(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.vest = {}));
}(this, (function (exports) { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

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
        var t,
            r = Object.prototype.hasOwnProperty.call(n, e) && "function" == typeof n[e];
        return r || (t = 'Rule "'.concat(e, '" was not found in rules object. Make sure you typed it correctly.'), setTimeout(function () {
          throw new Error("[".concat("enforce", "]: ").concat(t));
        })), r;
      },
          u = Function("return this")(),
          i = function i() {
        return "function" == typeof u.Proxy;
      };

      function c(n) {
        return Boolean(Array.isArray(n));
      }

      function a(n) {
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

      function b(n, e) {
        return p(n) && p(e) && Number(n) === Number(e);
      }

      function g(e) {
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

      function d(n, e) {
        return n.length === e;
      }

      c.negativeForm = "isNotArray", a.negativeForm = "isNotNumber", f.negativeForm = "isNotString", s.negativeForm = "notMatches", l.negativeForm = "notInside", y.negativeForm = "notEquals", p.negativeForm = "isNotNumeric", b.negativeForm = "numberNotEquals", g.negativeForm = "isNotEmpty", m.alias = "gt", v.alias = "gte", h.alias = "lt", O.alias = "lte", d.negativeForm = "lengthNotEquals";

      function N(n) {
        return !!n;
      }

      N.negativeForm = "isFalsy";

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
        isArray: c,
        isNumber: a,
        isString: f,
        matches: s,
        inside: l,
        equals: y,
        numberEquals: b,
        isNumeric: p,
        isEmpty: g,
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
        lengthEquals: d,
        isOdd: function isOdd(n) {
          return !!p(n) && n % 2 != 0;
        },
        isEven: function isEven(n) {
          return !!p(n) && n % 2 == 0;
        },
        isTruthy: N
      });

      function w(e, t) {
        if ("function" == typeof e) {
          for (var r = arguments.length, o = new Array(r > 2 ? r - 2 : 0), u = 2; u < r; u++) {
            o[u - 2] = arguments[u];
          }

          if (!0 !== e.apply(void 0, [t].concat(o))) throw new Error("[Enforce]: invalid ".concat(n(t), " value"));
        }
      }

      function E() {
        var n = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
            t = r({}, j, {}, n);
        if (i()) return function (n) {
          var e = new Proxy(t, {
            get: function get(t, r) {
              if (o(t, r)) return function () {
                for (var o = arguments.length, u = new Array(o), i = 0; i < o; i++) {
                  u[i] = arguments[i];
                }

                return w.apply(void 0, [t[r], n].concat(u)), e;
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

              return w.apply(void 0, [t[i], n].concat(r)), u;
            })));
          }, {});
        };
      }

      var F = new E();
      return F.Enforce = E, F;
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

  /*! *****************************************************************************
  Copyright (c) Microsoft Corporation. All rights reserved.
  Licensed under the Apache License, Version 2.0 (the "License"); you may not use
  this file except in compliance with the License. You may obtain a copy of the
  License at http://www.apache.org/licenses/LICENSE-2.0

  THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
  KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
  WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
  MERCHANTABLITY OR NON-INFRINGEMENT.

  See the Apache Version 2.0 License for specific language governing permissions
  and limitations under the License.
  ***************************************************************************** */

  function __spreadArrays() {
      for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
      for (var r = Array(s), k = 0, i = 0; i < il; i++)
          for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
              r[k] = a[j];
      return r;
  }

  var globalObject = Function('return this')();

  var throwError = function throwError(message, type) {
    if (type === void 0) {
      type = Error;
    }

    return setTimeout(function () {
      throw new type("[Vest]: " + message);
    });
  };

  var VEST_MAJOR = "1.0.4".split('.')[0];
  var SYMBOL_VEST = Symbol["for"]("VEST#" + VEST_MAJOR);

  var throwMultipleVestError = function throwMultipleVestError() {
    var versions = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      versions[_i] = arguments[_i];
    }

    throwError("Multiple versions of Vest detected: (" + versions.join() + ").\n    Most features should work regularly, but for optimal feature compatibility, you should have all running instances use the same version.");
  };

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

  var use = function use() {
    return globalObject[SYMBOL_VEST];
  };

  var useContext = function useContext() {
    return use().ctx;
  };

  var singleton = {
    use: use,
    useContext: useContext,
    register: register
  };

  var Context = function () {
    function Context(parent) {
      singleton.use().ctx = this;

      _extends(this, parent);
    }

    Context.clear = function () {
      singleton.use().ctx = null;
    };

    Context.prototype.setCurrentTest = function (testObject) {
      this.currentTest = testObject;
    };

    Context.prototype.removeCurrentTest = function () {
      delete this.currentTest;
    };

    return Context;
  }();

  var ERROR_HOOK_CALLED_OUTSIDE = 'hook called outside of a running suite.';

  var GROUP_NAME_ONLY = 'only';
  var GROUP_NAME_SKIP = 'skip';

  var addTo = function addTo(group, item) {
    var ctx = singleton.useContext();

    if (!item) {
      return;
    }

    if (!ctx) {
      throwError(group + " " + ERROR_HOOK_CALLED_OUTSIDE);
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

  var only = function only(item) {
    return addTo(GROUP_NAME_ONLY, item);
  };
  var skip = function skip(item) {
    return addTo(GROUP_NAME_SKIP, item);
  };
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

  var TestObject = function () {
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

    TestObject.prototype.valueOf = function () {
      return this.failed !== true;
    };

    TestObject.prototype.fail = function () {
      this.ctx.result.markFailure({
        fieldName: this.fieldName,
        statement: this.statement,
        isWarning: this.isWarning
      });
      this.failed = true;
      return this;
    };

    TestObject.prototype.warn = function () {
      this.isWarning = true;
      return this;
    };

    return TestObject;
  }();

  var runAsync = function runAsync(testObject) {
    var asyncTest = testObject.asyncTest,
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
      asyncTest.then(done, fail);
    } catch (e) {
      fail();
    }

    ctx.removeCurrentTest();
  };

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

  var register$1 = function register(testObject) {
    var ctx = testObject.ctx,
        fieldName = testObject.fieldName;
    var isPending = false;
    var result;

    if (isExcluded(fieldName)) {
      ctx.result.addToSkipped(fieldName);
      return;
    }

    ctx.result.markTestRun(fieldName);
    result = runTest(testObject);

    if (result && typeof result.then === 'function') {
      isPending = true;
      testObject.asyncTest = result;
    }

    if (isPending) {
      ctx.result.setPending(testObject);
    }
  };

  var test = function test(fieldName) {
    var args = [];

    for (var _i = 1; _i < arguments.length; _i++) {
      args[_i - 1] = arguments[_i];
    }

    var statement, testFn;

    if (typeof args[0] === 'string') {
      statement = args[0], testFn = args[1];
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

    var setPending = function setPending(testObject) {
      isAsync = true;
      pending.tests.push(testObject);
    };

    var clearFromPending = function clearFromPending(testObject) {
      pending.tests = pending.tests.filter(function (t) {
        return t !== testObject;
      });
    };

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

    var markFailure = function markFailure(_a) {
      var fieldName = _a.fieldName,
          statement = _a.statement,
          isWarning = _a.isWarning;

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

    var addToSkipped = function addToSkipped(fieldName) {
      !output.skipped.includes(fieldName) && output.skipped.push(fieldName);
    };

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

    var done = function done() {
      var args = [];

      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }

      var name, callback;

      if (typeof args[0] === 'string') {
        name = args[0], callback = args[1];
      } else if (typeof args[0] === 'function') {
        callback = args[0];
      }

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

    var cancel = function cancel() {
      output.canceled = true;
      return output;
    };

    var collectFailureMessages = function collectFailureMessages(group) {
      var collector = {};

      for (var fieldName in output.tests) {
        if (output.tests[fieldName] && output.tests[fieldName][group]) {
          collector[fieldName] = output.tests[fieldName][group];
        }
      }

      return collector;
    };

    var getErrors = function getErrors(fieldName) {
      if (!fieldName) {
        return collectFailureMessages('errors');
      }

      if (output.tests[fieldName].errors) {
        return output.tests[fieldName].errors;
      }

      return [];
    };

    var getWarnings = function getWarnings(fieldName) {
      if (!fieldName) {
        return collectFailureMessages('warnings');
      }

      if (output.tests[fieldName].warnings) {
        return output.tests[fieldName].warnings;
      }

      return [];
    };

    var hasErrors = function hasErrors(fieldName) {
      if (!fieldName) {
        return !!output.errorCount;
      }

      return Boolean(output.tests[fieldName] && output.tests[fieldName].errorCount);
    };

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
      tested: [],
      canceled: false
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

  var SUITE_INIT_ERROR = 'Suite initialization error.';

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

    __spreadArrays(result.pending).forEach(runAsync);

    return result.output;
  };

  var draft = function draft() {
    var ctx = singleton.useContext();

    if (ctx) {
      return ctx.result.output;
    }

    throwError('draft ' + ERROR_HOOK_CALLED_OUTSIDE);
  };

  var ERROR_OUTSIDE_OF_TEST = 'warn hook called outside of a test callback. It won\'t have an effect.';

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
  var VERSION = "1.0.4";

  var Enforce = enforce_min.Enforce;
  var vest = {
    VERSION: VERSION,
    enforce: enforce_min,
    draft: draft,
    Enforce: Enforce,
    test: test,
    any: any,
    validate: validate,
    only: only,
    skip: skip,
    warn: warn
  };
  var index = singleton.register(vest);

  exports.Enforce = Enforce;
  exports.VERSION = VERSION;
  exports.any = any;
  exports.default = index;
  exports.draft = draft;
  exports.enforce = enforce_min;
  exports.only = only;
  exports.skip = skip;
  exports.test = test;
  exports.validate = validate;
  exports.warn = warn;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=vest.js.map
