var webdrive = require('selenium-webdriver');

var FirefoxProfile = require('firefox-profile');
var myProfile = new FirefoxProfile();
// Below credentials are Browserstack username and API key valuse
var credentials = require('../../configurations/constants').browserstack;


myProfile.setPreference('plugin.state.flash', 0);
// IN firefox avoid selection of streams:
// media.navigator.permission.disabled:true
myProfile.setPreference('media.navigator.permission.disabled', true);
myProfile.setPreference('media.navigator.streams.fake', true);

// List of options:
// http://kb.mozillazine.org/About:config_entries
myProfile.updatePreferences();

myProfile.encode( function(encodedProfile) {

  var capabilities = {
    'project': 'beta-js-open-page-with-ie8',
    'build': credentials.version,
    'acceptSslCerts' : credentials.acceptSslCerts,
    'browserstack.debug' : credentials.debug,
    'browserstack.video' : credentials.videoRecord, // Record video in browserstack
    'browserstack.user': credentials.user,
    'browserstack.key': credentials.key,
    'browserName' : 'firefox'
  };

  var driver = new webdrive.Builder()
    .usingServer('http://hub-cloud.browserstack.com/wd/hub')
    .withCapabilities(capabilities)
    .build();


  driver.get('');
  driver.findElement(webdrive.By.id('file-input'))
    .then( function(element) {
      element.sendKeys(test_file_path);
    });

  driver.quit();
});

