const NODE_ENV = JSON.stringify('development');

import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import css from 'rollup-plugin-css-only';
import copy from 'rollup-plugin-copy';

export default {
  input: 'src/client.entry.js',
  output: {
    file: 'dist/public/bundle.js',
    format: 'iife'
  },
  plugins: [
    replace({
      'process.env.NODE_ENV': NODE_ENV
    }),
    resolve(),
    babel({
      //https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers
      babelHelpers: 'bundled',
      presets: ['@babel/preset-react'],
      exclude: 'node_modules/**'
    }),
    commonjs(),
    terser(),
    css({
      output: 'styles.css', // Output file name and path for the bundled CSS
      minimize: true // Minify the CSS
    }),
    copy({
      targets: [{ src: 'resources/*', dest: 'dist/public' }]
    })
  ]
};
