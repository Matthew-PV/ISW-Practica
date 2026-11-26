module.exports = {
    default: {
        paths: ['e2e/features/*.feature'],

        require: ['e2e/steps/*.steps.js'],

        tags: '@e2e',

        format: [
            'progress',
            ['html', 'reports/cucumber-e2e.html']
        ]
    }
};