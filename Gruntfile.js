module.exports = function(grunt) {

	var pkg = grunt.file.readJSON('package.json');
	var gruntHelper = require('betajs-compile');
	var dist = 'betajs-browser';
	
	gruntHelper.init(pkg, grunt)
	
	
    /* Compilation */   
	.scopedclosurerevisionTask(null, "src/**/*.js", "dist/" + dist + "-noscoped.js", {
		"module": "global:BetaJS.Browser",
		"base": "global:BetaJS"
    }, {
    	"base:version": pkg.devDependencies.betajs
    })	
    .concatTask('concat-scoped', [require.resolve("betajs-scoped"), 'dist/' + dist + '-noscoped.js'], 'dist/' + dist + '.js')
    .uglifyTask('uglify-noscoped', 'dist/' + dist + '-noscoped.js', 'dist/' + dist + '-noscoped.min.js')
    .uglifyTask('uglify-scoped', 'dist/' + dist + '.js', 'dist/' + dist + '.min.js')

    /* Testing */
    .browserqunitTask(null, "tests/tests.html")
    .browserqunitTask("ajax-browserstack", "tests/ajax/browserstack.html")
    .qunitTask(null, './dist/' + dist + '-noscoped.js',
    		         grunt.file.expand(["./tests/fragments/test-jsdom.js", "./tests/common/*.js"]),
    		         ['./tests/fragments/init-jsdom.js', require.resolve("betajs-scoped"), require.resolve("betajs")])
    .closureTask(null, [require.resolve("betajs-scoped"), require.resolve("betajs"), "./dist/betajs-browser-noscoped.js"], null, { })
    .browserstackTask(null, 'tests/tests.html', {desktop: true, mobile: true})
    .lintTask(null, ['./src/**/*.js', './dist/' + dist + '-noscoped.js', './dist/' + dist + '.js', './Gruntfile.js', './tests/**/*.js'])
    
    /* External Configurations */
    .codeclimateTask()
    .travisTask(null, "4.0")
    .packageTask()
    
    /* Markdown Files */
	.readmeTask()
    .licenseTask()
    
    /* Documentation */
    .docsTask();
    
	
	gruntHelper.config.shell.ajaxqunit = {
		command: [
		    'open http://' + gruntHelper.myip() + ':5000/static/tests/ajax/index.html?cors=' + gruntHelper.myhostname() + ":5001",
		    'open http://' + gruntHelper.myhostname() + ":5001/static/tests/ajax/dummy.html",
		    'node ' + require.resolve("mock-ajax-server") + ' --staticserve .'
		].join("&&")
	};
	
	gruntHelper.config.shell.filesqunit = {
		command: [
		    'open http://' + gruntHelper.myip() + ':5000/static/tests/files/index.html',
		    'node ' + require.resolve("mock-file-server") + ' --staticserve .'
		].join("&&")
	};

	gruntHelper.config.shell['files-browserstack'] = {
		command: [
		    './node_modules/.bin/wdio tests/files/selenium-config.js '
		].join("&&")
	};

	gruntHelper.config.shell['files-selenium-local'] = {
			command: [
			    './node_modules/.bin/wdio tests/files/selenium-local.js '
			].join("&&")
		};

	grunt.initConfig(gruntHelper.config);
	
	grunt.registerTask("ajaxqunit", ["shell:ajaxqunit"]);
	grunt.registerTask("filesqunit", ["shell:filesqunit"]);
	grunt.registerTask('files-browserstack', ['shell:files-browserstack']);

	grunt.registerTask('default', ['package', 'readme', 'license', 'codeclimate', 'travis', 'scopedclosurerevision', 'concat-scoped', 'uglify-noscoped', 'uglify-scoped']);
	grunt.registerTask('check-node', [ 'lint', 'qunit' ]);
	grunt.registerTask('check', ['check-node', 'browserqunit']);

};