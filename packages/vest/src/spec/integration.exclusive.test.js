import runSpec from '../../testUtils/runSpec';

runSpec(vest => {
  const validator = (exclusion = {}) =>
    vest.validate('suite_name', () => {
      vest.skip(exclusion.skip);
      vest.only(exclusion.only);

      vest.test('field_1', 'msg', Function.prototype);
      vest.test('field_2', 'msg', Function.prototype);
      vest.test('field_3', 'msg', Function.prototype);
      vest.test('field_4', 'msg', Function.prototype);
      vest.test('field_5', 'msg', Function.prototype);
    });

  describe('only', () => {
    it('Should only have `only`ed fields', () => {
      const res = validator({
        only: ['field_1', 'field_2'],
      });

      expect(res.tests).toHaveProperty('field_1');
      expect(res.tests).toHaveProperty('field_2');
      expect(res.tests).not.toHaveProperty('field_3');
      expect(res.tests).not.toHaveProperty('field_4');
      expect(res.tests).not.toHaveProperty('field_5');
    });
    it('Should only have `only`ed field', () => {
      const res = validator({
        only: 'field_1',
      });

      expect(res.tests).toHaveProperty('field_1');
      expect(res.tests).not.toHaveProperty('field_2');
      expect(res.tests).not.toHaveProperty('field_3');
      expect(res.tests).not.toHaveProperty('field_4');
      expect(res.tests).not.toHaveProperty('field_5');
    });
  });
  describe('skip', () => {
    it('Should have all but `skip`ped fields', () => {
      const res = validator({
        skip: ['field_1', 'field_2'],
      });

      expect(res.tests).not.toHaveProperty('field_1');
      expect(res.tests).not.toHaveProperty('field_2');
      expect(res.tests).toHaveProperty('field_3');
      expect(res.tests).toHaveProperty('field_4');
      expect(res.tests).toHaveProperty('field_5');
    });
    it('Should have all but `skip`ped field', () => {
      const res = validator({
        skip: 'field_1',
      });

      expect(res.tests).not.toHaveProperty('field_1');
      expect(res.tests).toHaveProperty('field_2');
      expect(res.tests).toHaveProperty('field_3');
      expect(res.tests).toHaveProperty('field_4');
      expect(res.tests).toHaveProperty('field_5');
    });
  });

  describe('Combined', () => {
    test('skip takes precedence over only', () => {
      const res = validator({ only: ['field_1', 'field_2'], skip: 'field_1' });

      expect(res.tests).not.toHaveProperty('field_1');
      expect(res.tests).toHaveProperty('field_2');
    });
  });
});
