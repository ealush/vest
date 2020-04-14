import path from "path";
import compiler from "@ampproject/rollup-plugin-closure-compiler";
import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import replace from "rollup-plugin-replace";
import { terser } from "rollup-plugin-terser";

const { BABEL_CONFIG_PATH } = require("..");

const { PACKAGE_NAME_VEST } = require("../../scripts/constants");
const { packagePath, packageJson } = require("../../util");

const LIBRARY_NAME = PACKAGE_NAME_VEST;
const PACKAGE_PATH = path.resolve(packagePath(LIBRARY_NAME));

const DEFAULT_FORMAT = "umd";

const { version } = packageJson(PACKAGE_NAME_VEST);

const PLUGINS = [
  resolve(),
  commonjs({
    include: /node_modules\/(anyone|n4s)/,
  }),
  babel({
    babelrc: false,
    ...require(BABEL_CONFIG_PATH)(),
  }),
  replace({
    VEST_VERSION: JSON.stringify(version),
  }),
  compiler(),
];

const buildConfig = ({ format = DEFAULT_FORMAT, min = false } = {}) => ({
  input: path.join(PACKAGE_PATH, "src/index.js"),
  output: {
    file: [
      path.join(PACKAGE_PATH, "dist", LIBRARY_NAME),
      min && "min",
      format !== DEFAULT_FORMAT && format,
      "js",
    ]
      .filter(Boolean)
      .join("."),
    name: LIBRARY_NAME,
    format,
  },
  plugins: min ? [...PLUGINS, terser()] : PLUGINS,
});

export default [buildConfig({ min: true }), buildConfig()];
