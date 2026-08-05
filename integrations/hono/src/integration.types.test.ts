import { expect, expectTypeOf, it } from 'vitest';

import { createApp } from './app';

it('exposes a typed Hono application', () => {
  const app = createApp();
  expect(app).toBeDefined();
  expectTypeOf(app.request).toBeFunction();
});
