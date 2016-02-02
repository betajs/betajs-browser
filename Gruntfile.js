module.banner = '/*!\n<%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\nCopyright (c) <%= pkg.contributors %>\n<%= pkg.license %> Software License.\n*/\n';

module.exports = function(grunt) {

	grunt
			.initConfig({
				pkg : grunt.file.readJSON('package.json'),
				'revision-count' : {
					options : {
						property : 'revisioncount',
						ref : 'HEAD'
					}
				},
				concat : {
					options : {
						banner : module.banner
					},
					dist_raw : {
						dest : 'dist/betajs-browser-raw.js',
						src : [ 'src/fragments/begin.js-fragment',
								'src/browser/*.js',
								'src/fragments/end.js-fragment' ]
					},
					dist_scoped : {
						dest : 'dist/betajs-browser.js',
						src : [ 'vendors/scoped.js',
								'dist/betajs-browser-noscoped.js' ]
					}
				},
				preprocess : {
					options : {
						context : {
							MAJOR_VERSION : '<%= revisioncount %>',
							MINOR_VERSION : (new Date()).getTime()
						}
					},
					dist : {
						src : 'dist/betajs-browser-raw.js',
						dest : 'dist/betajs-browser-noscoped.js'
					}
				},
				clean : {
					raw: "dist/betajs-browser-raw.js",
					closure: "dist/betajs-browser-closure.js",
					browserstack : [ "./browserstack.json", "BrowserStackLocal" ],
					jsdoc : ['./jsdoc.conf.json']
				},
				uglify : {
					options : {
						banner : module.banner
					},
					dist : {
						files : {
							'dist/betajs-browser-noscoped.min.js' : [ 'dist/betajs-browser-noscoped.js' ],
							'dist/betajs-browser.min.js' : [ 'dist/betajs-browser.js' ]
						}
					}
				},
				jshint : {
					options : {
						es5 : false,
						es3 : true
					},
					source : [ "./src/browser/*.js" ],
					dist : [ "./dist/betajs-browser-noscoped.js",
							"./dist/betajs-browser.js" ],
					gruntfile : [ "./Gruntfile.js" ],
					tests : [ "./tests/browser/*.js" ]
				},
				closureCompiler : {
					options : {
						compilerFile : process.env.CLOSURE_PATH + "/compiler.jar",
						compilerOpts : {
							compilation_level : 'ADVANCED_OPTIMIZATIONS',
							warning_level : 'verbose',
							externs : [ "./src/fragments/closure.js-fragment",
									"./vendors/jquery-1.9.closure-extern.js" ]
						}
					},
					dist : {
						src : [ "./vendors/scoped.js", "./vendors/beta-noscoped.js",
								"./dist/betajs-browser-noscoped.js" ],
						dest : "./dist/betajs-browser-closure.js"
					}
				},
				jsdoc : {
					dist : {
						src : [ './README.md', './src/browser/*.js' ],					
						options : {
							destination : 'docs',
							template : "node_modules/grunt-betajs-docs-compile",
							configure : "./jsdoc.conf.json",
							tutorials: "./docsrc/tutorials",
							recurse: true
						}
					}
				},
				wget : {
					dependencies : {
						options : {
							overwrite : true
						},
						files : {
							"./vendors/scoped.js" : "https://raw.githubusercontent.com/betajs/betajs-scoped/master/dist/scoped.js",
							"./vendors/beta-noscoped.js" : "https://raw.githubusercontent.com/betajs/betajs/master/dist/beta-noscoped.js",
							"./vendors/jquery-1.9.closure-extern.js" : "https://raw.githubusercontent.com/google/closure-compiler/master/contrib/externs/jquery-1.9.js"
						}
					}
				},
				shell : {
					tests: {
						command: "open tests/tests.html"
					},
					browserstack : {
						command : 'browserstack-runner',
						options : {
							stdout : true,
							stderr : true
						}
					}
				},
				'node-qunit' : {
					dist : {
						deps: ['./tests/fragments/init-jsdom.js', './vendors/scoped.js', './vendors/beta-noscoped.js'],
						code : './dist/betajs-browser-noscoped.js',
						tests : grunt.file.expand(["./tests/fragments/test-jsdom.js", "./tests/common/*.js"]),
						done : function(err, res) {
							publishResults("node", res, this.async());
						}
					}
				},
				template : {
					"readme" : {
						options : {
							data: {
								indent: "",
								framework: grunt.file.readJSON('package.json')
							}
						},
						files : {
							"README.md" : ["compile/readme.tpl"]
						}
					},
					"license" : {
						options : {
							data: grunt.file.readJSON('package.json')
						},
						files : {
							"LICENSE" : ["compile/license.tpl"]
						}
					},
					"jsdoc": {
						options: {
							data: {
								data: {
									"tags": {
										"allowUnknownTags": true
									},
									"plugins": ["plugins/markdown"],
									"templates": {
										"cleverLinks": false,
										"monospaceLinks": false,
										"dateFormat": "ddd MMM Do YYYY",
										"outputSourceFiles": true,
										"outputSourcePath": true,
										"systemName": "BetaJS",
										"footer": "",
										"copyright": "BetaJS (c) - MIT License",
										"navType": "vertical",
										"theme": "cerulean",
										"linenums": true,
										"collapseSymbols": false,
										"inverseNav": true,
										"highlightTutorialCode": true,
										"protocol": "fred://"
									},
									"markdown": {
										"parser": "gfm",
										"hardwrap": true
									}
								}
							}
						},
						files : {
							"jsdoc.conf.json": ["compile/json.tpl"]
						}
					},
					"browserstack-desktop" : {
						options : {
							data: {
								data: {
									"test_path" : "tests/tests.html",
									"test_framework" : "qunit",
									"timeout": 10 * 60,
									"browsers": [
						              	'firefox_latest',
									    'firefox_4',
						                'chrome_latest',
							            'chrome_15',
						                'safari_latest',
							            'safari_4',
						                'opera_latest', 
									    'opera_12_15',
									    'edge_latest',
						                'ie_11',
						                'ie_10',
						                'ie_9',
						                'ie_8',
						                'ie_7',
						                'ie_6'
						            ]
								}
							}
						},
						files : {
							"browserstack.json" : ["compile/json.tpl"]
						}
					},
					"browserstack-mobile" : {
						options : {
							data: {
								data: {
									"test_path" : "tests/tests.html",
									"test_framework" : "qunit",
									"timeout": 10 * 60,
									"browsers": [
									    {"os": "ios", "os_version": "9.1"}, 
									    {"os": "ios", "os_version": "7.0"},
									    {"os": "android", "os_version": "4.4"},
									    {"os": "android", "os_version": "4.0"}
						            ]
								}
							}
						},
						files : {
							"browserstack.json" : ["compile/json.tpl"]
						}
					}			
				}
			});
	
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-git-revision-count');
	grunt.loadNpmTasks('grunt-preprocess');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-wget');
	grunt.loadNpmTasks('grunt-closure-tools');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-node-qunit');
	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-template');

	grunt.registerTask('default', [ 'revision-count', 'concat:dist_raw',
			'preprocess', 'clean:raw', 'concat:dist_scoped', 'uglify' ]);
	grunt.registerTask('qunit', [ 'shell:tests' ]);
	grunt.registerTask('docs', ['template:jsdoc', 'jsdoc', 'clean:jsdoc']);
	grunt.registerTask('lint', [ 'jshint:source', 'jshint:dist',
			'jshint:gruntfile', 'jshint:tests' ]);
	grunt.registerTask('check', [ 'lint', 'node-qunit', 'qunit' ]);
	grunt.registerTask('check-node', [ 'lint', 'node-qunit' ]);
	grunt.registerTask('dependencies', [ 'wget:dependencies' ]);
	grunt.registerTask('closure', [ 'closureCompiler', 'clean:closure' ]);
	grunt.registerTask('browserstack-desktop', [ 'template:browserstack-desktop', 'shell:browserstack', 'clean:browserstack' ]);
	grunt.registerTask('browserstack-mobile', [ 'template:browserstack-mobile', 'shell:browserstack', 'clean:browserstack' ]);
	grunt.registerTask('readme', [ 'template:readme' ]);
	grunt.registerTask('license', [ 'template:license' ]);

};