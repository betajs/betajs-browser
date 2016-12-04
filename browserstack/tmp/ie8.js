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
  //'browserstack.ie.noFlash' : credentials.ie.noFlash,
  //'browserstack.ie.enablePopups' : credentials.ie.enablePopups,
  'browserName' : 'IE',
  'browser_version' : '8.0',
  'os' : 'Windows',
  'os_version' : '7',
  'resolution' : '1024x768'
};

var driver = new webdrive.Builder()
  .usingServer('http://hub-cloud.browserstack.com/wd/hub')
  .withCapabilities(capabilities)
  .build();


driver.get('');
driver.findElement(webdrive.By.id('file-input'))
  .then( function(element) {
    element.sendKeys();
  });

driver.quit();
