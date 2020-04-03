import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';

import compiler from '@ampproject/rollup-plugin-closure-compiler';

const { version } = require('../package.json');

const DEFAULT_FORMAT = 'umd';
const LIBRARY_NAME = 'vest';

const PLUGINS = [
    resolve(),
    commonjs({
        include: /node_modules\/(anyone|n4s)/
    }),
    replace({
        VEST_VERSION: JSON.stringify(version),
    }),
    compiler(),
];

const buildConfig = ({ format = DEFAULT_FORMAT, min = false } = {}) => ({
    input: 'src/index.js',
    output: {
        file: [
            `dist/${LIBRARY_NAME}`,
            min && 'min',
            format !== DEFAULT_FORMAT && format,
            'js'
        ].filter(Boolean).join('.'),
        name: LIBRARY_NAME,
        format
    },
    plugins: min
        ? [ ...PLUGINS, terser() ]
        : PLUGINS

});

export default [
    buildConfig({ min: true }),
    buildConfig()
];
