import { isArrayOf } from 'isArrayOf';
import enforse from 'enforce'

describe('Tests isArrayOf rule', () => {

  it('Should return true if all elements are ture for one or more rules', () => {
    expect(isArrayOf([3,4,5,'six',7],
     enforse.greaterThan(2), 
     enforse.isString())
     ).toBe(true);
  });


  it('Should return false if one element or more fails all rules', () => {
    expect(isArrayOf([3,4,5,['s','i','x'],7], 
    enforse.greaterThan(2), 
    enforse.isString())
    ).toBe(false);
  });


  describe('Tests for recursive call', ()=>{

    it('Should return true if all elements are ture for one or more rules', () => {
      expect(isArrayOf([3,4,5,['s','i','x'],7],
      enforse.greaterThan(2), 
      enforse.isArrayOf(enforse.isString()))
      ).toBe(true);
    });
  
    it('Should return false if one element or more fails all rules', () => {
      expect(
        isArrayOf([3,4,5,['s','i','x'],7],
        enforse.greaterThan(2),
        enforse.isArrayOf(enforse.isNumber()))
        ).toBe(false);
    });
  });

});
