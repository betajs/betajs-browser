module.exports = function(grunt) {

	var pkg = grunt.file.readJSON('package.json');
	var gruntHelper = require('betajs-compile/grunt.js');
	var dist = 'betajs-browser';
	
	gruntHelper.init(pkg, grunt)
	
	
    /* Compilation */   
	.scopedclosurerevisionTask(null, "src/**/*.js", "dist/" + dist + "-noscoped.js", {
		"module": "global:BetaJS.Browser",
		"base": "global:BetaJS",
		"resumablejs": "global:Resumable"
    }, {
    	"base:version": 531
    })	
    .concatTask('concat-scoped', ['vendors/scoped.js', 'dist/' + dist + '-noscoped.js'], 'dist/' + dist + '.js')
    .uglifyTask('uglify-noscoped', 'dist/' + dist + '-noscoped.js', 'dist/' + dist + '-noscoped.min.js')
    .uglifyTask('uglify-scoped', 'dist/' + dist + '.js', 'dist/' + dist + '.min.js')

    /* Testing */
    .browserqunitTask(null, "tests/tests.html")
    .qunitTask(null, './dist/' + dist + '-noscoped.js',
    		         grunt.file.expand(["./tests/fragments/test-jsdom.js", "./tests/common/*.js"]),
    		         ['./tests/fragments/init-jsdom.js', './vendors/scoped.js', './vendors/beta-noscoped.js'])
    .closureTask(null, ["./vendors/scoped.js", "./vendors/beta-noscoped.js", "./dist/betajs-browser-noscoped.js"], null, { })
    .browserstackTask(null, 'tests/tests.html', {desktop: true, mobile: false})
    .browserstackTask(null, 'tests/tests.html', {desktop: false, mobile: true})
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
		    'open http://' + gruntHelper.myip() + ':5000/static/tests/ajax/assets/index.html?cors=' + gruntHelper.myhostname() + ":5001",
		    'open http://' + gruntHelper.myhostname() + ":5001/static/tests/ajax/assets/dummy.html",
		    'node tests/ajax/test-server.js ' + [gruntHelper.myip(), gruntHelper.myhostname()].join(",") + " " + [5000, 5001].join(",")
		].join("&&")
	};
	
	grunt.initConfig(gruntHelper.config);
	
	grunt.registerTask("ajaxqunit", ["shell:ajaxqunit"]);

	grunt.registerTask('default', ['package', 'readme', 'license', 'codeclimate', 'travis', 'scopedclosurerevision', 'concat-scoped', 'uglify-noscoped', 'uglify-scoped']);
	grunt.registerTask('check-node', [ 'lint', 'qunit' ]);
	grunt.registerTask('check', ['check-node', 'browserqunit']);

};
