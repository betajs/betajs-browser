var credentials = require('constants').browserstack;

exports.config = {
  user: credentials.user || 'BROWSERSTACK_USERNAME',
  key: credentials.key || 'BROWSERSTACK_ACCESS_KEY',

  updateJob: false,
  specs: [
    './tests/specs/single_test.js'
  ],
  exclude: [],

  maxInstances: 10,
  commonCapabilities: {
    name: 'parallel_test',
    build: 'webdriver-browserstack'
  },

  capabilities: [{
    browser: 'chrome'
  },{
    browser: 'firefox'
  },{
    browser: 'internet explorer'
  },{
    browser: 'safari'
  }],

  logLevel: 'verbose',
  coloredLogs: true,
  screenshotPath: './errorShots/',
  baseUrl: '',
  waitforTimeout: 10000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd'
  }
};

// Code to support common capabilities
exports.config.capabilities.forEach(function(caps){
  for(var i in exports.config.commonCapabilities) caps[i] = caps[i] || exports.config.commonCapabilities[i];
});
