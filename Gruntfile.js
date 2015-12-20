module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bower : {
    	vendor: {
    		options: {
				targetDir: './public/vendor',
				layout: 'byType',
				install: true,
				verbose: false,
				cleanTargetDir: false,	
				cleanBowerDir: false,
				bowerOptions: {}
    		}
    	}
    },
    concat: {
    	js : {
			options: {
			  separator: '\r\n',
			},
			src: ['public/vendor/angular/angular.min.js', 
			  		'public/vendor/angular-ui-router/release/angular-ui-router.min.js',
			  		'public/vendor/angular-bootstrap/ui-bootstrap.min.js',
			  		'public/vendor/nonbower/vendor.min.js'
			  		],
			dest: 'public/dist/js/vendor.js'
    	},
    	css: {
			options: {
			  separator: '\r\n',
			},
			src: ['public/vendor/bootstrap/dist/css/bootstrap.min.css'],
			dest: 'public/dist/css/vendor.css'
    	}
  	},
    uglify: {
      app : {
        src : ['public/src/js/app/app.js','public/src/js/app/ctrls/**.js'],
        dest: 'public/dist/js/app.js'
      },
      vendor : {
        src: [
          'public/src/js/vendor/socket.io.js'
        ],
        dest:'public/vendor/nonbower/vendor.min.js'
      }
    },
    htmlmin: {
      app: {
        options: {
            removeComments: true,
            collapseWhitespace: true
        },
        files: [
          {
            src: 'public/src/index.html',
            dest: 'public/dist/index.html'
          },
          {
            expand: true,
            cwd: 'public/src/views/',
            src: '*.html',
            dest: 'public/dist/views/'
          }
        ]
      }
    },
    cssmin : {
      app : {
        src: 'public/src/css/app/**.css',
        dest: 'public/dist/css/app.css'
      },
    },
    copy : {
      fonts : {
        expand: true,
        src : '*',
        cwd: 'public/vendor/bootstrap/dist/fonts/',
        dest: 'public/dist/fonts/'
      },
      favicon : {
        src: 'public/src/favicon.ico',
        dest:'public/dist/favicon.ico'
      }
    },
    csslint: {
      app: {
        src: ['public/src/css/app/**.css']
      }
    },
    jshint : {
      front : ['public/src/js/app/app.js','public/src/js/app/ctrls/**.js'],
      back: ['app.js','routes/dozer/**/**.js']
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-bower-task');
  // Default task(s).
  grunt.registerTask('build',['bower:vendor',
  							  'uglify:app',
  							  'uglify:vendor',
  							  'cssmin:app',
  							  'htmlmin:app',
  							  'concat:js',
  							  'concat:css',
  							  'copy:fonts',
  							  'copy:favicon']);
  grunt.registerTask('test',['jshint:front','csslint:app','jshint:back']);
};
