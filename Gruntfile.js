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
        tasks: ['nodemon', 'watch:dev'],
        options: {
          logConcurrentOutput: true
        }
      },
      minify : {
        tasks: ['uglify:app','uglify:vendor','cssmin:app','cssmin:vendor','htmlmin:app'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    nodemon: {
      dev: {
        script: 'app.js',
        options: {
          ignore: 'public/**'
        }
      }
    },
    watch: {
      dev: {
        files: ['public/src/**'],
        tasks: ['uglify:app','uglify:vendor','cssmin:app','cssmin:vendor','htmlmin:app']
      }
    },
    jshint : {
      front : ['public/src/scripts/app.js','public/src/scripts/ctrls/**.js'],
      back: ['app.js','routes/**.js']
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
  // Default task(s).
  grunt.registerTask('build',['concurrent:minify']);
  grunt.registerTask('test',['jshint:front']);
  grunt.registerTask('dev', ['concurrent:minify','concurrent:dev']);
};
