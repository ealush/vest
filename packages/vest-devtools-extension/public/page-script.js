(() => {
  const HOOK_KEY = '__VEST_DEVTOOLS__';

  if (window[HOOK_KEY]) {
    return;
  }

  const eventNames = [
    'TEST_RUN_STARTED',
    'TEST_COMPLETED',
    'ALL_RUNNING_TESTS_FINISHED',
    'REMOVE_FIELD',
    'RESET_FIELD',
    'RESET_SUITE',
    'SUITE_RUN_STARTED',
    'SUITE_CALLBACK_RUN_FINISHED',
    'DONE_TEST_OMISSION_PASS',
    'INITIALIZING_CALLBACKS',
    'DEFER_THROW',
    'ASYNC_ISOLATE_DONE',
    'ISOLATE_DONE',
    'ISOLATE_ENTER',
    'ISOLATE_PENDING',
    'ISOLATE_RECONCILED',
  ];

  const registeredSuites = new Map();

  function registerSuite(suite, options = {}) {
    if (!suite || typeof suite.subscribe !== 'function') {
      return;
    }

    const suiteId =
      options.id ||
      `suite-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    const suiteName = options.name || suiteId;

    if (registeredSuites.has(suiteId)) {
      return;
    }

    const suiteData = {
      id: suiteId,
      name: suiteName,
      suite,
      lastRunArgs: [],
      lastRunMethod: 'run',
    };

    registeredSuites.set(suiteId, suiteData);
    wrapSuiteMethods(suiteData);

    eventNames.forEach(eventName => {
      suite.subscribe(eventName, payload => {
        emitEvent({
          suiteId,
          suiteName,
          eventName,
          payload,
          lastRunArgs: suiteData.lastRunArgs,
          state: serializeState(suite),
        });
      });
    });

    emitEvent({
      suiteId,
      suiteName,
      eventName: 'SUITE_REGISTERED',
      payload: null,
      lastRunArgs: suiteData.lastRunArgs,
      state: serializeState(suite),
    });
  }

  function wrapSuiteMethods(suiteData) {
    ['run', 'runStatic', 'validate'].forEach(methodName => {
      const method = suiteData.suite[methodName];
      if (typeof method !== 'function' || method.__vestDevtoolsWrapped) {
        return;
      }

      const wrapped = function (...args) {
        suiteData.lastRunArgs = toSerializable(args);
        suiteData.lastRunMethod = methodName;
        return method.apply(this, args);
      };

      wrapped.__vestDevtoolsWrapped = true;
      suiteData.suite[methodName] = wrapped;
    });
  }

  function serializeState(suite) {
    const result = suite.get();
    const focus = getFocusState(suite);
    const tests = result.tests || {};
    const fields = Object.keys(tests).map(name => {
      const summary = tests[name] || {};

      return {
        name,
        status: resolveStatus(summary),
        errorCount: summary.errorCount ?? 0,
        warnCount: summary.warnCount ?? 0,
        pendingCount: summary.pendingCount ?? 0,
        testCount: summary.testCount ?? 0,
        errors: toSerializable(summary.errors ?? []),
        warnings: toSerializable(summary.warnings ?? []),
        valid: summary.valid ?? null,
      };
    });

    return {
      valid: result.valid ?? null,
      errorCount: result.errorCount ?? 0,
      warnCount: result.warnCount ?? 0,
      pendingCount: result.pendingCount ?? 0,
      testCount: result.testCount ?? 0,
      fields,
      focus,
    };
  }

  function resolveStatus(summary) {
    if ((summary.pendingCount ?? 0) > 0) {
      return 'pending';
    }

    if (summary.valid === false || (summary.errorCount ?? 0) > 0) {
      return 'failing';
    }

    if ((summary.warnCount ?? 0) > 0) {
      return 'warning';
    }

    if (summary.valid === true) {
      return 'passing';
    }

    return 'idle';
  }

  function getFocusState(suite) {
    try {
      const root = suite.dump();
      const focusIsolate = findIsolate(
        root,
        isolate => isolate?.$type === 'Focused',
      );
      if (!focusIsolate) {
        return { mode: null, matchAll: false, match: [] };
      }
      const focusMode = focusIsolate.data?.focusMode;
      const matchAll = Boolean(focusIsolate.data?.matchAll);
      const match = Array.isArray(focusIsolate.data?.match)
        ? focusIsolate.data?.match
        : [];

      return {
        mode: focusMode === 0 ? 'only' : focusMode === 1 ? 'skip' : null,
        matchAll,
        match,
      };
    } catch (error) {
      return { mode: null, matchAll: false, match: [] };
    }
  }

  function findIsolate(root, predicate) {
    if (!root) {
      return null;
    }

    const queue = [root];

    while (queue.length) {
      const current = queue.shift();
      if (predicate(current)) {
        return current;
      }
      if (Array.isArray(current.children)) {
        queue.push(...current.children);
      }
    }

    return null;
  }

  function emitEvent({
    suiteId,
    suiteName,
    eventName,
    payload,
    lastRunArgs,
    state,
  }) {
    window.postMessage(
      {
        source: 'vest-devtools',
        type: 'event',
        payload: {
          suiteId,
          suiteName,
          eventName,
          timestamp: Date.now(),
          payload: toSerializable(payload),
          lastRunArgs,
          state,
        },
      },
      '*',
    );
  }

  function toSerializable(value) {
    const seen = new WeakSet();

    try {
      return JSON.parse(
        JSON.stringify(value, (_key, val) => {
          if (typeof val === 'function') {
            return '[Function]';
          }
          if (typeof val === 'symbol') {
            return val.toString();
          }
          if (typeof val === 'bigint') {
            return val.toString();
          }
          if (val instanceof Error) {
            return {
              name: val.name,
              message: val.message,
              stack: val.stack,
            };
          }
          if (typeof val === 'undefined') {
            return '[Undefined]';
          }
          if (val && typeof val === 'object') {
            if (seen.has(val)) {
              return '[Circular]';
            }
            seen.add(val);
          }
          return val;
        }),
      );
    } catch (error) {
      return String(value);
    }
  }

  window[HOOK_KEY] = {
    registerSuite,
  };

  window.addEventListener('message', event => {
    if (event.source !== window) {
      return;
    }

    const data = event.data;
    if (!data || data.source !== 'vest-devtools-command') {
      return;
    }

    if (data.type === 'RUN_SUITE') {
      const suiteData = registeredSuites.get(data.suiteId);
      if (!suiteData) {
        return;
      }

      const mode = data.mode ?? suiteData.lastRunMethod ?? 'run';
      const args = Array.isArray(suiteData.lastRunArgs)
        ? [...suiteData.lastRunArgs]
        : [];

      if (data.input !== undefined) {
        if (args.length) {
          args[0] = data.input;
        } else {
          args.push(data.input);
        }
      }

      const runner = suiteData.suite[mode] ?? suiteData.suite.run;
      if (typeof runner === 'function') {
        runner(...args);
      }
    }
  });
})();
