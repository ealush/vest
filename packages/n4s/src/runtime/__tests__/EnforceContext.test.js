import EnforceContext from 'EnforceContext';

describe('EnforceContext', () => {
  describe('constructor', () => {
    it('Should add all "content" properties to instance', () => {
      expect(
        new EnforceContext({
          value: 'some_value',
          obj: { example: true },
          key: 'example',
        })
      ).toEqual({
        key: 'example',
        obj: { example: true },
        value: 'some_value',
      });
    });
  });

  describe('EnforceContext.setFailFast', () => {
    it('Should set failFast property', () => {
      expect(new EnforceContext({}).setFailFast(true).failFast).toBe(true);
      expect(new EnforceContext({}).setFailFast(false).failFast).toBe(false);
    });
  });

  describe('EnforceContext.unwrap', () => {
    it('Should extract "value" property from an EnforceContext instance', () => {
      expect(
        EnforceContext.unwrap(
          new EnforceContext({ value: 'some_example_value' })
        )
      ).toBe('some_example_value');
    });

    it('Should return value as is if not an EnforceContext instance', () => {
      expect(EnforceContext.unwrap('some_example_value')).toBe(
        'some_example_value'
      );
    });
  });

  describe('EnforceContext.wrap', () => {
    it('Should return the same value if already an instance', () => {
      const EC = new EnforceContext({ value: 123 });
      expect(EnforceContext.wrap(EC)).toBe(EC);
    });

    describe('When passed value is not an EnforceContext instance', () => {
      it('Should create a new EnforceContext instance', () => {
        const EC = EnforceContext.wrap('...');
        expect(EC).toBeInstanceOf(EnforceContext);
      });
      it('Should set passed argument as the new "value" property', () => {
        const EC = EnforceContext.wrap('...');
        expect(EC.value).toBe('...');
      });
    });
  });

  describe('EnforceContext.is', () => {
    it('should return true when value is an EnforceContext instance', () => {
      expect(EnforceContext.is(new EnforceContext({}))).toBe(true);
    });

    it('should return false when value is an EnforceContext instance', () => {
      expect(EnforceContext.is({})).toBe(false);
    });
  });
});
