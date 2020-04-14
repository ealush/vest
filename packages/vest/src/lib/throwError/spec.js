const faker = require("faker");
const throwError = require(".");

describe("throwError", () => {
  let _setTimeout, errorString;

  beforeEach(() => {
    errorString = faker.lorem.sentence();
    _setTimeout = global.setTimeout;
    global.setTimeout = jest.fn((cb) => cb());
  });

  afterEach(() => {
    global.setTimeout = _setTimeout;
  });

  it("Should throw a timed out error", () => {
    expect(setTimeout).toHaveBeenCalledTimes(0);
    expect(() => throwError(errorString)).toThrow();
    expect(setTimeout).toHaveBeenCalledTimes(1);
  });
});
