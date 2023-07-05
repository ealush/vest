import * as vest from 'vest';

enum Fields {
  F1 = 'F1',
  F2 = 'F2',
  F3 = 'F3',
  F4 = 'F4',
}

function testSuite(callback) {
  return vest.staticSuite(callback)();
}

describe('Focused Scoped', () => {
  describe('Top Level Skip', () => {
    describe('Single field', () => {
      it('Should skip fields under `skip`', () => {
        const result = testSuite(() => {
          vest.skip(Fields.F1);

          vest.test(Fields.F1, 'F1 error', () => false);
          vest.test(Fields.F2, 'F2 error', () => false);
        });
        expect(result.hasErrors(Fields.F1)).toBe(false);
        expect(result.hasErrors(Fields.F2)).toBe(true);
        expect(result.testCount).toBe(1);
        expect(result.errorCount).toBe(1);
        expect(result.tests.F1.errorCount).toBe(0);
        expect(result.tests.F2.errorCount).toBe(1);
      });
    });

    describe('Multiple Fields', () => {
      it('Should skip fields under `skip`', () => {
        const result = testSuite(() => {
          vest.skip([Fields.F1, Fields.F2]);

          vest.test(Fields.F1, 'F1 error', () => false);
          vest.test(Fields.F2, 'F2 error', () => false);
          vest.test(Fields.F3, 'F3 error', () => false);
        });
        expect(result.hasErrors(Fields.F1)).toBe(false);
        expect(result.hasErrors(Fields.F2)).toBe(false);
        expect(result.hasErrors(Fields.F3)).toBe(true);
        expect(result.testCount).toBe(1);
        expect(result.errorCount).toBe(1);
        expect(result.tests.F1.errorCount).toBe(0);
        expect(result.tests.F2.errorCount).toBe(0);
        expect(result.tests.F3.errorCount).toBe(1);
      });
    });

    describe('Multiple Skip Calls', () => {
      it('Should skip fields under `skip`', () => {
        const result = testSuite(() => {
          vest.skip(Fields.F1);
          vest.skip(Fields.F2);

          vest.test(Fields.F1, 'F1 error', () => false);
          vest.test(Fields.F2, 'F2 error', () => false);
          vest.test(Fields.F3, 'F3 error', () => false);
        });
        expect(result.hasErrors(Fields.F1)).toBe(false);
        expect(result.hasErrors(Fields.F2)).toBe(false);
        expect(result.hasErrors(Fields.F3)).toBe(true);
        expect(result.testCount).toBe(1);
        expect(result.errorCount).toBe(1);
        expect(result.tests.F1.errorCount).toBe(0);
        expect(result.tests.F2.errorCount).toBe(0);
        expect(result.tests.F3.errorCount).toBe(1);
      });
    });
  });
});
