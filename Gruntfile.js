module.banner = '/*!\n<%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\nCopyright (c) <%= pkg.contributors %>\n<%= pkg.license %> Software License.\n*/\n';

module.exports = function(grunt) {

	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		'revision-count': {
		    options: {
		      property: 'revisioncount',
		      ref: 'HEAD'
		    }
		},
		concat : {
			options : {
				banner : module.banner
			},
			dist_raw : {
				dest : 'dist/beta-browser-raw.js',
				src : [
					'src/fragments/begin.js-fragment',
				    'src/browser/*.js',
					'src/fragments/end.js-fragment'
				]
			},
			dist_scoped: {
				dest : 'dist/beta-browser.js',
				src : [
				    'vendors/scoped.js',
				    'dist/beta-browser-noscoped.js'
				]
			}
		},
		preprocess : {
			options: {
			    context : {
			    	MAJOR_VERSION: '<%= revisioncount %>',
			    	MINOR_VERSION: (new Date()).getTime()
			    }
			},
			dist : {
			    src : 'dist/beta-browser-raw.js',
			    dest : 'dist/beta-browser-noscoped.js'
			}
		},	
		clean: ["dist/beta-browser-raw.js"],
		uglify : {
			options : {
				banner : module.banner
			},
			dist : {
				files : {
					'dist/beta-browser-noscoped.min.js' : [ 'dist/beta-browser-noscoped.js' ],					
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
			}
		},
	});

	grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-shell');	
	grunt.loadNpmTasks('grunt-git-revision-count');
	grunt.loadNpmTasks('grunt-preprocess');
	grunt.loadNpmTasks('grunt-contrib-clean');	
	

	grunt.registerTask('default', ['revision-count', 'concat:dist_raw', 'preprocess', 'clean', 'concat:dist_scoped', 'uglify']);
	grunt.registerTask('lint', ['shell:lint']);	
	grunt.registerTask('check', ['lint']);

};