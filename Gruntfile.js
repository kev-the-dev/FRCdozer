module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      public : {
        files : {
          'public/dest/js/all.min.js':[
          'public/src/scripts/app.js',
          'public/src/scripts/ctrls/game.js',
          'public/src/scripts/paginate.js'
          ]
        }
      }
    },
    htmlmin: {
      public: {
        options: {
            removeComments: true,
            collapseWhitespace: true
        },
        files: [
          {
            src: 'public/src/index.html',
            dest: 'public/dest/index.html'
          },
          {
            expand: true,
            cwd: 'public/src/views/',
            src: '*.html',
            dest: 'public/dest/views/'
          }
        ]
      }
    },
    cssmin : {
      public : {
        files : [
        {
          expand: true,
          cwd: 'public/src/styles/',
          src: '*.css',
          dest: 'public/dest/css/'
        }
        ]
      }
    },
    concurrent: {
      dev: {
        tasks: ['nodemon', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      },
      minify : {
        tasks: ['uglify','htmlmin','cssmin'],
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
        tasks: ['uglify','htmlmin','cssmin'],
      }
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

  // Default task(s).
  grunt.registerTask('build', ['concurrent:minify']);
  grunt.registerTask('dev', ['concurrent:minify','concurrent:dev']);
};
