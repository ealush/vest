import { expectTypeOf, it } from 'vitest';

import { searchRoute } from './router';

it('infers transformed search output from Vest', () => {
  type Search = (typeof searchRoute)['types']['fullSearchSchema'];
  expectTypeOf<Search>().toEqualTypeOf<{ page: number; query: string }>();
});
