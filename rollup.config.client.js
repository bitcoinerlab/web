import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import { string } from 'rollup-plugin-string';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import css from 'rollup-plugin-css-only';
import copy from 'rollup-plugin-copy';
import nodePolyfills from 'rollup-plugin-polyfill-node';

const isProduction = process.env.NODE_ENV === 'production';
export default {
  input: 'src/client.entry.js',
  output: {
    file: 'dist/public/bundle.js',
    format: 'iife',
    inlineDynamicImports: true
  },
  plugins: [
    string({
      // Required for the markup files
      include: /\.md$/i
    }),
    replace({
      preventAssignment: true,
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    resolve({ browser: true }),
    babel({
      //https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers
      babelHelpers: 'bundled',
      presets: ['@babel/preset-react'],
      exclude: 'node_modules/**'
    }),
    json(),
    commonjs(),
    nodePolyfills({ process: true }), //Used in the syntax highlighter while parsing the README.md
    isProduction && terser(),
    css({
      output: 'styles.css', // Output file name and path for the bundled CSS
      minimize: isProduction // Minify the CSS
    }),
    copy({
      targets: [
        { src: 'resources/*', dest: 'dist/public' },
        { src: 'node_modules/esbuild-wasm/esbuild.wasm', dest: 'dist/public' }
      ]
    })
  ]
};
