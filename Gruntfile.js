module.exports = function(grunt) {

	var pkg = grunt.file.readJSON('package.json');
	var gruntHelper = require('betajs-compile/grunt.js');
	var dist = 'betajs-browser';
	
	gruntHelper.init(pkg, grunt)
	
	
    /* Compilation */   
	.scopedclosurerevisionTask(null, "src/**/*.js", "dist/" + dist + "-noscoped.js", {
		"module": "global:BetaJS.Browser",
		"base": "global:BetaJS"
    }, {
    	"base:version": 531
    })	
    .concatTask('concat-scoped', ['vendors/scoped.js', 'dist/' + dist + '-noscoped.js'], 'dist/' + dist + '.js')
    .uglifyTask('uglify-noscoped', 'dist/' + dist + '-noscoped.js', 'dist/' + dist + '-noscoped.min.js')
    .uglifyTask('uglify-scoped', 'dist/' + dist + '.js', 'dist/' + dist + '.min.js')

    /* Testing */
    .browserqunitTask(null, "tests/tests.html")
    .browserqunitTask("ajax-browserstack", "tests/ajax/browserstack.html")
    .browserqunitTask("files-browserstack", "tests/files/browserstack.html")
    .qunitTask(null, './dist/' + dist + '-noscoped.js',
    		         grunt.file.expand(["./tests/fragments/test-jsdom.js", "./tests/common/*.js"]),
    		         ['./tests/fragments/init-jsdom.js', './vendors/scoped.js', './vendors/beta-noscoped.js'])
    .closureTask(null, ["./vendors/scoped.js", "./vendors/beta-noscoped.js", "./dist/betajs-browser-noscoped.js"], null, { })
    .browserstackTask(null, 'tests/tests.html', {desktop: true, mobile: true})
    .lintTask(null, ['./src/**/*.js', './dist/' + dist + '-noscoped.js', './dist/' + dist + '.js', './Gruntfile.js', './tests/**/*.js'])
    
    /* External Configurations */
    .codeclimateTask()
    .travisTask(null, "4.0")
    .packageTask()
    
    /* Dependencies */
    .dependenciesTask(null, { github: ['betajs/betajs-scoped/dist/scoped.js', 'betajs/betajs/dist/beta-noscoped.js', 'betajs/betajs-shims/dist/betajs-shims.js'] })

    /* Markdown Files */
	.readmeTask()
    .licenseTask()
    
    /* Documentation */
    .docsTask();
    
	
	gruntHelper.config.shell.ajaxqunit = {
		command: [
		    'open http://' + gruntHelper.myip() + ':5000/static/tests/ajax/index.html?cors=' + gruntHelper.myhostname() + ":5001",
		    'open http://' + gruntHelper.myhostname() + ":5001/static/tests/ajax/dummy.html",
		    'node node_modules/mock-ajax-server/server.js --staticserve .'
		].join("&&")
	};
	
	gruntHelper.config.shell.filesqunit = {
		command: [
		    'open http://' + gruntHelper.myip() + ':5000/static/tests/files/index.html',
		    'node node_modules/mock-file-server/server.js --staticserve .'
		].join("&&")
	};

	gruntHelper.config.shell.chromeRecord = {
		command: [
      './node_modules/.bin/wdio browserstack/configurations/local/chrome/record.conf.js'
		].join("&&")
	};

  gruntHelper.config.shell.chromeUpload = {
    command: [
      './node_modules/.bin/wdio browserstack/configurations/local/chrome/upload.conf.js'
    ].join("&&")
  };

  gruntHelper.config.shell.firefoxRecord = {
    command: [
      './node_modules/.bin/wdio browserstack/configurations/local/firefox/record.conf.js',
    ].join("&&")
  };

  gruntHelper.config.shell.firefoxUpload = {
    command: [
      './node_modules/.bin/wdio browserstack/configurations/local/firefox/upload.conf.js'
    ].join("&&")
  };

  gruntHelper.config.shell.testReport = {
    command: [
      './node_modules/.bin/allure generate ./browserstack/reports/',
			'./node_modules/.bin/allure report open'
    ].join("&&")
  };

	grunt.initConfig(gruntHelper.config);
	
	grunt.registerTask("ajaxqunit", ["shell:ajaxqunit"]);
	grunt.registerTask("filesqunit", ["shell:filesqunit"]);

	// Chrome related reports
  grunt.registerTask("chrome-record", ["shell:chromeRecord"]);
  grunt.registerTask("chrome-upload", ["shell:chromeUpload"]);

  // Firefox related scripts
  grunt.registerTask("firefox-record", ["shell:firefoxRecord"]);
  grunt.registerTask("firefox-upload", ["shell:firefoxUpload"]);

	// Generate report an open UI in new window
  grunt.registerTask("test-report", ["shell:testReport"]);

	grunt.registerTask('default', ['package', 'readme', 'license', 'codeclimate', 'travis', 'scopedclosurerevision', 'concat-scoped', 'uglify-noscoped', 'uglify-scoped']);
	grunt.registerTask('check-node', [ 'lint', 'qunit' ]);
	grunt.registerTask('check', ['check-node', 'browserqunit']);

};
