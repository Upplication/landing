// Generated on 2013-09-18 using generator-angular 0.4.0
'use strict';
var LIVERELOAD_PORT = 35729;
var CONNECT_PORT = 9000;
var BASE_PATH;
var environment;
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
 
  // custom functions

  // load environment:
  var getConfig = function(){
      var configJson = grunt.file.readJSON('./app/config.json');
      var localConfig = configJson[environment];
      // override for grunt params
      for (var key in localConfig) {
        if (localConfig.hasOwnProperty(key)) {
          //console.log(key + " -> " + localConfig[key]);
          var override = grunt.option("config." + key); 
          if (override){
            localConfig[key] = override;
          }
        }
      }
      return localConfig;
  }

  // we can use configs vars inside locales json

  var getRoutes = function(){
    var views = grunt.file.readJSON('./app/urls.json');
    var langs = grunt.file.readJSON('./app/locales/languages.json');
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
          routing[view][lang] = BASE_PATH + langFiles[lang][view]._url;
        }
      }
    }
    //console.log("Return routing=", routing);
    return routing;
  }
  
  environment = grunt.option("env")?grunt.option( "env" ): "localhost";
  console.log("Loading environment=" + environment);
  // FIXME: base_path are mandatory...
  BASE_PATH = getConfig().base_path;
  console.log("With base path: " + BASE_PATH);  

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
  //console.log("langs=",langs);

  var jade_config = {};
  var dest, src, task, curr_lang, jade = {}, folder, lang_html;

  //TODO: For {"dist", "dev"}
  var tasks = {
    dist: {
      name: "dist"

    }
  };
  ["dist", "dev"].forEach(function(env){

    jade[env] = [];

    langs.codes.forEach(function(lang){
      lang_html = lang.language_country_html;
      lang = lang.language_country;
      //console.log("lang=",lang);
      var routing = getRoutes();
      var config = JSON.stringify(grunt.file.readJSON('./app/config.json'));
      var localConfig = getConfig();
      //console.log("Routing a JADE=",routing);
      
      //console.log("lang_html=",lang_html)
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
            langs: grunt.file.readJSON("app/locales/languages.json"),
            lang: lang,
            lang_html: lang_html,
            routing: routing,
			      routingString: JSON.stringify(routing),
            config: config,
            localConfig: localConfig
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
        tasks: ['copy:styles', 'autoprefixer', 'replace:dev']
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
        tasks: ['compass:dev', 'replace:dev']
      },
      jade: {
        files: ['<%= yeoman.app %>/{,*/}*.jade'],
        tasks: ['jade', 'replace:dev']
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
        port: CONNECT_PORT,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: '0.0.0.0'
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
      html: '.tmp/{,*/}*.html',
      options: {
          dest: '<%= yeoman.dist %>'
        }
    },
    usemin: {
        html: ['<%= yeoman.dist %>/{,*/}*.html'],
        css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
        //js: ['<%= yeoman.dist %>/scripts/{,*/}*.js'],
        options: {
          dirs: ['.tmp', '<%= yeoman.dist %>']
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
            src: ['{,*/}*.html', 'views/{,*/}*.html'],
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
              'fonts/{,*/}*'
            ]
          }
        ]
      },
      scripts:{
        expand: true,
        cwd: '<%= yeoman.app %>/scripts',
        dest: '.tmp/scripts/',
        src: '{,*/}*.js'
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
        'copy:scripts',
        'svgmin',
        'imagemin:dist'
      ]
    },
    uglify: {
      // used by usemin
    },
    compass: {                  // Task
      dist: {                   // Target
        options: {              // Target options
          sassDir: '<%= yeoman.app %>/styles/sass',
          cssDir: '<%= yeoman.dist %>/styles',
          // usemin css handles the minimification process
          // using codeblocks in jade files
          environment: 'development',
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
    replace: {
      dist: {
        options: {
          patterns: [
            {
              json:getConfig()
            },
            // the only way to replace usemin blocks
            // other alternative: https://github.com/ghosert/grunt-applymin
            {
              match: /href="\/styles\//g,
              replacement: 'href="'+BASE_PATH+'/styles/'
                
            },
            {
              match: /src="\/scripts\//g,
              replacement: 'src="'+BASE_PATH+'/scripts/'
                
            },
            {
              match: 'timestamp',
              replacement: '<%= grunt.template.today() %>'
            }
          ],
          // custom prefix indicate that we use vars inside config file
          // FIXME: i want suffix in order to works like jade vars
          prefix: '@@config.'
        },
        files: [
          {
            expand: true, 
            
            src: [
              'dist/{,*/}*.html',
              'dist/{,*/}*.css'
            ], 
            //dest: 'dist/'
          }
        ]
      },
      "dev": {
        options: {
          patterns: [
            {
              json:getConfig()
            },
            {
              match: 'timestamp',
              replacement: '<%= grunt.template.today() %>'
            }
          ],
          // custom prefix indicate that we use vars inside config file
          // FIXME: i want suffix in order to works like jade vars
          prefix: '@@config.'
        },
        files: [
          {
            expand: true, 
            
            src: [
              '.tmp/{,*/}*.html',
              '.tmp/{,*/}*.css'
            ], 
            //dest: 'dist/'
          }
        ]
      }

    },
    jade: jade_config,
    'gh-pages': {
      options: {
        base: 'dist'
      },
      src: ['**']
    },
      cssmin: {
          // By default, your `index.html` <!-- Usemin Block --> will take care of
          // minification. This option is pre-configured if you do not wish to use
          // Usemin blocks.
          // dist: {
          //   files: {
          //     '<%= yeoman.dist %>/styles/main.css': [
          //       '.tmp/styles/{,*/}*.css',
          //       '<%= yeoman.app %>/styles/{,*/}*.css'
          //     ]
          //   }
          // }
      }
  });

  //-- GRUNT SERVER
  grunt.registerTask('server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'open', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      'setLangs:server',
      'concurrent:server',
      'autoprefixer',
      'replace:dev',
      'connect:livereload',
      'open',
      'watch',
      'imagemin:server'
    ]);
  });
  //-- END GRUNT SERVER

  //-- GRUNT PREPARE
  grunt.registerTask('prepare', function (target) {
    
    grunt.task.run([
      'clean:server',
      'setLangs:server',
      'concurrent:server',
      'autoprefixer'
    ]);
  });
  //-- END GRUNT PREPARE

  //-- GRUNT BUILD
  var myTasks = [
    'htmlmin',
    'compass',
    'useminPrepare',
    'concurrent:dist',
    'autoprefixer',
    'concat',
    'copy:dist',
    // usemin uses this to minimify the css
    'cssmin',
    // usemin uses this to minimity the js
    'uglify',
    //'rev',
    'usemin',
    'imagemin:dist',
    'replace:dist'
  ];

  grunt.registerTask('build', [
    'clean:dist',
    'setLangs:dist'
  ].concat(jade.dist.concat(myTasks)));

  grunt.registerTask('deploy', function(){
    grunt.task.run('prepare');
    grunt.task.run('build');
  });

    
  //-- END GRUNT BUILD

  grunt.registerTask('default', [
    'server'
  ]);

  grunt.registerTask('setLangs', function (env) {
    if(env === "dist"){
      folder = "dist";
    }else{
      folder = ".tmp";
    }

    var outputFilename = './app/routing.json';

    var routing = getRoutes();

    fs.writeFile(outputFilename, JSON.stringify(routing, null, 4), function(err) {
      if(err) {
        console.log(err);
      } else {
        //console.log("Routing file saved to " + outputFilename);
      }
    });
  });

  grunt.registerTask('upplication', [
    'deploy',
    'gh-pages'
  ]);

  grunt.loadNpmTasks('grunt-gh-pages');
  grunt.loadNpmTasks('grunt-jade-i18n-extended');
  grunt.loadNpmTasks('grunt-replace');
};
