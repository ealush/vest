import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';
import { DEFAULT_EXTENSIONS } from '@babel/core';

const { version } = require('../package.json');

const DEFAULT_FORMAT = 'umd';
const LIBRARY_NAME = 'vest';

const PLUGINS = [
    typescript(),
    resolve(),
    commonjs({
        include: /node_modules\/(anyone|n4s)/
    }),
    babel({
        extensions: [
            ...DEFAULT_EXTENSIONS, '.ts'
        ],
        babelrc: false,
        ...require('./babel.config')()
    }),
    replace({
        VEST_VERSION: JSON.stringify(version)
    })
];

const buildConfig = ({ format = DEFAULT_FORMAT, min = false } = {}) => ({
    input: 'src/index.ts',
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
