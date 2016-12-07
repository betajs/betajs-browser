var browserstack = require('browserstack-local');
var credentials = require('./../../constants').browserstack;

exports.config = {
  user: credentials.user || 'BROWSERSTACK_USERNAME',
  key: credentials.key || 'BROWSERSTACK_ACCESS_KEY',

  updateJob: false,
  specs: [
    './browserstack/tests/specs/chrome/record.js'
  ],
  exclude: [
    './browserstack/tests/specs/chrome/upload.js'
  ],

  capabilities: [{
    'build': 'record-via-ie8',
    'name': 'ie8_record_win7',
    'browser': 'chrome',
    'os' : 'Windows',
    'os_version' : '7',
    'resolution' : '1024x768',
    'browserstack.local': true,
    'acceptSslCerts' : credentials.acceptSslCerts,
    'browserstack.debug' : credentials.debug,
    'browserstack.video' : credentials.videoRecord // Record video in browserstack
  }],

  logLevel: 'verbose',
  coloredLogs: true,
  screenshotPath: './browserstack/errorShots/',
  baseUrl: credentials.bas_url,
  waitforTimeout: 30000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  framework: 'mocha',
  mochaOpts: {
    ui: 'tdd',
    timeout: 10000 * 60 * 2  // 2 MINUTES
  },

  reporters: ['dot', 'spec', 'allure'],
  reporterOptions: {
    outputDir: './browserstack/reports'
  },

  // Code to start browserstack local before start of test
  onPrepare: function (config, capabilities) {
    console.log("Connecting local");
    return new Promise(function(resolve, reject){
      exports.bs_local = new browserstack.Local();
      exports.bs_local.start({'key': exports.config.key }, function(error) {
        if (error) return reject(error);
        console.log('Connected. Now testing...');

        resolve();
      });
    });
  },

  // Code to stop browserstack local after end of test
  onComplete: function (capabilties, specs) {
    exports.bs_local.stop(function() {});
  }
};
