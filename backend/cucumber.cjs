
module.exports = {
  default: {
    paths: ['../documentacion/aceptacion/*.feature'],
    require: ['tests/bdd/*.steps.js'],
    tags: '@bdd',
    format: ['progress'],
    forceExit: true,
  },
};
