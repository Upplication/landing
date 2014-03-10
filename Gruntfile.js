// Generated on 2013-09-18 using generator-angular 0.4.0
'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT });
var fs = require('fs');
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};
// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'


module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  require('time-grunt')(grunt);


  var BASE_PATH = grunt.option( "path" )? grunt.option( "path" ): "";

  // configurable paths
  var yeomanConfig = {
    app: 'app',
    dist: 'dist'
  };

  try {
    yeomanConfig.app = require('./bower.json').appPath || yeomanConfig.app;
  } catch (e) {
  }

  //SETUP JADE DINAMICALLY
  var views = grunt.file.readJSON('./app/urls.json');
  var langs = grunt.file.readJSON('./app/locales/languages.json');

  var jade_config = {};
  var dest, src, task, curr_lang, jade = {}, folder;

  //TODO: For {"dist", "dev"}
  var tasks = {
    dist: {
      name: "dist"

    }
  };
  ["dist", "dev"].forEach(function(env){

    jade[env] = [];

    langs.codes.forEach(function(lang){
      lang = lang.language_country
      jade[env].push('jade:' + env + "-" + lang);

      task = env + '-' + lang;
      jade_config[task] = {
        options: {
          i18n: {
            locales: '<%= yeoman.app %>/locales/' + lang + '.json',
            namespace: '$',
            localeExtension: true
          },
          pretty: true,
          data: {
            BASE_PATH: BASE_PATH,
            langs: grunt.file.readJSON("app/locales/languages.json")
          }
        },
        files: {}
      };

      curr_lang = grunt.file.readJSON(yeomanConfig.app + '/locales/' + lang + '.json');

      for(var view in views){
        if(views.hasOwnProperty(view)){
          if(env === "dist")
            folder = "dist";
          else
            folder = ".tmp";

          dest = folder + curr_lang[view]._url + (curr_lang[view].page || "index.html");
          src = "<%= yeoman.app %>" + views[view];
          jade_config[task].files[dest] = src;
        }
      }
    });


    //END SETUP JADE DINAMICALLY
  });


  grunt.initConfig({
    yeoman: yeomanConfig,
    watch: {
      styles: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
        tasks: ['copy:styles', 'autoprefixer']
      },
      livereload: {
        options: {
          livereload: LIVERELOAD_PORT
        },
        files: [
          '.tmp/{,*/}*.html',
          '<%= yeoman.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '{.tmp,<%= yeoman.app %>}/scripts/{,*/}*.js',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      },
      compass: {
        files: ['<%= yeoman.app %>/styles/sass/{,*/}*.sass'],
        tasks: ['compass:dev']
      },
      jade: {
        files: ['<%= yeoman.app %>/{,*/}*.jade'],
        tasks: ['jade']
      }
    },
    autoprefixer: {
      options: ['last 1 version'],
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>/styles/',
            src: '{,*/}*.css',
            dest: '<%= yeoman.app %>/styles/'
          }
        ]
      }
    },
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, yeomanConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, yeomanConfig.dist)
            ];
          }
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:<%= connect.options.port %>'
      }
    },
    clean: {
      dist: {
        files: [
          {
            dot: true,
            src: [
              '<%= yeoman.dist %>/*',
              '!<%= yeoman.dist %>/.git*'
            ]
          }
        ]
      },
      server: '.tmp'
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        '<%= yeoman.app %>/scripts/{,*/}*.js'
      ]
    },
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/scripts/{,*/}*.js',
            '<%= yeoman.dist %>/styles/{,*/}*.css',
            '<%= yeoman.dist %>/styles/fonts/*'
          ]
        }
      }
    },
    useminPrepare: {
      html: '.tmp/index.html',
      options: {
        dest: '<%= yeoman.dist %>'
      }
    },
    usemin: {
      html: ['<%= yeoman.dist %>/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      js: '<%= yeoman.dist %>/scripts/{,*/}*.js',
      options: {
        dirs: ['<%= yeoman.dist %>'],
        assetsDirs: '<%= yeoman.dist %>/images',
        patterns: {
          js: [['{,*/}*.{png,jpg,jpeg,gif,webp}', 'Replacing reference to images in js']]
        }
      }
    },
    imagemin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>/images',
            src: '{,*/}*.{png,jpg,jpeg}',
            dest: '<%= yeoman.dist %>/images'
          }
        ]
      },
      server: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>/images',
            src: '{,*/}*.{png,jpg,jpeg}',
            dest: '.tmp/images'
          }
        ]
      }
    },
    svgmin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>/images',
            src: '{,*/}*.svg',
            dest: '<%= yeoman.dist %>/images'
          }
        ]
      }
    },
    htmlmin: {
      dist: {
        options: {
          /*

           https://github.com/yeoman/grunt-usemin/issues/44#issuecomment-17430724

          */
        },
        files: [
          {
            expand: true,
            cwd: '.tmp',
            src: ['*.html', 'views/*.html'],
            dest: '<%= yeoman.dist %>'
          }
        ]
      }
    },
    // Put files not handled in other tasks here
    copy: {
      dist: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= yeoman.app %>',
            dest: '<%= yeoman.dist %>',
            src: [
              '*.{ico,png,txt}',
              '.htaccess',
              'bower_components/**/*',
              'images/{,*/}*.{jpg,gif,png,webp}',
              'scripts/{,*/}*.js',
              'fonts/{,*/}*'
            ]
          }
        ]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },
    concurrent: {
      server: [
        'copy:styles',
        'compass:dev',
        'imagemin:server'
      ].concat(jade.dev),
      dist: [
        'copy:styles',
        'svgmin',
        'imagemin:dist'
      ]
    },
    uglify: {
      dist: {
        files: {
          '<%= yeoman.dist %>/scripts/app.js': [
            '<%= yeoman.dist %>/scripts/app.js'
          ]
        }
      }
    },
    compass: {                  // Task
      dist: {                   // Target
        options: {              // Target options
          sassDir: '<%= yeoman.app %>/styles/sass',
          cssDir: '<%= yeoman.dist %>/styles',
          environment: 'production',
          require: 'susy'
        }
      },
      dev: {                    // Another target
        options: {
          sassDir: '<%= yeoman.app %>/styles/sass',
          cssDir: '.tmp/styles',
          require: 'susy'
        }
      }
    },
    jade: jade_config,
    'gh-pages': {
      options: {
        base: 'dist'
      },
      src: ['**']
    }
  });


  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'concurrent:server',
      'setLangs:server',
      'autoprefixer',
      'connect:livereload',
      'open',
      'watch',
      'imagemin:server'
    ]);
  });

  var myTasks = [
    
    'htmlmin',
    'compass',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'setLangs:dist',
    'copy:dist',
    'uglify',
    'usemin',
    'rev',
    
    'imagemin:dist'
  ];


  grunt.registerTask('build', ['clean:dist'].concat(jade.dist.concat(myTasks)));

  grunt.registerTask('default', [
    'server'
  ]);

  grunt.registerTask('setLangs', function (env) {
    var views = grunt.file.readJSON('./app/urls.json');
    var langs = grunt.file.readJSON('./app/locales/languages.json');
    if(env === "dist"){
      folder = "dist";
    }else{
      folder = ".tmp";
    }

    var outputFilename = './app/routing.json';

    langs = langs.codes;
    var langFiles = {}, lang, aux, routing = {};

    for(var i=0; i < langs.length; i++){
      lang = langs[i].language_country;
      langFiles[lang] = grunt.file.readJSON('./app/locales/' + lang + '.json');
    }

    for(var view in views){
      routing[view]={};

      if(views.hasOwnProperty(view)){
        for(var i=0; i < langs.length; i++){
          lang = langs[i].language_country;
          routing[view][lang] = langFiles[lang][view]._url;
        }
      }
    }

    fs.writeFile(outputFilename, JSON.stringify(routing, null, 4), function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log("Routing file saved to " + outputFilename);
      }
    });
  });

  grunt.registerTask('upplication', [
    'build',
    'gh-pages'
  ]);

  grunt.loadNpmTasks('grunt-gh-pages');

  grunt.loadNpmTasks('grunt-jade-i18n-extended');
};
