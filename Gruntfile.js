'use strict';

var LIVERELOAD_PORT = 35729;
var CONNECT_PORT = 9000;
var BASE_PATH;
var environment;
var lrSnippet = require('connect-livereload')({ port: LIVERELOAD_PORT });
var fs = require('fs');
var path = require('path');
var dateformat = require('dateformat');
var mountFolder = function (connect, dir) {
    return connect.static(path.resolve(dir));
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
    var getConfig = function () {
        var configJson = grunt.file.readJSON('./app/config.json');
        var localConfig = configJson[environment];
        // override for grunt params
        for (var key in localConfig) {
            if (localConfig.hasOwnProperty(key)) {
                var override = grunt.option("config." + key);
                if (override) {
                    localConfig[key] = override;
                }
            }
        }
        return localConfig;
    };

    /**
     * Create the views reading the first level of the view directory
     */
    var getViews = function() {
        var viewPath = './app/views/',
            result = {},
            views = fs.readdirSync(viewPath);

        views = views.filter(function(elem){
            return !fs.statSync(viewPath + elem).isDirectory();
        });

        views.forEach(function(view){
            result[path.basename(view, '.jade')] = '/views/' + view;
        });

        return result;
    };

    // we can use configs vars inside locales json

    var getRoutes = function () {
        var langs = grunt.file.readJSON('./app/locales/languages.json');
        langs = langs.codes;
        var langFiles = {}, lang, routing = {}, i;

        for (i = 0; i < langs.length; i++) {
            lang = langs[i].language_country;
            langFiles[lang] = grunt.file.readJSON('./app/locales/' + lang + '.json');
        }
        var views = getViews();
        for (var view in views) {
            routing[view] = {};
            if (views.hasOwnProperty(view)) {
                for (i = 0; i < langs.length; i++) {
                    lang = langs[i].language_country;
                    routing[view][lang] = BASE_PATH + langFiles[lang][view]._url;
                }
            }
        }
        return routing;
    };

    environment = grunt.option("env") ? grunt.option("env") : "localhost";
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

    var langs = grunt.file.readJSON('./app/locales/languages.json');

    var jade_config = {};
    var dest, src, task, curr_lang, jade = {}, folder;

    ["dist", "dev"].forEach(function (env) {

        jade[env] = [];

        langs.codes.forEach(function (lang) {
            lang = lang.language_country;
            //console.log("lang=",lang);
            var routing = getRoutes();
            var config = JSON.stringify(grunt.file.readJSON('./app/config.json'));
            var localConfig = getConfig();
            //console.log("Routing a JADE=",routing);
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
                    data: function(dest, src){
                        return {
                            langs: grunt.file.readJSON("app/locales/languages.json"),
                            lang: lang,
                            // current key for the block
                            _template: path.basename(src, '.jade'),
                            routing: routing,
                            routingString: JSON.stringify(routing),
                            config: config,
                            localConfig: localConfig
                        };
                    }
                },
                files: {}
            };

            curr_lang = grunt.file.readJSON(yeomanConfig.app + '/locales/' + lang + '.json');

            var views = getViews();
            for (var view in views) {
                if (env === "dist")
                    folder = "dist";
                else
                    folder = ".tmp";

                dest = folder + curr_lang[view]._url + (curr_lang[view].page || "index.html");
                src = "<%= yeoman.app %>" + views[view];
                //jade_config[task].options.data.viewName = view;
                jade_config[task].files[dest] = src;
                if (views.hasOwnProperty(view)) {

                }
            }
        });
        //END SETUP JADE DINAMICALLY
    });

    grunt.initConfig({
        yeoman: yeomanConfig,
        watch: {
            styles: {
                files: ['<%= yeoman.app %>/styles/{,**/}*.css'],
                tasks: ['copy:styles', 'autoprefixer', 'replace:dev']
            },
            livereload: {
                options: {
                    livereload: LIVERELOAD_PORT
                },
                files: [
                    '.tmp/{,**/}*.html',
                    '<%= yeoman.app %>/{,**/}*.html',
                    '.tmp/styles/{,**/}*.css',
                    '{.tmp,<%= yeoman.app %>}/scripts/{,**/}*.js',
                    '<%= yeoman.app %>/images/{,**/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            },
            jade: {
                files: ['<%= yeoman.app %>/{,**/}*.jade'],
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
                        src: '{,**/}*.css',
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
                '<%= yeoman.app %>/scripts/{,**/}*.js'
            ]
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= yeoman.dist %>/scripts/{,**/}*.js',
                        '<%= yeoman.dist %>/styles/{,**/}*.css',
                        '<%= yeoman.dist %>/styles/fonts/*'
                    ]
                }
            }
        },
        useminPrepare: {
            html: '.tmp/{,**/}*.html',
            options: {
                dest: '<%= yeoman.dist %>'
            }
        },
        usemin: {
            html: ['<%= yeoman.dist %>/{,**/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,**/}*.css'],
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
                        src: '{,**/}*.{png,jpg,jpeg}',
                        dest: '<%= yeoman.dist %>/images'
                    }
                ]
            },
            server: {
                files: [
                    {
                        expand: true,
                        cwd: '<%= yeoman.app %>/images',
                        src: '{,**/}*.{png,jpg,jpeg}',
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
                        src: '{,**/}*.svg',
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
                        src: ['{,**/}*.html', 'views/{,**/}*.html'],
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
                            '*.{ico,png,txt,xml}',
                            '.htaccess',
                            'bower_components/**/*',
                            'images/{,**/}*.{jpg,gif,png,webp}',
                            'fonts/{,**/}*'
                        ]
                    }
                ]
            },
            scripts: {
                expand: true,
                cwd: '<%= yeoman.app %>/scripts',
                dest: '.tmp/scripts/',
                src: '{,**/}*.js'
            },
            styles: {
                expand: true,
                cwd: '<%= yeoman.app %>/styles',
                dest: '.tmp/styles/',
                src: '{,**/}*.css'
            }
        },
        concurrent: {
            server: [
                'copy:styles',
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
        replace: {
            dist: {
                options: {
                    patterns: [
                        {
                            json: getConfig()
                        },
                        // the only way to replace usemin blocks
                        // other alternative: https://github.com/ghosert/grunt-applymin
                        {
                            match: /href="\/styles\//g,
                            replacement: 'href="' + BASE_PATH + '/styles/'

                        },
                        {
                            match: /src="\/scripts\//g,
                            replacement: 'src="' + BASE_PATH + '/scripts/'

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
                            'dist/{,**/}*.html',
                            'dist/{,**/}*.css'
                        ]
                        //dest: 'dist/'
                    }
                ]
            },
            "dev": {
                options: {
                    patterns: [
                        {
                            json: getConfig()
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
                            '.tmp/{,**/}*.html',
                            '.tmp/{,**/}*.css'
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
            'routing',
            'sitemap',
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
    grunt.registerTask('prepare', function () {
        grunt.task.run([
            'clean:server',
            'routing',
            'sitemap',
            'concurrent:server',
            'autoprefixer'
        ]);
    });
    //-- END GRUNT PREPARE

    //-- GRUNT BUILD
    var myTasks = [
        'htmlmin',
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
        'routing',
        'sitemap'
    ].concat(jade.dist.concat(myTasks)));

    grunt.registerTask('deploy', function () {
        grunt.task.run('prepare');
        grunt.task.run('build');
    });

    //-- END GRUNT BUILD

    grunt.registerTask('default', [
        'server'
    ]);

    /**
     * generate routing.json
     */
    grunt.registerTask('routing', function () {
        var outputFilename = yeomanConfig.app + '/routing.json';
        var routing = getRoutes();

        fs.writeFile(outputFilename, JSON.stringify(routing, null, 4), function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Autogenerated Routing file saved to " + outputFilename);
            }
        });
    });

    /**
     * generate a sitemap.xml
     * The 'main url' is the first in languages.json.
     * If you want to override the priority you must to set the _priority key
     */
    grunt.registerTask('sitemap', function () {

        var outputFilename = yeomanConfig.app + '/sitemap.xml';
        var routing = getRoutes();
        var resultString = '<?xml version="1.0" encoding="UTF-8"?>\n' +
                            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
                            '\txmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

        for (var page in routing) {
            if (routing.hasOwnProperty(page)) {
                var i  = 0;
                var locale = '';
                for (var lang in routing[page]) {
                    if (routing[page].hasOwnProperty(lang)) {
                        var url = routing[page][lang];
                        if (url.indexOf("http") != 0) {
                            url = "https:" + url;
                        }
                        if (i == 0){
                            // set the mail url and the mail locale
                            resultString += '\t<url>\n\t\t<loc>' + url + '</loc>\n';
                            locale = lang;
                        }
                        resultString += '\t\t<xhtml:link rel="alternate" hreflang="' + lang + '" href="' + url + '"/>\n';
                    }
                    i++;
                }
                resultString += '\t\t<lastmod>' + dateformat(fs.statSync(yeomanConfig.app + '/views/' + page + '.jade').mtime, 'yyyy-mm-dd') +'</lastmod>\n';
                var priority = grunt.file.readJSON(yeomanConfig.app + '/locales/' + locale + '.json')[page]._priority;
                resultString += '\t\t<priority>' + (priority ? priority : '0.5') + '</priority>\n';
                resultString += '\t</url>\n'
            }
        }
        resultString += '</urlset>';

        fs.writeFileSync(outputFilename, resultString);
    });

    grunt.registerTask('upplication', [
        'deploy',
        'gh-pages'
    ]);

    grunt.loadNpmTasks('grunt-gh-pages');
    grunt.loadNpmTasks('grunt-jade-i18n');
    grunt.loadNpmTasks('grunt-replace');

};
