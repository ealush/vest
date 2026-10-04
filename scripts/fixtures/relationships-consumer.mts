import 'vest/relationships';
import { create, enforce, test } from 'vest';
import {
  FIELD,
  resolveAffected,
  type DependencyResolver,
} from 'n4s/relationships';
// @ts-expect-error representation introspection is not a public export
import type { canPickRelationshipSchema } from 'n4s/relationships';

export const schema = enforce.shape({
  password: enforce.isString(),
  confirm: enforce
    .condition(
      (value: unknown) => value === enforce.context()?.parent()?.value.password,
    )
    .dependsOn($ => $.password),
  age: enforce.isNumeric().toNumber(),
});
export const nested = enforce.shape({ user: schema });
const suite = create(() => test('confirm', () => true), schema);
const result = suite.changed('password').run({ password: 'a', confirm: 'a' });
if (
  !result.valid ||
  JSON.stringify(result.value) !== '{"password":"a","confirm":"a"}'
)
  throw new Error('changed output');
if (schema.describe().relationships.length !== 1)
  throw new Error('graph entry registration');
if (resolveAffected(schema, ['password'], {}).length !== 2)
  throw new Error('planner export');
const complete = suite.run({ password: 'a', confirm: 'a', age: '42' });
if (!complete.valid || complete.value.age !== 42)
  throw new Error('parsed complete output');

function typeContracts() {
  const resolver: DependencyResolver = $ =>
    [$.password, $[FIELD]('confirm')] as const;
  enforce.isString().dependsOn(resolver);
  // @ts-expect-error a resolver must return references
  enforce.isString().dependsOn(() => 'password');
  // @ts-expect-error a complete run still requires all input fields
  suite.run({ password: 'a' });
  if (complete.valid) {
    const age: number = complete.value.age;
    void age;
  }
  if (result.valid) {
    const age: number | undefined = result.value.age;
    void age;
    // @ts-expect-error a changed output can omit age
    const guaranteed: number = result.value.age;
    void guaranteed;
  }
  const latest = suite.get();
  if (latest.valid) {
    const age: string | number | undefined = latest.value.age;
    void age;
    // @ts-expect-error a present observed field can still contain unparsed input
    const parsed: number | undefined = latest.value.age;
    void parsed;
    // @ts-expect-error observing the current state does not prove a complete run
    const guaranteed: number = latest.value.age;
    void guaranteed;
  }
  const focused = suite.only('password').run({ password: 'a', age: '42' });
  if (focused.valid) {
    const age: string | number | undefined = focused.value.age;
    void age;
    // @ts-expect-error unchecked focused parser fields can contain raw input
    const parsed: number | undefined = focused.value.age;
    void parsed;
    // @ts-expect-error a focused output can omit age
    const guaranteed: number = focused.value.age;
    void guaranteed;
  }
  const cleared = suite
    .changed('password')
    .only('password')
    .changed(undefined)
    .run({ password: 'a', age: '42' });
  if (cleared.valid) {
    // @ts-expect-error clearing changed focus restores unchecked focused output
    const parsed: number | undefined = cleared.value.age;
    void parsed;
  }
  const scalar = create(() => {}, enforce.isNumber())
    .changed([])
    .run(1);
  if (scalar.valid) {
    // @ts-expect-error an empty selection returns an empty object
    const guaranteed: number = scalar.value;
    void guaranteed;
  }
  const changed = suite.changed('password');
  // @ts-expect-error changed builders do not expose stateless execution
  changed.runStatic({ password: 'a', confirm: 'a', age: '42' });
}
void typeContracts;
