module.exports = function(grunt) {

	/*
	 * Desired ordering of CSS and JS files
	 * Add new JS files in package.json in order you want them to be added
	 */
	var pkg = grunt.file.readJSON('package.json'),
		
		// List of app scripts
		appFiles = pkg.appFiles,

		// List of vendor/library scripts
		libFiles = pkg.libFiles;


	/* ================================================================
		Grunt config
	 * ================================================================ */
	grunt.initConfig({
		pkg: pkg,
		banner: '// <%= pkg.name %> - v<%= pkg.version %> - '+new Date()+'\n\n',


		/*
		 * Dev tasks 
		 */
		

		// Run Localhost
		connect: {
			target:{
				options: {
					hostname: '*',
					port: 9000,
					keepalive: false,
					base: 'dist'
				}
			}
		},

		// Watch and update changes made in app folder to dev folder
		watch: {
			options: {
				interrupt: true,
				spawn: true
			},
			scripts: {
				files: ['app/js/**/*.js'],
				tasks: ['ngAnnotate', 'uglify:dev']
			},
			libs: {
				files: ['app/libs/**/*.js'],
				tasks: ['uglify:libs']
			},
			css: {
				files: ['app/sass/**/*.scss'],
				tasks: ['sass:dev']
			},
			templates: {
				files: ['app/partials/**/*.html'],
				tasks: ['ngtemplates', 'uglify:dev']
			},
			other:{
				files: [
					'app/fonts/**/*',
					'app/img/**/*',
					'app/index.html'
				],
				tasks: ['copy:assets']
			}
		},


		/*
		 * Dev and deploy tasks
		 */ 

		// Add angular service dependancies as array to prevent uglify breaking
		ngAnnotate: {
			dev: {
				files: {
					'app/temp/scripts.annotated.js': appFiles
				}
			}
		},

		// Compile partials into single templates file and prevent uneccasary ajax requests
		ngtemplates: {
			app: {
				cwd: 'app',
				src: 'partials/**/*.html',
				dest: 'app/temp/templates.js',
				
				options: {
					module: 'App.templates',
					standalone: true,
					htmlmin: {						
						removeComments: true,
						removeAttributeQuotes: true,
						removeEmptyAttributes: true,
						removeRedundantAttributes: true,
						removeScriptTypeAttributes: true,
						removeStyleLinkTypeAttributes: true,
						collapseBooleanAttributes: true,
						collapseWhitespace: true
					}
				}
			}
		},

		// Uglify JavaScript files
		uglify:{
			dev:{
				options: {
					banner: '<%= banner %>',
					mangle: false,
					beautify : true,
					preserveComments: "all",
					compress: false
				},
				files:{
					'dist/js/app.scripts.js': ['app/temp/scripts.annotated.js', 'app/temp/templates.js']
				}
			},
			deploy:{
				files:{
					'dist/js/app.scripts.js': ['app/temp/scripts.annotated.js', 'app/temp/templates.js']
				}
			},
			libs: {
				files:{
					'dist/js/libs.min.js': libFiles
				}
			}
		},
		
		// Clear dist and temp folder
		clean: {
			options: {
				force: true
			},
			publishDir: ['dist', 'app/temp']
		},

		// Compile SASS files into CSS
		sass: {
			options: {
				noCache: true
			},
			dev: {
				options:{
					lineNumbers: true
				},
				files: {
					'dist/css/app.styles.css': 'app/sass/compiled.scss'
				}
			},
			deploy: {
				options:{
					style: 'compressed',
					sourcemap: 'none'
				},
				files: {
					'dist/css/app.styles.css': 'app/sass/compiled.scss'
				}
			}
		},

		// Copy asset directories into dist folder
		copy: {
			dist: {
				files: [
					{
						expand: true,
						cwd: 'app/',
						src: [
							'favicons/**/*',
							'fonts/**/*',
							'img/**/*'
						],
						dest: 'dist/'
					},
					// Include modernizr separetely
					{
						expand: true,
						flatten: true,
						cwd: 'app/',
						src: ['libs/modernizr-2.7.1.min.js'],
						dest: 'dist/js'
					}
				]
			},
			assets: {
				files: [{
					expand: true,
					cwd: 'app/',
					src: [
						'fonts/**/*',
						'img/**/*',
						'*.html'
					],
					dest: 'dist/'
				}]
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-clean');     // Clear directories
	grunt.loadNpmTasks('grunt-contrib-uglify');    // Uglify JS files
	grunt.loadNpmTasks('grunt-contrib-sass');      // SASS Compiler
	grunt.loadNpmTasks('grunt-contrib-copy');      // Copy directories
	grunt.loadNpmTasks('grunt-contrib-connect');   // Localhost
	grunt.loadNpmTasks('grunt-contrib-watch');     // Watch for file changes
	grunt.loadNpmTasks('grunt-ng-annotate');       // Add service dependancies before uglify process
	grunt.loadNpmTasks('grunt-angular-templates'); // Compile angular templates into one file


	/* ================================================================
		Grunt tasks
	 * ================================================================ */
	// Create publishDir grunt setting to determine which folder to add contents to
	grunt.registerTask("messageTask", function(env) {
		
		grunt.log.writeln('\n\n Running '+env+' task...\n');
	});

	// Local development task
	grunt.registerTask('dev', [
		'messageTask:dev', 
		'clean',
		'sass:dev',
		'ngAnnotate',
		'ngtemplates',
		'uglify:dev',
		'uglify:libs', 
		'copy'
	]);

	// Deploy task
	grunt.registerTask('deploy', [
		'messageTask:deploy', 
		'clean',  
		'sass:deploy',
		'ngAnnotate',
		'ngtemplates',
		'uglify:deploy', 
		'uglify:libs',  
		'copy'
	]);

	// Run localhost on http://localhost:9000/, perform dev build and watch for file changes
	grunt.registerTask('serve', ['connect:target', 'dev', 'watch']);
};