import faker from "faker";
import { singleton } from "../../lib";
import Context from ".";

describe("Context", () => {
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

  it("Should assign all parent properties onto ctx instance", () => {
    Object.keys(parent).forEach((key) => {
      expect(instance[key]).toBe(parent[key]);
    });
  });

  it("Should store instance on singleton", () => {
    expect(singleton.useContext()).toBe(instance);
  });

  describe("Context.clear", () => {
    it("Should nullify stored instance", () => {
      expect(singleton.useContext()).toBe(instance);
      Context.clear();
      expect(singleton.useContext()).toBe(null);
    });
  });

  describe("Nested context", () => {
    let parent1, parent2;

    beforeEach(() => {
      parent1 = {
        prop1: "parent_1_prop_1_value",
        prop2: "parent_1_prop_2_value",
      };

      parent2 = {
        prop1: "parent_2_prop_1_value",
        prop3: "parent_2_prop_3_value",
      };

      new Context(parent1);
      new Context(parent2);
    });

    it("Should assign new parent onto existing parent", () => {
      expect(singleton.useContext()).toMatchObject({
        prop1: "parent_2_prop_1_value",
        prop2: "parent_1_prop_2_value",
        prop3: "parent_2_prop_3_value",
      });
    });
  });
});
