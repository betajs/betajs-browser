module.exports = {
  browserstack : {
    "version": "v1",
    "user": "",
    "key": "",
    "bas_url": "http://localhost:6001",
    "related_url": "/static/space.html",
    "local_test": true,
    "report_source_folder": "./browserstack/reports",
    "host" : 'http://hub-cloud.browserstack.com',
    "port": 80,
    "path": '/wd/hub',
    "acceptSslCerts" : true,
    "debug": true,
    "videoRecord": true,
    "upload" : {
      "bas_url": "http://192.168.0.101:5000",
      "related_url": "/static/tests/files/index.html"
    },
    "ie" : {
      "noFlash" : true,  // Disable Flash in IE
      "enablePopups" : true
    }
  }
};
