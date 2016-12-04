var webdrive = require('selenium-webdriver');
// Below credentials are Browserstack username and API key valuse
var credentials = require('../configurations/constants').browserstack;

var capabilities = {
  'project': 'beta-js-open-page-with-ie8',
  'build': credentials.version,
  'acceptSslCerts' : credentials.acceptSslCerts,
  'browserstack.debug' : credentials.debug,
  'browserstack.video' : credentials.videoRecord, // Record video in browserstack
  'browserstack.user': credentials.user,
  'browserstack.key': credentials.key,
  'browserName' : 'chrome',
  'chromeOptions' : {
    'args' : ["--use-fake-ui-for-media-stream"]
    // arguments also available, can find here:
    // http://peter.sh/experiments/chromium-command-line-switches/
    // --use-fake-device-for-media-stream
  }
};

var driver = new webdrive.Builder()
  .usingServer('http://hub-cloud.browserstack.com/wd/hub')
  .withCapabilities(capabilities)
  .build();

// Context of recording video from camera
describe('record video with Chrome', function() {
  // Will press button record video
  it('click on "Record Your Video"', function() {

  });
});

driver.get('');
driver.findElement(webdrive.By.id('file-input'))
  .then( function(element) {
    element.sendKeys();
  });

driver.quit();
