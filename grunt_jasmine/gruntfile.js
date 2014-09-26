module.exports = function(grunt) {

	/*
	 * Desired ordering of CSS and JS files
	 * Add new JS files in package.json in order you want them to be added
	 */
	var pkg = grunt.file.readJSON('package.json'),
		
		// List of app scripts
		appFiles = pkg.appFiles,

		// List of lib scripts
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
				tasks: ['uglify:dev']
			},
			libs: {
				files: ['app/libs/**/*.js'],
				tasks: ['uglify:libs']
			},
			css: {
				files: ['app/sass/**/*.scss'],
				tasks: ['sass:dev']
			},
			partials:{
				files: ['app/**/*.html'],
				tasks: ['includereplace']
			},
			other:{
				files: [
					'app/fonts/**/*',
					'app/img/**/*'
				],
				tasks: ['copy:assets']
			}
		},


		/*
		 * Dev and deploy tasks
		 */ 
		
		// Add templates to HTML file
		includereplace: {
			dist: {
				files: [{
					src: 'index.html',
					dest: 'dist/',
					expand: true,
					cwd: 'app/'
				}]
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
					'dist/js/app.scripts.js': appFiles
				}
			},
			deploy:{
				files:{
					'dist/js/app.scripts.js': appFiles
				}
			},
			libs: {
				files:{
					'dist/js/libs.min.js': libFiles
				}
			}
		},
		
		// Clear dist folder and remove empty folders
		clean: {
			options: {
				force: true
			},
			publishDir: ['dist']
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

		// Copy directories and files in app excluding scss and files in html_partials
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
						'img/**/*'
					],
					dest: 'dist/'
				}]
			}
		},

		// Testing
		jasmine: {
			pivotal: {
				// Add scripts you would like to test here
				src: [
					'app/js/Calculator.js'
				],
				// Spec tests should be same file name as scripts + 'Spec'
				options: {
					specs: 'app/spec/*Spec.js',
					helpers: 'app/spec/*Helpers.js'
				}
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-clean');   // Clear directories
	grunt.loadNpmTasks('grunt-contrib-uglify');  // Uglify JS files
	grunt.loadNpmTasks('grunt-contrib-sass');    // SASS Compiler
	grunt.loadNpmTasks('grunt-contrib-copy');    // Copy directories
	grunt.loadNpmTasks('grunt-include-replace'); // Compile html partials into main html files
	grunt.loadNpmTasks('grunt-contrib-connect'); // Localhost
	grunt.loadNpmTasks('grunt-contrib-watch');   // Watch for file changes
	grunt.loadNpmTasks('grunt-contrib-jasmine'); // For jasmine testing


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
		'includereplace',
		'sass:dev',
		'uglify:dev',
		'uglify:libs', 
		'copy',
		'jasmine'
	]);

	// Deploy task
	grunt.registerTask('deploy', [
		'messageTask:deploy', 
		'clean',  
		'includereplace',
		'uglify:deploy', 
		'uglify:libs', 
		'sass:deploy', 
		'copy',
		'jasmine'
	]);

	// Run localhost on http://localhost:9000/, perform dev build and watch for file changes
	grunt.registerTask('serve', ['connect:target', 'dev', 'watch']);
};