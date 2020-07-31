import faker from 'faker';
import Context from '.';

const resetContext = () => {
  do {
    Context.clear();
  } while (Context.use());
};

describe('Context', () => {
  let parent, instance;

  beforeEach(() => {
    parent = {
      [faker.random.word()]: faker.random.word(),
      [faker.random.word()]: faker.random.word(),
      [faker.random.word()]: faker.random.word(),
    };

    instance = new Context(parent);
  });

  afterEach(() => {
    Context.clear();
  });

  it('Should assign all parent properties onto ctx instance', () => {
    Object.keys(parent).forEach(key => {
      expect(instance[key]).toBe(parent[key]);
    });
  });

  it('Should store instance as context', () => {
    expect(Context.use()).toBe(instance);
  });

  describe('Context.clear', () => {
    describe('When no nested context', () => {
      it('Should nullify stored instance', () => {
        expect(Context.use()).toBe(instance);
        Context.clear();
        expect(Context.use()).toBeNull();
      });
    });

    describe('When nested context', () => {
      let contextInstances;
      beforeEach(() => {
        resetContext();
        contextInstances = Array.from({ length: 10 }, () => new Context());
      });

      it('Should set current context to context parent and nullify its context child', () => {
        // sanity
        expect(contextInstances).toHaveLength(10);
        let counter = 0;

        contextInstances.reverse().forEach(instance => {
          expect(Context.use()).toBe(instance);
          const parent = instance.parentContext;

          Context.clear();

          if (parent) {
            counter++;
            expect(Context.use()).toBe(parent);
          } else {
            expect(Context.use()).toBeNull();
          }
        });

        // sanity
        expect(counter).toBe(9);
      });
    });
  });

  describe('Context.use|Context.set', () => {
    it('Retrieves current context value', () => {
      const ctx = {};
      Context.set(ctx);
      expect(Context.use()).toBe(ctx);
    });
  });

  describe('getter: suiteId', () => {
    let suiteId;

    beforeEach(() => {
      Context.clear();
      suiteId = faker.random.uuid();
    });

    describe('When suiteId is present on current context', () => {
      it('Should return suiteId', () => {
        expect(Context.use()?.suiteId).toBeUndefined();
        new Context({ suiteId });
        expect(Context.use().suiteId).toBe(suiteId);
      });
    });

    describe('When suite id is higher in the parent tree', () => {
      it('Should get closest suiteId', () => {
        new Context({ suiteId: 'not_closest' });
        new Context({ suiteId });
        new Context({});
        new Context({});
        expect(Context.use().suiteId).toBe(suiteId);
      });
    });
  });

  describe('getter: groupName', () => {
    let groupName;

    beforeEach(() => {
      Context.clear();
      groupName = faker.random.uuid();
    });

    describe('When groupName is present on current context', () => {
      it('Should return groupName', () => {
        expect(Context.use()?.groupName).toBeUndefined();
        new Context({ groupName });
        expect(Context.use().groupName).toBe(groupName);
      });
    });

    describe('When group name is higher in the parent tree', () => {
      it('Should get closest groupName', () => {
        new Context({ groupName: 'not_closest' });
        new Context({ groupName });
        new Context({});
        new Context({});
        expect(Context.use().groupName).toBe(groupName);
      });
    });
  });

  describe('setChildContext', () => {
    let context;
    beforeEach(() => {
      resetContext();
      context = new Context();
    });

    it('Should set childContext on current context instance', () => {
      const childContext = {};

      expect(context.childContext).toBeUndefined();
      context.setChildContext(childContext);
      expect(context.childContext).toBe(childContext);
    });

    it('Should set currentContext as childContext parent', () => {
      const childContext = {};

      expect(childContext.parentContext).toBeUndefined();
      context.setChildContext(childContext);
      expect(childContext.parentContext).toBe(context);
    });
  });

  describe('removeChildContext', () => {
    beforeEach(() => {
      resetContext();
      new Context({ suiteId: 'sanity' });
      new Context({});
    });

    test('sanity', () => {
      expect(Context.use().suiteId).toBe('sanity');
      expect(Context.use().parentContext.childContext).toBe(Context.use());
    });

    it('Should remove child context from context instance', () => {
      const parent = Context.use().parentContext;
      parent.removeChildContext();
      expect(parent.childContext).toBeNull();
    });
  });

  describe('setParentContext', () => {
    let parent;
    beforeEach(() => {
      parent = new Context({});
      resetContext();
      new Context({});
    });

    it('Should set parent context to context instance', () => {
      expect(Context.use().parentContext).toBeUndefined();
      Context.use().setParentContext(parent);
      expect(Context.use().parentContext).toBe(parent);
    });
  });

  describe('Nested context', () => {
    let context, parent1, parent2;

    beforeEach(() => {
      resetContext();
      parent1 = {
        prop1: 'parent_1_prop_1_value',
        prop2: 'parent_1_prop_2_value',
      };

      parent2 = {
        prop1: 'parent_2_prop_1_value',
        prop3: 'parent_2_prop_3_value',
      };
    });

    test('sanity', () => {
      expect(Context.use()).toBeNull();
      context = new Context(parent1);
      expect(Context.use()).toBe(context);
      expect(context).toMatchObject(parent1);
      expect(Context.use().childContext).toBeUndefined();
      expect(Context.use().parentContext).toBeUndefined();
    });

    it('Should match snapshot', () => {
      new Context({ suiteId: 10 });
      new Context(parent1);
      new Context(parent2);
      new Context(parent2);
      expect(Context.use()).toMatchSnapshot();
    });

    it('Should add recent context as child of previous context', () => {
      new Context(parent1);
      new Context(parent2);
      expect(Context.use()).toMatchObject(parent2);
      expect(Context.use().parentContext).toMatchObject(parent1);
      expect(Context.use().parentContext.childContext).toMatchObject(parent2);
      expect(Context.use().parentContext.childContext).toBe(Context.use());
    });
  });
});
