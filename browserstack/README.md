## Instruction

### Dependencies and requirement
- Java version `$ java -version` minimum 1.7 require for Mac.
- Require `betajs-media-components` to run server. After cloning and installing in any location in computer `node server.js` from *betajs-media-components* folder

### Run test
After installing packages, run one of the tests `grunt firefox-record`, there are also available 
*chrome-record, chrome-upload, firefox-upload* but because require some changes in media-components, 
especially adding ID selectors for good testing purposes.

At the end you can view report:
 1) Directly in console, 
 2) Browserstack in url `https://www.browserstack.com/automate/builds`
 3) also can generate local report with allure with command `grunt local-report`, it will open new browser window.
  