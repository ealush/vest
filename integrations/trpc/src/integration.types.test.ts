import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';
import { expectTypeOf, it } from 'vitest';

import type { AppRouter } from './router';

it('infers Vest input and transformed procedure output', () => {
  type Inputs = inferRouterInputs<AppRouter>;
  type Outputs = inferRouterOutputs<AppRouter>;

  expectTypeOf<Inputs['createAccount']>().toEqualTypeOf<{
    email: string;
    profile: { age: string | number };
  }>();
  expectTypeOf<Outputs['createAccount']>().toEqualTypeOf<{
    accepted: true;
    account: { email: string; profile: { age: number } };
  }>();
});
