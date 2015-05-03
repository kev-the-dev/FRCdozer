module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      app : {
        src : ['public/src/js/app/app.js','public/src/js/app/ctrls/**.js'],
        dest: 'public/dist/js/app.js'
      },
      vendor : {
        src: [
          'public/src/js/vendor/angular.js',
          'public/src/js/vendor/angular-ui-router.js',
          'public/src/js/vendor/paginate.js',
          'public/src/js/vendor/socket.io.js'
        ],
        dest:'public/dist/js/vendor.js'
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
      vendor : {
        src : 'public/src/css/vendor/**.css',
        dest: 'public/dist/css/vendor.css'
      }
    },
    concurrent: {
      dev: {
        tasks: ['nodemon', 'watch:cssvendor','watch:jsapp','watch:jsvendor',
                'watch:htmlapp','watch:fontsapp','watch:fontsvendor','watch:favicon','watch:server','watch:cssapp','watch:cssvendor'],
        options: {
          limit: 12,
          logConcurrentOutput: true
        }
      },
      dist : {
        tasks: ['uglify:app','uglify:vendor','cssmin:app','cssmin:vendor','htmlmin:app',
                'copy:fontsapp','copy:fontsvendor','copy:favicon'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    nodemon: {
      dev: {
        script: 'app.js',
        options : {
          watch: ['app.js','routes/']
        }
      }
    },
    copy : {
      fontsapp : {
        expand: true,
        src : '*',
        cwd: 'public/src/fonts/app/',
        dest: 'public/dist/fonts/'
      },
      fontsvendor : {
        expand: true,
        src : '*',
        cwd: 'public/src/fonts/vendor/',
        dest: 'public/dist/fonts/'
      },
      favicon : {
        src: 'public/src/favicon.ico',
        dest:'public/dist/favicon.ico'
      }
    },
    watch: {
      all : [
        {
          files:['public/src/css/app/**.css'],
          tasks: ['cssmin:app']
        },
        {
          files:['public/src/css/vendor/**.css'],
          tasks: ['cssmin:vendor']
        },
        {
          files:['public/src/js/app/app.js','public/src/js/app/ctrls/**.js'],
          tasks: ['jshint:front','uglify:app']
        },
        {
          files:['public/src/js/vendor/**'],
          tasks: ['uglify:vendor']
        },
        {
          files:['public/src/index.html','public/src/views/**.html'],
          tasks: ['htmlmin:app']
        },
        {
          files:['public/src/fonts/app/**'],
          tasks:['copy:fontsapp']
        },
        {
          files:['public/src/fonts/vendor/**'],
          tasks:['copy:fontsvendor']
        },
        {
          files:['public/src/favicon.ico'],
          tasks:['copy:favicon']
        },
        {
          files: ['app.js','routes/dozer/**/**.js'],
          tasks: ['jshint:back']
        }
      ],
      cssapp : {
        files:['public/src/css/app/**.css'],
        tasks: ['cssmin:app']
      },
      cssvendor: {
        files:['public/src/css/vendor/**.css'],
        tasks: ['cssmin:vendor']
      },
      jsapp : {
        files:['public/src/js/app/app.js','public/src/js/app/ctrls/**.js'],
        tasks: ['jshint:front','uglify:app']
      },
      jsvendor : {
        files:['public/src/js/vendor/**'],
        tasks: ['uglify:vendor']
      },
      htmlapp : {
        files:['public/src/index.html','public/src/views/**.html'],
        tasks: ['htmlmin:app']
      },
      fontsapp : {
        files:['public/src/fonts/app/**'],
        tasks:['copy:fontsapp']
      },
      fontsvendor : {
        files:['public/src/fonts/vendor/**'],
        tasks:['copy:fontsvendor']
      },
      favicon : {
        files:['public/src/favicon.ico'],
        tasks:['copy:favicon']
      },
      server : {
        files: ['app.js','routes/dozer/**/**.js'],
        tasks: ['jshint:back']
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
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  // Default task(s).
  grunt.registerTask('build',['concurrent:dist']);
  grunt.registerTask('test',['jshint:front','jshint:back']);
  grunt.registerTask('dev', ['jshint:front','jshint:back','concurrent:dist','concurrent:dev']);
};
