import { readFileSync } from 'fs';
import path from 'path';

import { create, enforce, test } from '../../vest/src/vest';

type PostedMessage = {
  source: string;
  type: string;
  payload: any;
};

type MockWindow = {
  postMessage: (data: PostedMessage) => void;
  addEventListener: (
    type: string,
    handler: (event: { source: MockWindow; data: any }) => void,
  ) => void;
  __VEST_DEVTOOLS__?: { registerSuite: (suite: any, opts?: any) => void };
};

const PAGE_SCRIPT_PATH = path.resolve(
  __dirname,
  '..',
  'public',
  'page-script.js',
);

describe('vest devtools page script', () => {
  afterEach(() => {
    // @ts-expect-error clearing global mock
    delete globalThis.window;
  });

  it('registers suite and emits state snapshots with focus tags', () => {
    const { window, messages } = setupWindow();
    loadPageScript(window);

    const callbacks = new Map();
    const suite = {
      subscribe: (event: string, cb: () => void) => {
        callbacks.set(event, cb);
        return () => undefined;
      },
      get: () => ({
        valid: false,
        errorCount: 1,
        warnCount: 1,
        pendingCount: 0,
        testCount: 2,
        tests: {
          username: {
            valid: false,
            errorCount: 1,
            warnCount: 0,
            pendingCount: 0,
            testCount: 1,
            errors: ['Required'],
            warnings: [],
          },
          email: {
            valid: true,
            errorCount: 0,
            warnCount: 1,
            pendingCount: 0,
            testCount: 1,
            errors: [],
            warnings: ['Suspicious domain'],
          },
        },
      }),
      dump: () => ({
        $type: 'Focused',
        data: {
          focusMode: 0,
          matchAll: false,
          match: ['username'],
        },
        children: [],
      }),
    };

    window.__VEST_DEVTOOLS__?.registerSuite(suite, {
      id: 'suite-1',
      name: 'signup',
    });

    expect(messages[0].payload.eventName).toBe('SUITE_REGISTERED');
    expect(messages[0].payload.state.focus).toEqual({
      mode: 'only',
      matchAll: false,
      match: ['username'],
    });

    const callback = callbacks.get('TEST_COMPLETED') as () => void;
    callback();

    const eventMessage = messages.find(
      msg => msg.payload.eventName === 'TEST_COMPLETED',
    );
    expect(eventMessage).toBeTruthy();
    expect(eventMessage.payload.state.fields[0].status).toBe('failing');
    expect(eventMessage.payload.state.fields[1].status).toBe('warning');
  });

  it('runs a real vest suite when receiving RUN_SUITE commands', () => {
    const { window, handlers, messages } = setupWindow();
    loadPageScript(window);

    const suite = create((data: { username?: string }) => {
      test('username', 'required', () => {
        enforce(data.username).isNotBlank();
      });
    });

    window.__VEST_DEVTOOLS__?.registerSuite(suite, {
      id: 'suite-run',
      name: 'signup',
    });

    const handler = handlers[0];
    handler({
      source: window,
      data: {
        source: 'vest-devtools-command',
        type: 'RUN_SUITE',
        suiteId: 'suite-run',
        input: { username: '' },
      },
    });

    const eventNames = messages.map(msg => msg.payload.eventName);
    expect(eventNames).toContain('SUITE_RUN_STARTED');
  });
});

function loadPageScript(window: MockWindow) {
  const script = readFileSync(PAGE_SCRIPT_PATH, 'utf8');
  const runner = new Function('window', script);
  runner(window);
}

function setupWindow() {
  const messages: PostedMessage[] = [];
  const handlers: Array<(event: { source: MockWindow; data: any }) => void> = [];
  const window: MockWindow = {
    postMessage: data => messages.push(data),
    addEventListener: (type, handler) => {
      if (type === 'message') {
        handlers.push(handler);
      }
    },
  };

  globalThis.window = window as any;

  return { window, messages, handlers };
}
