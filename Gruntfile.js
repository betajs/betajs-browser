module.banner = '/*!\n<%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\nCopyright (c) <%= pkg.contributors %>\n<%= pkg.license %> Software License.\n*/\n';

module.exports = function(grunt) {

	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		concat : {
			options : {
				banner : module.banner
			},
			dist_beta_browser : {
				dest : 'dist/beta-browser.js',
				src : [
					'src/browser/*.js',
				]
			},
		},
		uglify : {
			options : {
				banner : module.banner
			},
			dist : {
				files : {
					'dist/beta-browser.min.js' : [ 'dist/beta-browser.js' ],					
				}
			}
		},
		shell: {
			lint: {
		    	command: "jsl +recurse --process ./src/*.js",
		    	options: {
                	stdout: true,
                	stderr: true,
            	},
            	src: [
            		"src/*/*.js"
            	]
			},
			docs: {
				command: "java -Djsdoc.dir=$JSDOCDIR -Djsdoc.template.dir=$JSDOCTEMPLATEDIR -jar $JSDOCDIR/jsrun.jar $JSDOCDIR/app/run.js ./src -d=./docs -r -p $@",
		    	options: {
                	stdout: true,
                	stderr: true,
            	},
            	src: [
            		"src/*/*.js"
            	]
			}
		},
	});

	grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-shell');	

	grunt.registerTask('default', ['newer:concat', 'newer:uglify']);
	grunt.registerTask('lint', ['shell:lint']);	
	grunt.registerTask('docs', ['shell:docs']);
	grunt.registerTask('check', ['lint']);

};