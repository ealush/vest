import faker from 'faker';
import singleton from '../../lib/singleton';
import Context from '.';

const resetContext = () => {
  do {
    Context.clear();
  } while (singleton.useContext());
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

  it('Should store instance on singleton', () => {
    expect(singleton.useContext()).toBe(instance);
  });

  describe('Context.clear', () => {
    describe('When no nested context', () => {
      it('Should nullify stored instance', () => {
        expect(singleton.useContext()).toBe(instance);
        Context.clear();
        expect(singleton.useContext()).toBeNull();
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
          expect(singleton.useContext()).toBe(instance);
          const parent = instance.parentContext;

          Context.clear();

          if (parent) {
            counter++;
            expect(singleton.useContext()).toBe(parent);
          } else {
            expect(singleton.useContext()).toBeNull();
          }
        });

        // sanity
        expect(counter).toBe(9);
      });
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
        expect(singleton.useContext()?.suiteId).toBeUndefined();
        new Context({ suiteId });
        expect(singleton.useContext().suiteId).toBe(suiteId);
      });
    });

    describe('When suite id is higher in the parent tree', () => {
      it('Should get closest suiteId', () => {
        new Context({ suiteId: 'not_closest' });
        new Context({ suiteId });
        new Context({});
        new Context({});
        expect(singleton.useContext().suiteId).toBe(suiteId);
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
      expect(singleton.useContext().suiteId).toBe('sanity');
      expect(singleton.useContext().parentContext.childContext).toBe(
        singleton.useContext()
      );
    });

    it('Should remove child context from context instance', () => {
      const parent = singleton.useContext().parentContext;
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
      expect(singleton.useContext().parentContext).toBeUndefined();
      singleton.useContext().setParentContext(parent);
      expect(singleton.useContext().parentContext).toBe(parent);
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
      expect(singleton.useContext()).toBeNull();
      context = new Context(parent1);
      expect(singleton.useContext()).toBe(context);
      expect(context).toMatchObject(parent1);
      expect(singleton.useContext().childContext).toBeUndefined();
      expect(singleton.useContext().parentContext).toBeUndefined();
    });

    it('Should match snapshot', () => {
      new Context({ suiteId: 10 });
      new Context(parent1);
      new Context(parent2);
      new Context(parent2);
      expect(singleton.useContext()).toMatchSnapshot();
    });

    it('Should add recent context as child of previous context', () => {
      new Context(parent1);
      new Context(parent2);
      expect(singleton.useContext()).toMatchObject(parent2);
      expect(singleton.useContext().parentContext).toMatchObject(parent1);
      expect(singleton.useContext().parentContext.childContext).toMatchObject(
        parent2
      );
      expect(singleton.useContext().parentContext.childContext).toBe(
        singleton.useContext()
      );
    });
  });
});
