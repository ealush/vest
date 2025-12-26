import wait from 'wait';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { IsolateSerializer } from 'vestjs-runtime';

import { Protocol } from '../core/server/Protocol';
import { VEST_VERSION } from '../constants';
import { ServerRegistry } from '../core/server/ServerRegistry';
import * as vest from '../vest';

describe('Server isolates', () => {
  const session = vest.createSession('USER_VALIDATION_SESSION');

  beforeEach(() => {
    ServerRegistry.delete(session.id);
    vest.createServerAdapter(null);
  });

  afterEach(() => {
    vest.createServerAdapter(null);
    ServerRegistry.delete(session.id);
  });

  it('registers server handlers in the registry', () => {
    const handler = vi.fn();
    vest.server(session, handler);
    expect(ServerRegistry.get(session.id)).toBe(handler);
  });

  it('warns when overwriting a handler in development', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    vest.server(session, () => {});
    vest.server(session, () => {});

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('is being overwritten'),
    );
    process.env.NODE_ENV = originalEnv;
    consoleSpy.mockRestore();
  });

  it('throws when no adapter is configured on the client', () => {
    const suite = vest.create(() => {
      vest.server(session, { username: 'test_user' });
    });

    expect(() => suite.run()).toThrowError(/No server adapter configured/);
  });

  it('hydrates server isolate responses into the client tree', async () => {
    vest.server(session, (data: { username: string }) => {
      vest.test('username', 'Username is already taken', () => {
        return data.username !== 'taken_user';
      });
    });

    const transport = vi.fn(async (tokenId: string, data: any) => {
      await wait(0);
      const serverSuite = vest.create(() => {
        ServerRegistry.run(tokenId, data);
      });
      const result = serverSuite.run();

      return Protocol.wrap(
        IsolateSerializer.serialize(result.dump(), value => value),
      );
    });

    vest.createServerAdapter(transport);

    const suite = vest.create((data: { username: string }) => {
      vest.server(session, data);
    });

    const result = suite.run({ username: 'taken_user' });

    expect(result.hasErrors('username')).toBe(false);
    expect(transport).toHaveBeenCalledWith(session.id, { username: 'taken_user' }, expect.any(Object));

    await wait(0);

    expect(suite.get().hasErrors('username')).toBe(true);
    expect(suite.get().getError('username')).toBe(
      'Username is already taken',
    );
  });

  it('ignores raw strings returned by the adapter', async () => {
    vest.createServerAdapter(async () => 'not-json');

    const suite = vest.create(() => {
      vest.server(session, { username: 'test' });
    });

    expect(() => suite.run()).not.toThrow();
    await wait(0);

    expect(suite.get()).toBeDefined();
  });

  it('warns and ignores version mismatches', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const mismatchedVersion = `${VEST_VERSION}-mismatch`;
    const mismatched = Protocol.wrap('');
    const transport = vi.fn(async () => ({
      ...mismatched,
      version: mismatchedVersion,
    }));

    vest.createServerAdapter(transport);

    const suite = vest.create(() => {
      vest.server(session, { username: 'test' });
    });

    suite.run();
    await wait(0);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Version Mismatch'),
    );
    consoleSpy.mockRestore();
  });

  it('passes an AbortSignal to the adapter and aborts on rerun', async () => {
    let firstSignal: AbortSignal | undefined;
    let secondSignal: AbortSignal | undefined;
    vest.createServerAdapter(async (_id, _data, { signal }) => {
      if (!firstSignal) {
        firstSignal = signal;
      } else {
        secondSignal = signal;
      }
      return Protocol.wrap('');
    });

    const suite = vest.create(() => {
      vest.server(session, { username: 'test' });
    });

    suite.run();
    suite.run();

    expect(firstSignal).toBeDefined();
    expect(secondSignal).toBeDefined();
    expect(firstSignal?.aborted).toBe(true);
    expect(secondSignal?.aborted).toBe(false);
  });
});
