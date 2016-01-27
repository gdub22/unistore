import babel from 'rollup-plugin-babel'

export default {
  entry: 'index.js',
  dest: 'dist/unistore.js',
  format: 'umd',
  moduleName: 'Unistore',
  plugins: [ 
    babel({
      presets: ['es2015-rollup'],
      plugins: [
        ['transform-es2015-classes', { loose: true }]
      ]
    })
  ]
}
