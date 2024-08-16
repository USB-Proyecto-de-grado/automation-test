const { defineConfig } = require('cypress');

module.exports = defineConfig({
  projectId: 'tf6ew4',
  e2e: {
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      return require('./cypress/plugins/index.js')(on, config);
    },
    video: true,  // Asegúrate de que esta opción esté habilitada
    videoUploadOnPasses: false,
    videosFolder: 'reports/ui/videos',
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
