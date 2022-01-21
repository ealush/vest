import { create, test } from 'vest';

describe('suite.resetField', () => {
  let suite;

  beforeEach(() => {
    suite = create(() => {
      test('field1', 'f1 error', () => false);
      test('field2', 'f2 error', () => false);
    });
    suite();
  });

  it('Should reset the validity state of a field', () => {
    expect(suite.get().hasErrors('field1')).toBe(true);
    expect(suite.get().hasErrors('field2')).toBe(true);
    expect(suite.get().getErrors('field1')).toEqual(['f1 error']);
    expect(suite.get().getErrors('field2')).toEqual(['f2 error']);
    suite.resetField('field1');
    expect(suite.get().hasErrors('field1')).toBe(false);
    expect(suite.get().hasErrors('field2')).toBe(true);
    expect(suite.get().getErrors('field1')).toEqual([]);
    expect(suite.get().getErrors('field2')).toEqual(['f2 error']);
    suite.resetField('field2');
    expect(suite.get().hasErrors('field1')).toBe(false);
    expect(suite.get().hasErrors('field2')).toBe(false);
    expect(suite.get().getErrors('field1')).toEqual([]);
    expect(suite.get().getErrors('field2')).toEqual([]);
  });

  it('Should refresh the suite result', () => {
    const res = suite.get();
    expect(res).toBe(suite.get());
    suite.resetField('field1');
    expect(res).not.toBe(suite.get());
  });

  it('Should allow the field to keep updating (no final status)', () => {
    suite.resetField('field1');
    expect(suite.get().hasErrors('field1')).toBe(false);
    expect(suite.get().hasErrors('field2')).toBe(true);
    suite();
    expect(suite.get().hasErrors('field1')).toBe(true);
    expect(suite.get().hasErrors('field2')).toBe(true);
  });

  it('sanity', () => {
    expect(suite.get().tests).toMatchInlineSnapshot(`
      Object {
        "field1": Object {
          "errorCount": 1,
          "errors": Array [
            "f1 error",
          ],
          "testCount": 1,
          "warnCount": 0,
        },
        "field2": Object {
          "errorCount": 1,
          "errors": Array [
            "f2 error",
          ],
          "testCount": 1,
          "warnCount": 0,
        },
      }
    `);
  });
});
