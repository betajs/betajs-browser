var browserstack_local = require('browserstack-local');

exports.config = {
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_KEY,
  baseUrl: "http://localhost:5000",

  // Level of logging verbosity: silent | verbose | command | data | result | error
  logLevel: 'error',
  // It's pointing how many spec files will run for several capabilites
  maxInstances: 1, 

  coloredLogs: true,
  waitforTimeout: 30000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,

  sync: true,

  updateJob: false,
  
  specs: [
    './tests/files/selenium-specs.js'
  ],

  reporters: ['dot', 'spec', 'allure'],

  framework: 'mocha',
  
  mochaOpts: {
    ui: 'bdd',
    timeout: 10000 * 60 * 2  // 2 MINUTES
  },

  //Code to start browserstack local before start of test
  onPrepare: function (config, capabilities) {
    console.log("Connecting local uploading test");
    return new Promise(function(resolve, reject){
      exports.bs_local = new browserstack_local.Local();
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
  },
  
  commonCapabilities: {
    'browserstack.local': true,
    'acceptSslCerts' : true,
    'browserstack.debug' : true,
    'browserstack.video' : true
  },

  capabilities: require(__dirname + "/selenium-browsers.js")

};

// Code to support common capabilities
exports.config.capabilities.forEach(function(caps){
  for (var i in exports.config.commonCapabilities)
	  caps[i] = caps[i] || exports.config.commonCapabilities[i];
});
