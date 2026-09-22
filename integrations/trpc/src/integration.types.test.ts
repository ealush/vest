import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { expectTypeOf, it } from 'vitest';

import type { AppRouter } from './router';

it('preserves the Vest 6 Standard Schema output contract', () => {
  type Inputs = inferRouterInputs<AppRouter>;
  type Outputs = inferRouterOutputs<AppRouter>;

  expectTypeOf<Inputs['createAccount']>().toEqualTypeOf<{
    email: string;
    profile: { age: string | number };
  }>();
  expectTypeOf<Outputs['createAccount']>().toEqualTypeOf<{
    accepted: true;
    account: { email: string; profile: { age: string | number } };
  }>();
});
