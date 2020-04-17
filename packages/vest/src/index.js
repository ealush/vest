import any from "anyone/any";
import enforce from "n4s/dist/enforce.min";
import { VERSION } from "./constants";
import test from "./core/test";
import validate from "./core/validate";
import { draft, only, skip, warn } from "./hooks";
import { singleton, runWithContext } from "./lib";

export default singleton.register({
  Enforce: enforce.Enforce,
  VERSION,
  any,
  draft,
  enforce,
  only,
  runWithContext,
  skip,
  test,
  validate,
  warn,
});
