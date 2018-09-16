module.exports = {
  parser: false,
  // parser: 'sugarss',
  plugins: {
    'postcss-import': {},
    'postcss-cssnext': {
      warnForDuplicates: false,
    },
    autoprefixer: {
      flexbox: 'no-2009',
    },
    'postcss-flexbugs-fixes': {},
    cssnano: {},
  },
}
