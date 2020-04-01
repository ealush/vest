const { version } = require("../package.json");
const vest = require(".");

describe("Vest exports", () => {
  test("All vest exports exist", () => {
    expect(vest).toMatchSnapshot({
      VERSION: expect.any(String),
    });
    expect(vest.VERSION).toBe(version);
  });
});

describe("General scenario tests", () => {
  let v, test, validate, enforce;

  beforeAll(() => {
    ({ test, validate, enforce } = vest);
  });

  describe("Base case", () => {
    it("Should match snapshot", () => {
      v = validate("eveniet-maxime-ea", () => {
        test(
          "sed-minima-adipisci",
          "Aliquam reprehenderit iure omnis assumenda eligendi enim id praesentium numquam.",
          () => {
            enforce(1).equals(2);
          }
        );

        test("non-rem-dolorem", () => {
          enforce(1).inside([1, 2, 3]);
        });
      });
      expect(v).toMatchSnapshot();
    });
  });

  describe("Exclusion via `only`", () => {
    it("Should match snapshot", () => {
      v = validate("inventore-quis-impedit", () => {
        vest.only("doloribus-enim-quisquam");

        test(
          "doloribus-enim-quisquam",
          "Ea quia saepe modi corrupti possimus similique expedita inventore.",
          () => {
            enforce(1).notEquals(2);
          }
        );

        test("autem", () => null);
        test("soluta", () => null);
      });
      expect(v).toMatchSnapshot();
    });
  });

  describe("Exclusion via `skip`", () => {
    it("Should match snapshot", () => {
      v = validate("corrupti-alias-autem", () => {
        vest.skip("doloribus-enim-quisquam");

        test(
          "doloribus-enim-quisquam",
          "Ea quia saepe modi corrupti possimus similique expedita inventore.",
          () => {
            enforce(1).notEquals(2);
          }
        );

        test("autem", "Temporibus ex ex.", () => {
          vest.warn();
          return 1 === 2;
        });
      });
      expect(v).toMatchSnapshot();
    });
  });

  describe("Tests with warnings", () => {
    it("Should match snapshot", () => {
      v = validate("corrupti-alias-autem", () => {
        vest.skip("doloribus-enim-quisquam");

        test(
          "doloribus-enim-quisquam",
          "Ea quia saepe modi corrupti possimus similique expedita inventore.",
          () => {
            enforce(1).notEquals(2);
          }
        );

        test("autem", "Temporibus ex ex.", () => {
          vest.warn();
          return 1 === 2;
        });
        test("autem", () => {
          vest.warn();
          enforce(1).gt(0);
        });
      });
      expect(v).toMatchSnapshot();
    });
  });

  describe("Async tests", () => {
    it("Should match snapshot", (done) => {
      v = validate("molestias-veritatis-deserunt", () => {
        test(
          "doloribus-enim-quisquam",
          "Fuga odit ut quidem autem dolores ipsam.",
          () => Promise.resolve()
        );
        test(
          "doloribus-enim-quisquam",
          "Fuga odit ut quidem autem dolores ipsam.",
          () => Promise.reject()
        );
      });
      setTimeout(() => {
        expect(v).toMatchSnapshot();
        done();
      });
    });
  });
});
