import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';

export default {
  input: 'src/server.entry.js',
  output: {
    file: 'dist/server.bundle.js',
    format: 'cjs'
  },
  plugins: [
    resolve(),
    json(),
    babel({
      //https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers
      babelHelpers: 'bundled',
      presets: ['@babel/preset-react'],
      exclude: 'node_modules/**'
    }),
    commonjs()
  ]
};
