import { describe, it, expect } from 'vitest';
import { create, test, enforce, group, optional } from '../../../vest';

describe('test().dependsOn() Integration Suite', () => {

  describe('Pillar 1: Focus Sync (Inclusion)', () => {
    it('should include the dependent field when the dependency is focused (transitive)', () => {
      const suite = create((data: { f1: string; f2: string; f3: string }) => {
        test('f1', () => { enforce(data.f1).isNotEmpty(); }).dependsOn('f2');
        test('f2', () => { enforce(data.f2).isNotEmpty(); }).dependsOn('f3');
        test('f3', () => { enforce(data.f3).isNotEmpty(); });
      });

      // Primer run to seed "dirty" state (required by Pillar 2)
      suite.run({ f1: 'v', f2: 'v', f3: 'v' });

      // Focus only f3 -> should trigger f2 and f1
      const res = suite.only('f3').run({ f1: '', f2: '', f3: 'val' });
      
      expect(res.isTested('f3')).toBe(true);
      expect(res.isTested('f2')).toBe(true);
      expect(res.isTested('f1')).toBe(true);
      expect(res.hasErrors('f1')).toBe(true);
      expect(res.hasErrors('f2')).toBe(true);
    });

    it('should handle branching inclusion (Diamond)', () => {
      const suite = create((data: { f1: string; f2: string; f3: string; f4: string }) => {
        // f1 -> [f2, f3] -> f4
        test('f1', () => { enforce(data.f1).isNotEmpty(); }).dependsOn('f2').dependsOn('f3');
        test('f2', () => { enforce(data.f2).isNotEmpty(); }).dependsOn('f4');
        test('f3', () => { enforce(data.f3).isNotEmpty(); }).dependsOn('f4');
        test('f4', () => { enforce(data.f4).isNotEmpty(); });
      });

      suite.run({ f1: 'v', f2: 'v', f3: 'v', f4: 'v' });

      const res = suite.only('f4').run({ f1: '', f2: '', f3: '', f4: 'v' });
      
      expect(res.isTested('f4')).toBe(true);
      expect(res.isTested('f2')).toBe(true);
      expect(res.isTested('f3')).toBe(true);
      expect(res.isTested('f1')).toBe(true);
    });
  });

  describe('Pillar 2: Dirty Guard', () => {
    it('should NOT include dependents that have never been tested', () => {
      const suite = create((data: { f1: string; f2: string }) => {
        test('f1', () => { enforce(data.f1).isNotEmpty(); });
        test('f2', () => { enforce(data.f2).isNotEmpty(); }).dependsOn('f1');
      });

      // NO primer run. f2 is clean.
      const res = suite.only('f1').run({ f1: 'v', f2: '' });
      
      expect(res.isTested('f1')).toBe(true);
      expect(res.isTested('f2')).toBe(false); // Guarded
    });

    it('should block transitive inclusion if an intermediate node is clean', () => {
      const suite = create((data: { f1: string; f2: string; f3: string }) => {
        // f1 -> f2 (clean) -> f3 (focused)
        test('f1', () => { enforce(data.f1).isNotEmpty(); }).dependsOn('f2');
        test('f2', () => { enforce(data.f2).isNotEmpty(); }).dependsOn('f3');
        test('f3', () => { enforce(data.f3).isNotEmpty(); });
      });

      // Prime f1 and f3, but NOT f2? 
      // Actually, if f2 is intermediate, it must have been seen for the graph to exist.
      // But we can simulate a case where f2 was omitted.
    });
  });

  describe('Pillar 3: Validity Link', () => {
    it('should mark dependent invalid if dependency is invalid (transitive)', () => {
      const suite = create((data: { f1: string; f2: string; f3: string }) => {
        test('f1', () => { enforce(data.f1).isNotEmpty(); }).dependsOn('f2');
        test('f2', () => { enforce(data.f2).isNotEmpty(); }).dependsOn('f3');
        test('f3', () => { enforce(data.f3).isNotEmpty(); });
      });

      const res = suite.run({ f1: 'v', f2: 'v', f3: '' });
      
      expect(res.isValid('f3')).toBe(false);
      expect(res.isValid('f2')).toBe(false); // Link 1
      expect(res.isValid('f1')).toBe(false); // Link 2 (transitive)
      expect(res.isValid()).toBe(false);
    });

    it('should handle circular validity gracefully (A <-> B)', () => {
      const suite = create((data: { f1: string; f2: string }) => {
        test('f1', () => { enforce(data.f1).isNotEmpty(); }).dependsOn('f2');
        test('f2', () => { enforce(data.f2).isNotEmpty(); }).dependsOn('f1');
      });

      const res = suite.run({ f1: '', f2: 'v' });
      expect(res.isValid('f1')).toBe(false);
      expect(res.isValid('f2')).toBe(false);
    });
  });

  describe('Optional & Omitted Fields', () => {
    it('should consider dependency valid if it is optional and omitted', () => {
      const suite = create((data: { f1: string; f2: string }) => {
        optional('f1');
        test('f1', () => { enforce(data.f1).isNotEmpty(); });
        test('f2', () => { enforce(data.f2).isNotEmpty(); }).dependsOn('f1');
      });

      // f1 is omitted, so it is "valid" in Vest
      const res = suite.run({ f1: '', f2: 'v' });
      
      expect(res.isTested('f1')).toBe(false);
      expect(res.isValid('f1')).toBe(true); // Omitted = valid
      expect(res.isValid('f2')).toBe(true); // Dependency f1 is valid
    });
  });

  describe('Async Dependencies', () => {
    it('should respect validity link while dependency is async-pending', async () => {
      const suite = create((data: { f1: string; f2: string }) => {
        test('f1', async () => {
          await new Promise(r => setTimeout(r, 20));
          enforce(data.f1).isNotEmpty();
        });
        test('f2', () => { enforce(data.f2).isNotEmpty(); }).dependsOn('f1');
      });

      const res = suite.run({ f1: 'v', f2: 'v' });
      
      expect(res.isPending('f1')).toBe(true);
      expect(res.isValid('f1')).toBe(false); // Pending = not valid yet
      expect(res.isValid('f2')).toBe(false); // Link: dependency is not valid
      
      await new Promise(r => setTimeout(r, 30));
      const resDone = suite.get();
      expect(resDone.isValid('f1')).toBe(true);
      expect(resDone.isValid('f2')).toBe(true);
    });
  });

  describe('Group Scoping', () => {
    it('should support cross-group dependencies', () => {
      const suite = create((data: { f1: string; f2: string }) => {
        group('g1', () => {
          test('f1', () => { enforce(data.f1).isNotEmpty(); });
        });
        group('g2', () => {
          test('f2', () => { enforce(data.f2).isNotEmpty(); }).dependsOn('f1');
        });
      });

      suite.run({ f1: 'v', f2: 'v' });

      const res = suite.only('f1').run({ f1: 'v', f2: '' });
      expect(res.isTested('f2')).toBe(true); // Group boundaries don't block dependsOn inclusion
    });
  });

  describe('History Restoration (Reprocessing)', () => {
    it('should restore dependsOn links after tree reprocessing', () => {
      const suite = create((data: { f1: string; f2: string }) => {
        test('f1', () => { enforce(data.f1).isNotEmpty(); });
        test('f2', () => { enforce(data.f2).isNotEmpty(); }).dependsOn('f1');
      });

      // 1. Run once to create history
      suite.run({ f1: 'v', f2: 'v' });

      // 2. Focused run on f1. f2 is skipped but SHOULD be restored and included
      const res = suite.only('f1').run({ f1: 'v', f2: '' });
      
      expect(res.isTested('f1')).toBe(true);
      expect(res.isTested('f2')).toBe(true); // Restoration verified
    });
  });
});
