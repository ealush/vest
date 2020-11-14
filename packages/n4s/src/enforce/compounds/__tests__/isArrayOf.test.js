import isArrayOf from 'isArrayOf';
import enforce from 'enforce'

describe('Tests isArrayOf rule', () => {

  it('Should return true if all elements are ture for one or more rules', () => {
    expect(isArrayOf([3,4,5,'six',7],
    enforce.greaterThan(2), 
    enforce.isString())
    ).toBe(true);
  });


  it('Should return false if one element or more fails all rules', () => {
    expect(isArrayOf([3,4,5,['s','i','x'],7], 
    enforce.greaterThan(2), 
    enforce.isString())
    ).toBe(false);
  });


  describe('Tests for recursive call', ()=>{

    it('Should return true if all elements are ture for one or more rules', () => {
      expect(isArrayOf([3,4,5,['s','i','x'],7],
      enforce.greaterThan(2), 
      enforce.isArrayOf(enforce.isString()))
      ).toBe(true);
    });
  
    it('Should return false if one element or more fails all rules', () => {
      expect(
        isArrayOf([3,4,5,['s','i','x'],7],
        enforce.greaterThan(2),
        enforce.isArrayOf(enforce.isNumber()))
        ).toBe(false);
    });
  });

  describe('as part of enforce', () => {
   
    it('should return silently when valid', () => {
      enforce([1,2,'3']).isArrayOf(enforce.isNumber(), enforce.isString());
      enforce([1,2,'3']).isArrayOf(enforce.isNumeric(), enforce.lessThan(5).greaterThan(0));
    });
  
    it('should throw an exception when invalid', () => {
      expect(() => enforce([1,2,'3']).isArrayOf(enforce.isNull())).toThrow()
      expect(() => enforce([1,2,'3']).isArrayOf(enforce.isNumber(), enforce.greaterThan(5))).toThrow()
    });

  });

});
