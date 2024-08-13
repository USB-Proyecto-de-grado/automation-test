const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: 'tf6ew4',
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      return require('./cypress/plugins/index.js')(on, config);
    },
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
    screenshotsFolder: 'reports/ui/screenshots',
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'reports/ui',
      overwrite: false,
      html: true,
      json: true,
      reportFilename: '[status]_[datetime]-[name]-report',
    },
  },
});
