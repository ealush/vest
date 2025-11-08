import { text } from 'text';
import { describe, it, expect } from 'vitest';

describe('text', () => {
  describe('named substitutions (object)', () => {
    describe('When all substitutions exist', () => {
      it('Should replace delimited placeholders', () => {
        expect(text('this {t} an example', { t: 'was' })).toBe(
          'this was an example',
        );
        expect(text('this {t1} {t2} example', { t1: 'was', t2: 'one' })).toBe(
          'this was one example',
        );
      });
    });

    describe('When a placeholder repeats', () => {
      it('Should use the same substitution multiple times', () => {
        expect(text('{n} {n} {n}', { n: 1 })).toBe('1 1 1');
      });
    });

    describe('When a substitution is missing', () => {
      it('Should keep the placeholder', () => {
        expect(text('{no}', { yes: 'yes' })).toBe('{no}');
      });
    });
  });

  describe('Positional substitutions', () => {
    it('should use substitutions one by one', () => {
      expect(text('{n} {n} {x} {y}', 1, 2, 3, 4)).toBe('1 2 3 4');
    });

    describe('When there are not enough substitutions', () => {
      it('Should default to the placeholder', () => {
        expect(text('{n} {n} {x} {y}', 1, 2)).toBe('1 2 {x} {y}');
      });
    });
  });
});
