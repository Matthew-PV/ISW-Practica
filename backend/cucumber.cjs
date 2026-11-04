module.exports = {
  default: {
    paths: ['../documentacion/aceptacion/*.feature'],
    require: ['tests/bdd/*.steps.js'],
    tags: '@bdd',
    format: [
      'progress',
      ['html', 'reports/cucumber.html'],
    ],
    forceExit: true,
  },
};