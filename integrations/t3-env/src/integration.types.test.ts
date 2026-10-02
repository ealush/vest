import { expectTypeOf, it } from 'vitest';

import { parseEnvironment } from './env';

it('infers transformed Vest output for environment values', () => {
  const env = parseEnvironment({
    API_URL: 'https://vestjs.dev',
    PORT: '3000',
    PUBLIC_APP_NAME: 'Vest',
  });

  expectTypeOf(env.API_URL).toEqualTypeOf<string>();
  expectTypeOf(env.PORT).toEqualTypeOf<number>();
  expectTypeOf(env.PUBLIC_APP_NAME).toEqualTypeOf<string>();
});
