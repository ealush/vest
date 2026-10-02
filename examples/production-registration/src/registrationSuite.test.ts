import { afterEach, describe, expect, it, vi } from 'vitest';

import { createRegistrationSuite } from './registrationSuite';
import { registerAction } from './serverAction';
import { handleRegistration } from './server';
import { emptyRegistration, type RegistrationData } from './types';

const validRegistration: RegistrationData = {
  ...emptyRegistration,
  confirmPassword: 'securepass1',
  email: 'dev@example.com',
  password: 'securepass1',
  username: 'current-user',
};

describe('production registration architecture', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retains a previously valid field during a focused update', async () => {
    const suite = createRegistrationSuite({
      isUsernameAvailable: vi.fn().mockResolvedValue(true),
    });

    await suite.only('email').run(validRegistration);
    suite.only('password').run({ ...validRegistration, password: 'short' });

    expect(suite.get().isTested('email')).toBe(true);
    expect(suite.get().isValid('email')).toBe(true);
    expect(suite.get().hasErrors('password')).toBe(true);
  });

  it('keeps the newest async username result when requests finish out of order', async () => {
    const resolvers = new Map<string, (available: boolean) => void>();
    const signals = new Map<string, AbortSignal>();
    const suite = createRegistrationSuite({
      isUsernameAvailable: vi.fn(
        (username: string, signal: AbortSignal) =>
          new Promise<boolean>(resolve => {
            signals.set(username, signal);
            resolvers.set(username, resolve);
          }),
      ),
    });

    suite
      .only('username')
      .run({ ...validRegistration, username: 'older-user' });
    const currentRun = suite
      .only('username')
      .run({ ...validRegistration, username: 'current-user' });

    expect(signals.get('older-user')?.aborted).toBe(true);

    resolvers.get('current-user')?.(true);
    await currentRun;
    resolvers.get('older-user')?.(false);
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(suite.get().hasErrors('username')).toBe(false);
    expect(suite.get().isValid('username')).toBe(true);
  });

  it('omits irrelevant company rules and keeps warnings non-blocking', async () => {
    const suite = createRegistrationSuite({
      isUsernameAvailable: vi.fn().mockResolvedValue(true),
    });

    const personal = await suite.run(validRegistration);
    expect(personal.hasErrors('companyName')).toBe(false);
    expect(personal.isValid()).toBe(true);

    const weakButValid = await suite.run({
      ...validRegistration,
      confirmPassword: 'longpassword',
      password: 'longpassword',
    });
    expect(weakButValid.hasWarnings('password')).toBe(true);
    expect(weakButValid.isValid()).toBe(true);

    const business = await suite.run({
      ...validRegistration,
      accountType: 'business',
      companyName: '',
    });
    expect(business.hasErrors('companyName')).toBe(true);
  });

  it('parses the boundary and validates each server request statelessly', async () => {
    const services = {
      isUsernameAvailable: vi.fn(
        async (username: string) => username !== 'taken',
      ),
    };

    const [accepted, rejected] = await Promise.all([
      handleRegistration(
        { ...validRegistration, email: '  DEV@EXAMPLE.COM  ' },
        services,
      ),
      handleRegistration({ ...validRegistration, username: 'taken' }, services),
    ]);

    expect(accepted.status).toBe(201);
    expect(
      accepted.status === 201 ? accepted.body.account.email : undefined,
    ).toBe('dev@example.com');
    if (accepted.status === 201) {
      expect(accepted.body.account).not.toHaveProperty('password');
      expect(accepted.body.account).not.toHaveProperty('confirmPassword');
    }
    expect(rejected.status).toBe(422);
  });

  it('rejects a failed username-service response in the Server Action', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503 }),
    );
    const formData = new FormData();
    for (const [key, value] of Object.entries(validRegistration)) {
      if (typeof value === 'boolean') {
        if (value) formData.set(key, 'on');
      } else {
        formData.set(key, value);
      }
    }

    await expect(registerAction(formData)).resolves.toMatchObject({
      errors: {
        username: ['Username availability service failed'],
      },
      ok: false,
    });
  });
});
