import * as vest from 'vest';

enum GroupNames {
  G1 = 'g1',
  G2 = 'g2',
}

enum FieldNames {
  F1 = 'f1',
  F2 = 'f2',
  F3 = 'f3',
  F4 = 'f4',
}

describe('group', () => {
  it('should run group callback', () => {
    const groupName = 'groupName';
    const callback = jest.fn();
    vest.create(() => {
      vest.group(groupName, callback);
    })();
    expect(callback).toHaveBeenCalled();
  });

  it('Should run the tests within the group', () => {
    const cb1 = jest.fn(() => false);
    const cb2 = jest.fn(() => false);
    const cb3 = jest.fn(() => {});
    const suite = vest.create(() => {
      vest.mode(vest.Modes.ALL);
      vest.test(FieldNames.F1, () => false);

      vest.group(GroupNames.G1, () => {
        vest.test(FieldNames.F1, cb1);
        vest.test(FieldNames.F2, cb2);
        vest.test(FieldNames.F3, cb3);
      });
    });

    const res = suite();
    expect(res.hasErrors(FieldNames.F1)).toBe(true);
    expect(res.hasErrors(FieldNames.F2)).toBe(true);
    expect(res.hasErrors(FieldNames.F3)).toBe(false);
    expect(res.hasErrorsByGroup(GroupNames.G1)).toBe(true);
    expect(res.hasErrorsByGroup(GroupNames.G1, FieldNames.F1)).toBe(true);
    expect(res.hasErrorsByGroup(GroupNames.G1, FieldNames.F2)).toBe(true);
    expect(res.hasErrorsByGroup(GroupNames.G1, FieldNames.F3)).toBe(false);
    expect(cb1).toHaveBeenCalled();
    expect(cb2).toHaveBeenCalled();
    expect(cb3).toHaveBeenCalled();
    expect(res.isValid()).toBe(false);
    expect(res.isValidByGroup(GroupNames.G1)).toBe(false);
    expect(res.isValidByGroup(GroupNames.G1, FieldNames.F1)).toBe(false);
    expect(res.isValidByGroup(GroupNames.G1, FieldNames.F2)).toBe(false);
    expect(res.isValidByGroup(GroupNames.G1, FieldNames.F3)).toBe(true);
    expect(res.tests[FieldNames.F1].testCount).toBe(2);
    expect(res.tests[FieldNames.F2].testCount).toBe(1);
    expect(res.tests[FieldNames.F3].testCount).toBe(1);
    expect(res.tests[FieldNames.F1].errorCount).toBe(2);
    expect(res.tests[FieldNames.F2].errorCount).toBe(1);
    expect(res.tests[FieldNames.F3].errorCount).toBe(0);
    expect(res.groups[GroupNames.G1][FieldNames.F1].errorCount).toBe(1);
    expect(res.groups[GroupNames.G1][FieldNames.F1].testCount).toBe(1);
    expect(res.groups[GroupNames.G1][FieldNames.F2].errorCount).toBe(1);
    expect(res.groups[GroupNames.G1][FieldNames.F2].testCount).toBe(1);
    expect(res.groups[GroupNames.G1][FieldNames.F3].errorCount).toBe(0);
    expect(res.groups[GroupNames.G1][FieldNames.F3].testCount).toBe(1);
    expect(suite.get()).toMatchSnapshot();
  });

  describe('Multiple groups', () => {
    it('Should run the tests within the groups', () => {
      const cb1 = jest.fn(() => false);
      const cb2 = jest.fn(() => false);
      const cb3 = jest.fn(() => {});
      const suite = vest.create(() => {
        vest.mode(vest.Modes.ALL);
        vest.test(FieldNames.F1, () => false);

        vest.group(GroupNames.G1, () => {
          vest.test(FieldNames.F1, cb1);
          vest.test(FieldNames.F2, cb2);
          vest.test(FieldNames.F3, cb3);
        });

        vest.group(GroupNames.G2, () => {
          vest.test(FieldNames.F1, cb1);
          vest.test(FieldNames.F2, cb2);
          vest.test(FieldNames.F3, cb3);
        });
      });

      const res = suite();
      expect(res.hasErrors(FieldNames.F1)).toBe(true);
      expect(res.hasErrors(FieldNames.F2)).toBe(true);
      expect(res.hasErrors(FieldNames.F3)).toBe(false);
      expect(res.hasErrorsByGroup(GroupNames.G1)).toBe(true);
      expect(res.hasErrorsByGroup(GroupNames.G1, FieldNames.F1)).toBe(true);
      expect(res.hasErrorsByGroup(GroupNames.G1, FieldNames.F2)).toBe(true);
      expect(res.hasErrorsByGroup(GroupNames.G1, FieldNames.F3)).toBe(false);
      expect(res.hasErrorsByGroup(GroupNames.G2)).toBe(true);
      expect(res.hasErrorsByGroup(GroupNames.G2, FieldNames.F1)).toBe(true);
      expect(res.hasErrorsByGroup(GroupNames.G2, FieldNames.F2)).toBe(true);
      expect(res.hasErrorsByGroup(GroupNames.G2, FieldNames.F3)).toBe(false);
      expect(cb1).toHaveBeenCalledTimes(2);
      expect(cb2).toHaveBeenCalledTimes(2);
      expect(cb3).toHaveBeenCalledTimes(2);
      expect(res.isValid()).toBe(false);
      expect(res.isValidByGroup(GroupNames.G1)).toBe(false);
      expect(res.isValidByGroup(GroupNames.G1, FieldNames.F1)).toBe(false);
      expect(res.isValidByGroup(GroupNames.G1, FieldNames.F2)).toBe(false);
      expect(res.isValidByGroup(GroupNames.G1, FieldNames.F3)).toBe(true);
      expect(res.isValidByGroup(GroupNames.G2)).toBe(false);

      expect(res.isValidByGroup(GroupNames.G2, FieldNames.F1)).toBe(false);
      expect(res.isValidByGroup(GroupNames.G2, FieldNames.F2)).toBe(false);
      expect(res.isValidByGroup(GroupNames.G2, FieldNames.F3)).toBe(true);
      expect(res.tests[FieldNames.F1].testCount).toBe(3);
      expect(res.tests[FieldNames.F2].testCount).toBe(2);
      expect(res.tests[FieldNames.F3].testCount).toBe(2);
      expect(res.tests[FieldNames.F1].errorCount).toBe(3);
      expect(res.tests[FieldNames.F2].errorCount).toBe(2);
      expect(res.tests[FieldNames.F3].errorCount).toBe(0);
      expect(res.groups[GroupNames.G1][FieldNames.F1].errorCount).toBe(1);
      expect(res.groups[GroupNames.G1][FieldNames.F1].testCount).toBe(1);
      expect(res.groups[GroupNames.G1][FieldNames.F2].errorCount).toBe(1);
      expect(res.groups[GroupNames.G1][FieldNames.F2].testCount).toBe(1);
      expect(res.groups[GroupNames.G1][FieldNames.F3].errorCount).toBe(0);
      expect(res.groups[GroupNames.G1][FieldNames.F3].testCount).toBe(1);
      expect(res.groups[GroupNames.G2][FieldNames.F1].errorCount).toBe(1);
      expect(res.groups[GroupNames.G2][FieldNames.F1].testCount).toBe(1);
      expect(res.groups[GroupNames.G2][FieldNames.F2].errorCount).toBe(1);
      expect(res.groups[GroupNames.G2][FieldNames.F2].testCount).toBe(1);
      expect(res.groups[GroupNames.G2][FieldNames.F3].errorCount).toBe(0);
      expect(res.groups[GroupNames.G2][FieldNames.F3].testCount).toBe(1);
      expect(suite.get()).toMatchSnapshot();
    });
  });
});
