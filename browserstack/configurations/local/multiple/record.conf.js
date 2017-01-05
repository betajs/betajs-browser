/**
 * Created by rashad on 12/7/16.
 */
var browserstack = require('browserstack-local');
var credentials = require('../../constants').browserstack;

exports.config = {
  user: credentials.user || 'BROWSERSTACK_USERNAME',
  key: credentials.key || 'BROWSERSTACK_ACCESS_KEY',

  services: ['firefox-profile'],
  firefoxProfile: {
    'media.navigator.permission.disabled': true,
    'media.navigator.streams.fake': true
  },

  updateJob: false,
  specs: [
    './browserstack/tests/specs/common/record.js'
  ],
  //exclude: [],

  commonCapabilities: {
    'build': 'webdriver-browserstack-record',
    // 'resolution' : '1024x768',
    // 'os_version' : '7',
    // 'os' : 'Windows',
    'browserstack.local': credentials.local_test,
    'acceptSslCerts' : credentials.acceptSslCerts,
    'browserstack.debug' : credentials.debug,
    'browserstack.video' : credentials.videoRecord // Record video in browserstack
  },

  capabilities: [
    // WIN 7
    // {
    //   'name': 'firefox_record_win7',
    //   'browserName': 'firefox',
    //   'resolution' : '1024x768',
    //   'os_version' : '7',
    //   'os' : 'Windows',
    //   'plugin.state.flash': 0
    // },
    {
      'name': 'chrome_record_win7',
      'browserName': 'chrome',
      'resolution' : '1024x768',
      'os_version' : '7',
      'os' : 'Windows',
      'chromeOptions' : {
        'args' : ["--use-fake-ui-for-media-stream",
          'use-fake-device-for-media-stream',
          'use-fake-ui-for-media-stream'
          // --disable-user-media-security, --use-fake-ui-for-media-stream
          // --disable-web-security, --reduce-security-for-testing
        ]
      }
    }
    //,
    // // WIN 10
    // {
    //   'name': 'firefox_record_win10',
    //   'browserName': 'firefox',
    //   'resolution' : '1024x768',
    //   'os_version' : '10',
    //   'os' : 'Windows',
    //   'plugin.state.flash': 0
    // },
    // {
    //   'name': 'chrome_record_win10',
    //   'browserName': 'chrome',
    //   'resolution' : '1024x768',
    //   'os_version' : '10',
    //   'os' : 'Windows',
    //   'chromeOptions' : {
    //     'args' : ["--use-fake-ui-for-media-stream",
    //       'use-fake-device-for-media-stream',
    //       'use-fake-ui-for-media-stream'
    //     ]
    //   }
    // },
    // // Mac Sierra
    // {
    //   'name': 'firefox_record_mac_sierra',
    //   'browserName': 'firefox',
    //   'resolution' : '1024x768',
    //   'os_version' : 'Sierra',
    //   'os' : 'OS X',
    //   'plugin.state.flash': 0
    // }
    // {
    //   'name': 'chrome_record_mac_sierra',
    //   'browserName': 'chrome',
    //   'resolution' : '1024x768',
    //   'os_version' : 'Sierra',
    //   'os' : 'OS X',
    //   'chromeOptions' : {
    //     'args' : ["--use-fake-ui-for-media-stream",
    //       'use-fake-device-for-media-stream',
    //       'use-fake-ui-for-media-stream'
    //     ]
    //   }
    // }
  //  {
  //   'name': 'ie11_record_win7',
  //   'version': '11',
  //   'browserName': 'internet explorer',
  //   'resolution' : '1024x768',
  //   'os_version' : '7',
  //   'os' : 'Windows'
  // },
  //   {
  //   'name': 'ie_8_record_win7',
  //   'browserName': 'internet explorer',
  //   'version': '8',
  //   'os' : 'Windows',
  //   'os_version' : '7',
  //   'resolution' : '1024x768'
  // }
  // , {
  //   'name': 'opera_record_win7',
  //   'browserName': 'opera',
  //   'os' : 'Windows',
  //   'os_version' : '7',
  //   'resolution' : '1024x768'
  // }, {
  //   'name': 'safari_record_win7',
  //   'browserName': 'safari',
  //   'os' : 'Windows',
  //   'os_version' : '7',
  //   'resolution' : '1024x768'
  // },
    // {
    //   'name': 'ie_10_record_win7',
    //   'browserName': 'internet explorer',
    //   'version': '10',
    //   'os' : 'Windows',
    //   'os_version' : '7',
    //   'resolution' : '1024x768'
    // },
    // {
    //   'name': 'ie_10_record_win10',
    //   'browserName': 'safari',
    //   'os' : 'Windows',
    //   'os_version' : '10',
    //   'resolution' : '1024x768'
    // },
    // {
    //   'name': 'ie_9_record_win7',
    //   'browserName': 'internet explorer',
    //   'version': '9',
    //   'os' : 'Windows',
    //   'os_version' : '7',
    //   'resolution' : '1024x768'
    // },
    // {
    //   'name': 'firefox_32_record_win7',
    //   'browserName': 'firefox',
    //   'version': '32',
    //   'os' : 'Windows',
    //   'os_version' : '7',
    //   'resolution' : '1024x768'
    // },
    // {
    //   'name': 'chrome_record_mac_sierra',
    //   'browserName': 'chrome',
    //   'os' : 'OS X', // MAC
    //   'os_version': 'Sierra',
    //   'resolution' : '1024x768'
    // },
    // {
    //   'name': 'firefox_record_mac_el_capitan',
    //   'browserName': 'firefox',
    //   'os' : 'OS X', // MAC
    //   'os_version': 'El Capitan',
    //   'resolution' : '1024x768'
    // }
    //
    // {
    //   'name': 'chrome_31_record_win7',
    //   'browserName': 'chrome',
    //   'version': '31',
    //   'os' : 'Windows',
    //   'os_version' : '7',
    //   'resolution' : '1024x768'
    // },
    // {
    //   'name': 'opera_record_mac',
    //   'browserName': 'opera',
    //   'os' : 'OS X', // MAC
    //   'os_version': 'Sierra',
    //   'resolution' : '1024x768'
    // },

    // Facing with not selection issue

    // {
    //   'name': 'edge_13_record_win10',
    //   'browserName': 'edge',
    //   'version': 13,
    //   'os' : 'Windows',
    //   'os_version' : '10',
    //   'resolution' : '1024x768'
    // }

    // {
    //   'name': 'edge_14_record_win10',
    //   'browserName': 'edge',
    //   'os' : 'Windows',
    //   'version': '14',
    //   'os_version' : '10',
    //   'resolution' : '1024x768'
    // },
    // {
    //   'name': 'safari_record_mac_sierra',
    //   'browserName': 'safari',
    //   'os' : 'OS X', // MAC
    //   'os_version': 'Sierra',
    //   'resolution' : '1024x768'
    // },
    // {
    //   'name': 'safari_record_mac_el_capitan',
    //   'browserName': 'safari',
    //   'os' : 'OS X', // MAC
    //   'os_version': 'El Capitan',
    //   'resolution' : '1024x768'
    // },
    // {
    //   'name': 'opera_old_23_record_mac',
    //   'browserName': 'opera',
    //   'version': '23',
    //   'os' : 'Windows',
    //   'os_version': 'Sierra',
    //   'resolution' : '1024x768'
    // },
    // {
    //   'name': 'safari_record_mac_yosemite',
    //   'browserName': 'safari',
    //   'os' : 'OS X',
    //   'os_version': 'Yosemite',
    //   'resolution' : '1024x768'
    // },

    // {
    //   'name': 'safari_record_mac_mavericks',
    //   'browserName': 'safari',
    //   'os' : 'OS X',
    //   'os_version': 'Mavericks',
    //   'resolution' : '1024x768'
    // },

    // Mobile Devices
    // {
    //   'name': 'android_record_android',
    //   'browserName': 'Android',
    //   'os' : 'android'
    // },

    // {
    //   'name': 'iPhone_record_ios',
    //   'browserName': 'iPhone',
    //   'os' : 'ios'
    // },
    //
    // {
    //   'name': 'iPad_14_record_ios',
    //   'browserName': 'iPad',
    //   'os' : 'ios'
    // }

  ],

  // Level of logging verbosity: silent | verbose | command | data | result | error
  logLevel: 'silent',

  maxInstances: 1, // It's pointing how many spec files will run for several capabilites

  coloredLogs: true,
  screenshotPath: './browserstack/errorShots/common/',
  baseUrl: credentials.record.base_url,
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
    colors: true,
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

  //Code to start browserstack local before start of test
  onPrepare: function (config, capabilities) {
    console.log("Connecting local recording test");
    return new Promise(function(resolve, reject){
      exports.bs_local = new browserstack.Local();
      exports.bs_local.start({'key': exports.config.key }, function(error) {
        if (error) return reject(error);
        console.log('Connected. Now testing record video...');

        resolve();
      });
    });
  },

  // Code to stop browserstack local after end of test
  onComplete: function (capabilties, specs) {
    exports.bs_local.stop(function() {});
  }
};

// Code to support common capabilities
exports.config.capabilities.forEach(function(caps){
  for(var i in exports.config.commonCapabilities) caps[i] = caps[i] || exports.config.commonCapabilities[i];
});
