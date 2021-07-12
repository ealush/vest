import rules from 'rules';

describe('Tests enforce rules API', () => {
  it('Should expose all enforce rules', () => {
    Object.keys(rules()).forEach(rule => {
      expect(rules()[rule]).toBeInstanceOf(Function);
    });
  });
});
