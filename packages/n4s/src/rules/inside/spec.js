import { inside } from '.';

describe('Inside rule', () => {
  it('Should correctly find a string inside an array', () => {
    expect(inside("I'm", ["I'm", 'gonna', 'pop', 'some', 'tags'])).toBe(true);
    expect(inside('Eric', ['Eric', 'Kenny', 'Kyle', 'Stan'])).toBe(true);
    expect(inside('myString', [1, [55], 'myString'])).toBe(true);
  });

  it('Should fail to find a string inside an array in which it does not exist', () => {
    expect(inside('going to', ["I'm", 'gonna', 'pop', 'some', 'tags'])).toBe(
      false
    );
  });

  it('Should correctly find a number inside an array', () => {
    expect(inside(1, [1, 2, 3])).toBe(true);
    expect(inside(42, [43, 44, 45, 46, 42])).toBe(true);
    expect(inside(0, [1, [55], 0])).toBe(true);
  });

  it('Should fail to find a number inside an array in which it does not exist', () => {
    expect(inside(55, [1, 2, 3])).toBe(false);
  });

  it('Should correctly find a boolean inside an array', () => {
    expect(inside(true, [true, false, true, false])).toBe(true);
    expect(inside(false, ['true', false])).toBe(true);
  });

  it('Should fail to find a boolean inside an array in which it does not exist', () => {
    expect(inside(true, ['true', false])).toBe(false);
    expect(inside(false, [true, 'one', 'two'])).toBe(false);
  });

  it('Should fail to find array elemets in another array in which they do not exist', () => {
    expect(inside(['no', 'treble'], ['all', 'about', 'the', 'bass'])).toBe(
      false
    );
  });

  it('Should fail to find object keys in an array in which they do not exist', () => {
    expect(inside(['one', 'two'], ['three', 'four'])).toBe(false);
  });

  it('Should correctly find a string inside another string', () => {
    expect(inside('pop', "I'm gonna pop some tags")).toBe(true);
    expect(inside('Kenny', 'You Killed Kenny!')).toBe(true);
  });

  it('Should failt to find a string inside another string in which it does not exist', () => {
    expect(inside('mugs', "I'm gonna pop some tags")).toBe(false);
  });
});
