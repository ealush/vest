import * as vest from 'vest';

describe('state refill', () => {
  it('Should refill test state according to the execution order', () => {
    const suiteStates = [];
    const suite = vest.create(() => {
      const currentRun = [suite.get()];
      expect(suite.get().hasErrors('field1')).toBe(false);
      vest.test('field1', () => false);
      expect(suite.get().tests.field1.errorCount).toBe(1);
      currentRun.push(suite.get());
      vest.test('field1', () => false);
      expect(suite.get().tests.field1.errorCount).toBe(2);
      currentRun.push(suite.get());
      expect(suite.get().hasErrors('field2')).toBe(false);
      vest.test('field2', () => false);
      currentRun.push(suite.get());
      vest.test('field2', () => true);
      expect(suite.get().tests.field2.errorCount).toBe(1);
      currentRun.push(suite.get());
      expect(suite.get().hasErrors('field3')).toBe(false);
      vest.test('field3', () => undefined);
      expect(suite.get().hasErrors('field3')).toBe(false);
      expect(suite.get().tests.field3.errorCount).toBe(0);
      currentRun.push(suite.get());
      expect(suite.get().hasWarnings('field4')).toBe(false);
      vest.test('field4', () => {
        vest.warn();
        return false;
      });
      expect(suite.get().hasWarnings('field4')).toBe(true);
      currentRun.push(suite.get());
      suiteStates.push(currentRun);
    });

    expect(suite()).isDeepCopyOf(suite());
    suiteStates[0].forEach((suiteState, i) => {
      expect(suiteState).isDeepCopyOf(suiteStates[1][i]);
    });
  });
});
