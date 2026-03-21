import { describe, it, expect } from 'vitest';
import * as vest from '../../vest';

describe('Success severity', () => {
  it('Should apply the message when a sync test passes', () => {
    const suite = vest.create(() => {
      vest.test('field1', 'this is a success message', () => {
        const severity = vest.useSeverity();
        severity.success();
      });
    });

    const res = suite.run();
    expect(res.hasSuccesses('field1')).toBe(true);
    expect(res.getSuccesses('field1')).toEqual(['this is a success message']);
  });

  it('Should apply the message when an async test passes', async () => {
    const suite = vest.create(() => {
      vest.test('field1', 'this is an async success message', async () => {
        const severity = vest.useSeverity();
        severity.success();
        return Promise.resolve();
      });
    });

    let res = suite.run();
    expect(res.isPending('field1')).toBe(true);

    await suite.run();
    res = suite.get();
    expect(res.hasSuccesses('field1')).toBe(true);
    expect(res.getSuccesses('field1')).toEqual([
      'this is an async success message',
    ]);
  });

  it('Should NOT apply the message when a test throws (sync)', () => {
    const suite = vest.create(() => {
      vest.test('field1', 'this is a success message', () => {
        const severity = vest.useSeverity();
        severity.success();
        throw new Error('sync error');
      });
    });

    const res = suite.run();
    expect(res.hasSuccesses('field1')).toBe(false);
  });

  it('Should NOT apply the message when a test rejects (async)', async () => {
    const suite = vest.create(() => {
      vest.test('field1', 'this is a success message', async () => {
        const severity = vest.useSeverity();
        severity.success();
        throw new Error('async error');
      });
    });

    let res = suite.run();
    await suite.run();

    res = suite.get();
    expect(res.hasSuccesses('field1')).toBe(false);
  });
});
