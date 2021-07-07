import id from 'genId';

describe('lib:id', () => {
  it('Should return a new id on each run', () => {
    Array.from({ length: 100 }, () => id()).reduce((existing, id) => {
      expect(existing).not.toHaveProperty(id.toString());
      Object.assign(existing, { [id]: true });
      expect(existing).toHaveProperty(id.toString());
      return existing;
    }, {});
  });
});
