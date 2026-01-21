import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import { string } from 'rollup-plugin-string';

export default {
  input: 'src/server.entry.js',
  external: ['mermaid'],
  output: {
    file: 'dist/server.bundle.js',
    format: 'cjs',
    inlineDynamicImports: true
  },
  plugins: [
    string({
      // Required for the markup files
      include: /\.md$/i
    }),
    resolve({ preferBuiltins: true }),
    babel({
      //https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers
      babelHelpers: 'bundled',
      presets: ['@babel/preset-react', '@babel/preset-env'],
      exclude: 'node_modules/**'
    }),
    json(),
    commonjs()
  ]
};
