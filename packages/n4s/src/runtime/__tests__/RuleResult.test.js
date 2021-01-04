import RuleResult from 'RuleResult';

describe('RuleResult', () => {
  describe('RuleResult constructor', () => {
    describe('When value is boolean', () => {
      it('Should instantiate with a matching `failed` value', () => {
        expect(new RuleResult(false).failed).toBe(true);
        expect(new RuleResult(true).failed).toBe(false);
        expect(new RuleResult(false).pass).toBe(false);
        expect(new RuleResult(true).pass).toBe(true);
      });
    });

    describe('When value is a RuleResult instance', () => {
      it('Should instantiate a new RuleResult instance with extended properties', () => {
        const prev = new RuleResult(false);
        prev.setChild('exampleChild', new RuleResult(true));

        const next = new RuleResult(prev);
        expect(next.failed).toBe(true);
        expect(next.children.exampleChild).toBe(prev.children.exampleChild);
        expect(next).not.toBe(prev);
        expect(next).toEqual(prev);
      });
    });
  });

  describe('RuleResult.is', () => {
    it('Should return true when value is a RuleResult instance', () => {
      expect(RuleResult.is(new RuleResult(true))).toBe(true);
      expect(RuleResult.is(new RuleResult(false))).toBe(true);
    });

    it('Should return false when value is not a RuleResult instance', () => {
      expect(RuleResult.is(true)).toBe(false);
      expect(RuleResult.is('Hello!')).toBe(false);
    });
  });

  describe('RuleResult.asArray', () => {
    it('Should mark with isArray: true', () => {
      expect(new RuleResult(true).isArray).toBeFalsy();
      const rr = new RuleResult(true).asArray();
      expect(rr.isArray).toBe(true);
    });
  });

  describe('RuleResult.setAttribute', () => {
    it('should set provided key/value pair', () => {
      const RR = new RuleResult(true);
      expect(RR.example).toBeUndefined();
      RR.setAttribute('example', 'YES!');
      expect(RR.example).toBe('YES!');
    });
  });

  describe('RuleResult.setChild', () => {
    it('Should create a children property if one does not exist', () => {
      const RR = new RuleResult(true);
      expect(RR.children).toBeUndefined();
      RR.setChild('example', new RuleResult(true));
      expect(RR.children).toBeDefined();
    });

    it('Should set the RuleResult as failed if the child is failed', () => {
      const RR = new RuleResult(true);
      expect(RR.pass).toBe(true);
      RR.setChild('example', new RuleResult(new RuleResult(false)));
      expect(RR.pass).toBe(false);
    });

    it('Should set the provided key with the provided child object', () => {
      const RR = new RuleResult(true);
      const child = new RuleResult(true);
      RR.setChild('example', child);
      expect(RR.children.example).toBe(child);
    });
  });

  describe('RuleResult.getChild', () => {
    it('Should return child if exists', () => {
      const RR = new RuleResult(true);
      const child = new RuleResult(true);
      RR.setChild('child', child);
      expect(RR.getChild('child')).toBe(child);
    });

    it('Should return undefined when RuleResult has no children', () => {
      const RR = new RuleResult(true);
      expect(RR.getChild('child')).toBeUndefined();
    });
  });

  describe('RuleResult.pass', () => {
    it('Should negate "failed" property', () => {
      const RR = new RuleResult(true);
      expect(RR.failed).toBe(false);
      expect(RR.pass).toBe(true);
      RR.setFailed(true);
      expect(RR.failed).toBe(true);
      expect(RR.pass).toBe(false);
    });
  });

  describe('RuleResult.extend', () => {
    it('Should use most severe failed state', () => {
      let left = new RuleResult(true);
      let right = new RuleResult(false);
      left.extend(right);
      expect(left.failed).toBe(true);
      left = new RuleResult(false);
      right = new RuleResult(true);
      left.extend(right);
      expect(left.failed).toBe(true);
    });

    it('Should match failed state even when a few layers deep', () => {
      const left = new RuleResult(true);
      left.setChild(
        'l1',
        new RuleResult(true).setChild('l2', new RuleResult(true))
      );
      const right = new RuleResult(true);
      right.setChild(
        'l1',
        new RuleResult(true).setChild('l2', new RuleResult(false))
      );
      expect(left.pass).toBe(true);
      expect(right.pass).toBe(false);
      left.extend(right);
      expect(left.pass).toBe(false);
    });
    it('Should use most severe failed value', () => {
      let left = new RuleResult(true);
      let right = new RuleResult(true);

      left.setChild('example', new RuleResult(true));
      right.setChild('example', new RuleResult(false));

      left.extend(right);
      expect(left.getChild('example').failed).toBe(true);
      left = new RuleResult(true);
      right = new RuleResult(true);
      right.setChild('example', new RuleResult(true));
      left.setChild('example', new RuleResult(false));
      left.extend(right);
      expect(left.getChild('example').failed).toBe(true);
      expect(left).toMatchSnapshot();
    });

    it('Should merge children keys', () => {
      const left = new RuleResult(true);
      const right = new RuleResult(true);
      left.setChild('a', new RuleResult(true));
      right.setChild('b', new RuleResult(true));
      right.setChild('c', new RuleResult(true));
      left.extend(right);
      expect(left.children.b).toBe(right.children.b);
      expect(left.children.c).toBe(right.children.c);

      expect(left).toMatchSnapshot();
    });

    it('Should deep merge children keys', () => {
      const l = new RuleResult(true);
      const l_a = new RuleResult(true);
      const l_a_1 = new RuleResult(true);
      const l_a_1_x = new RuleResult(true);
      l_a_1.setChild('x', l_a_1_x);
      l_a.setChild('1', l_a_1);
      l.setChild('a', l_a);

      const r = new RuleResult(true);
      const r_a = new RuleResult(true);
      const r_a_1 = new RuleResult(true);
      const r_a_1_x = new RuleResult(false);
      r_a_1.setChild('x', r_a_1_x);
      r_a.setChild('1', r_a_1);
      r.setChild('a', r_a);

      expect(l.pass).toBe(true);
      l.extend(r);
      expect(l.pass).toBe(false);

      expect(l).toMatchSnapshot();
    });
  });
});
