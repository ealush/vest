import seq from 'seq';

describe('lib:seq', () => {
  it('Should return a new id on each run', () => {
    Array.from({ length: 100 }, () => seq()).reduce((existing, seq) => {
      expect(existing).not.toHaveProperty(seq.toString());
      Object.assign(existing, { [seq]: true });
      expect(existing).toHaveProperty(seq.toString());
      return existing;
    }, {});
  });
});
