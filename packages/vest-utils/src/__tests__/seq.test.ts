import seq, { genSeq } from 'seq';

describe('lib:seq', () => {
  it('Should return a new id on each run', () => {
    Array.from({ length: 100 }, () => seq()).reduce((existing, seq) => {
      expect(existing).not.toHaveProperty(seq.toString());
      Object.assign(existing, { [seq]: true });
      expect(existing).toHaveProperty(seq.toString());
      return existing;
    }, {});
  });

  describe('genSeq', () => {
    it('Creates a namespaced sequence', () => {
      const seq = genSeq('test');
      expect(seq()).toBe('test_0');
      expect(seq()).toBe('test_1');
      expect(seq()).toBe('test_2');

      const seq2 = genSeq('test2');
      expect(seq2()).toBe('test2_0');
      expect(seq2()).toBe('test2_1');
      expect(seq2()).toBe('test2_2');

      expect(seq()).toBe('test_3');
    });
  });
});
