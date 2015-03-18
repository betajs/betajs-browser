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
		clean: ["dist/beta-browser-raw.js", "dist/beta-browser-closure.js"],
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
			},
			lintfinal : {
				command : "jsl --process ./dist/beta-browser.js",
				options : {
					stdout : true,
					stderr : true,
				},
				src : [ "src/*/*.js" ]
			}
		},
		closureCompiler : {
			options : {
				compilerFile : process.env.CLOSURE_PATH
						+ "/compiler.jar",
				compilerOpts : {
					compilation_level : 'ADVANCED_OPTIMIZATIONS',
					warning_level : 'verbose',
					externs : [ "./src/fragments/closure.js-fragment" ]
				}
			},
			dist : {
				src : ["./vendors/beta.js", "./dist/beta-browser-noscoped.js"],
				dest : "./dist/beta-browser-closure.js"
			}
		},
		wget : {
			dependencies : {
				options : {
					overwrite : true
				},
				files : {
					"./vendors/scoped.js" : "https://raw.githubusercontent.com/betajs/betajs-scoped/master/dist/scoped.js",
					"./vendors/beta.js" : "https://raw.githubusercontent.com/betajs/betajs/master/dist/beta.js",
				}
			}
		},
		jsdoc : {
	        dist : {
	            src: ['./README.md', './src/**/*.js'],
	            options: {
	                destination: 'docs',
	                template : "node_modules/grunt-jsdoc/node_modules/ink-docstrap/template",
	                configure : "./jsdoc.conf.json"
	            }
	        }
		}
	});

	grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-shell');	
	grunt.loadNpmTasks('grunt-git-revision-count');
	grunt.loadNpmTasks('grunt-preprocess');
	grunt.loadNpmTasks('grunt-contrib-clean');	
	grunt.loadNpmTasks('grunt-wget');
	grunt.loadNpmTasks('grunt-closure-tools');
    grunt.loadNpmTasks('grunt-jsdoc');
	

	grunt.registerTask('default', ['revision-count', 'concat:dist_raw', 'preprocess', 'clean', 'concat:dist_scoped', 'uglify']);
	grunt.registerTask('lint', ['shell:lint', 'shell:lintfinal']);	
	grunt.registerTask('check', ['lint']);
	grunt.registerTask('dependencies', [ 'wget:dependencies' ]);
	grunt.registerTask('closure', [ 'closureCompiler', 'clean' ]);

};