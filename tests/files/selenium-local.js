exports.config = {
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

  commonCapabilities: {
  },

  capabilities: require(__dirname + "/selenium-browsers-local.js")

};

// Code to support common capabilities
exports.config.capabilities.forEach(function(caps){
  for (var i in exports.config.commonCapabilities)
	  caps[i] = caps[i] || exports.config.commonCapabilities[i];
});
