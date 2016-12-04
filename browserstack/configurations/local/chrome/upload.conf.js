var browserstack = require('browserstack-local');
var credentials = require('../../constants').browserstack;

exports.config = {
  user: credentials.user || 'BROWSERSTACK_USERNAME',
  key: credentials.key || 'BROWSERSTACK_ACCESS_KEY',

  updateJob: false,
  specs: [
    './browserstack/tests/specs/chrome/upload.js'
  ],
  exclude: [
    './browserstack/tests/specs/chrome/record.js'
  ],

  capabilities: [{
    'build': 'webdriver-browserstack-upload',
    'name': 'chrome_upload_win7',
    'browserName': 'chrome',
    'os' : 'Windows',
    'os_version' : '7',
    'resolution' : '1024x768',
    'browserstack.local': credentials.local_test,
    'acceptSslCerts' : credentials.acceptSslCerts,
    'browserstack.debug' : credentials.debug,
    'browserstack.video' : credentials.videoRecord // Record video in browserstack
  }],

  // Level of logging verbosity: silent | verbose | command | data | result | error
  logLevel: 'verbose',

  coloredLogs: true,
  screenshotPath: './browserstack/errorShots/chrome',
  baseUrl: credentials.bas_url,
  waitforTimeout: 30000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  sync: true,

  reporters: ['dot', 'spec', 'allure'],
  reporterOptions: {
    outputDir: './browserstack/reports'
  },

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 10000 * 60 * 2  // 2 MINUTES
  },

  plugins: {
    webdrivercss: {
      screenshotRoot: './browserstack/cssShots',
      failedComparisonsRoot: 'diffs',
      misMatchTolerance: 0.05,
      screenWidth: [320,480,640,1024]
    }
  },

  // Code to start browserstack local before start of test
  onPrepare: function (config, capabilities) {
    console.log("Connecting local chrome uploading test");
    return new Promise(function(resolve, reject){
      exports.bs_local = new browserstack.Local();
      exports.bs_local.start({'key': exports.config.key }, function(error) {
        if (error) return reject(error);
        console.log('Connected. Now testing chrome-upload...');

        resolve();
      });
    });
  },

  // Code to stop browserstack local after end of test
  onComplete: function (capabilties, specs) {
    exports.bs_local.stop(function() {});
  }
};
