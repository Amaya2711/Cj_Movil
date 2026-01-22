// metro.config.js
module.exports = {
  resolver: {
    /* resolver options */
  },
  transformer: {
    minifierPath: 'metro-minify-terser',
    minifierConfig: {
      compress: false,
      mangle: false,
    },
  },
};
