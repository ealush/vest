import { describe, it, expect } from 'vitest';

import { addToChain, registerLazyRule } from '../genRuleChain';

describe('genRuleChain', () => {
  it('builds a chain with a base predicate and runs it', () => {
    const chain = addToChain({}, (v: unknown) => typeof v === 'number');

    expect(chain.run(1)).toMatchObject({ pass: true });
    expect(chain.run('1')).toMatchObject({ pass: false });
  });

  it('adds rule methods from the provided rules map', () => {
    const rules = {
      greaterThan: (value: number, min: number) => value > min,
      isEven: (value: number) => value % 2 === 0,
    } as const;

    const chain: any = addToChain(rules, (v: unknown) => typeof v === 'number');

    expect(chain.greaterThan).toBeTypeOf('function');
    expect(chain.isEven).toBeTypeOf('function');

    expect(chain.greaterThan(3).isEven().run(6)).toMatchObject({ pass: true });
    expect(chain.greaterThan(3).isEven().run(5)).toMatchObject({ pass: false });
    expect(chain.greaterThan(10).run(9)).toMatchObject({ pass: false });
  });

  it('registers a lazy rule and uses it in the chain', () => {
    registerLazyRule('custom', (n: number) => (value: unknown) => {
      return typeof value === 'number' && (value as number) % n === 0;
    });

    const chain: any = addToChain({}, (v: unknown) => typeof v === 'number');

    expect(chain.custom).toBeTypeOf('function');
    expect(chain.custom(3).run(9)).toMatchObject({ pass: true });
    expect(chain.custom(3).run(10)).toMatchObject({ pass: false });
  });
});
