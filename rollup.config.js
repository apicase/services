import cjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'

export default {
  input: './index.js',
  output: {
    file: './index.cjs.js',
    format: 'cjs'
  },
  plugins: [babel(), cjs(), resolve()],
  external: ['nanoutils/cjs/omit', '@apicase/core']
}
