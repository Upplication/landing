var gulp = require('gulp');
var fs = require('fs');
var jade = require('gulp-jade');
var data = require('gulp-data');
var path = require('path');
var through2 = require('through2');
var usemin = require('gulp-usemin');
var cleanCSS = require('gulp-clean-css');
var connect = require('gulp-connect');
var replace = require('gulp-replace-task');
var uglify = require('gulp-uglify');
var rev = require('gulp-rev');
var bower = require('gulp-bower');
var del = require('del');
var gutil = require('gulp-util');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var _ = require('lodash');

var onesky = require('./gulp/onesky');
var sitemap = require('./gulp/sitemap');
var _locales = require('./gulp/locales');

/**
 * load environment vars from config.json
 */
var envConfig = function () {
    var environment = gutil.env.env ? gutil.env.env : "localhost";
    var configJson = JSON.parse(fs.readFileSync('./config.json'));
    var localConfig = configJson[environment];
    // override for grunt params
    for (var key in localConfig) {
        if (localConfig.hasOwnProperty(key)) {
            var configOverride = gutil.env["config"];
            var override = configOverride && configOverride[key];
            if (override) {
                localConfig[key] = override;
            }
        }
    }
    return localConfig;
}();

/**
 * Create the views reading the first level of the view directory
 * return json like:
 *  {
 *      "about_us": "views/about_us"
 *  }
 */
var views = function() {
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
}();

/**
 * create the locales
 */
var locales = _locales();

/**
 * routes with all the view and the url for each view.
 * Example:
 * {
 *  "about_us": {
 *      "es": "www.upplication.com/sobre-nosotros",
 *      "en": "www.upplication.com/about-us"
 *  }
 * }
 * Throw error if some url are duplicated in some other lang or view.
 */
var routes = function () {
    var langs = JSON.parse(fs.readFileSync('./app/locales/languages.json'));
    var BASE_PATH = envConfig.base_path;
    var routing = {};

    for (var view in views) {
        routing[view] = {};
        if (views.hasOwnProperty(view)) {
            langs.codes.forEach(function(code) {
                var  lang = code.language_country;
                try {
                    var url =  BASE_PATH + locales[lang][view]._url;

                    // try to validate its unique
                    for (var viewKey in routing) {
                        for (var langKey in routing[viewKey]){
                            if (url === routing[viewKey][langKey]){
                                gutil.log("Cant build Routes. The url:", gutil.colors.green(url),
                                    "in:", gutil.colors.green(view + "." + lang), "already exists in:",  gutil.colors.green(viewKey + "." + langKey));
                                throw new Error("The url: " + url + "already exists in view: " + viewKey + " with the lang: " + langKey);
                            }
                        }
                    }

                    routing[view][lang] = url;
                } catch(e) {
                    gutil.log("Cant build Routes. Error for the lang:", gutil.colors.green(lang), "and the view:",  gutil.colors.green(view), gutil.colors.red(e));
                    throw e;
                }
            });
        }
    }
    return routing;
}();

gulp.task('templates', function() {

    var getLocale = function(file) {
        var configJson = file.config.locals;
        var lang = file.config.lang;
        configJson.langs = JSON.parse(fs.readFileSync('./app/locales/languages.json'));
        configJson.lang = lang;
        configJson.localConfig = envConfig;
        configJson.routing = routes;
        configJson._template = path.basename(file.path, '.' + lang + '.jade');
        return configJson;
    };

    return gulp.src('./app/views/*.jade')
        .pipe(through2.obj(function(data, enc, cb) {
            var langs = JSON.parse(fs.readFileSync( './app/locales/languages.json'));
            var self = this;
            langs.codes.forEach(function(elem) {
                var dataLocale = data.clone();
                var viewName = path.basename(dataLocale.path, '.jade');
                var url = locales[elem.language_country][viewName]._url;
                dataLocale.path = path.dirname(dataLocale.path) + '/' + viewName + '.' + elem.language_country + '.jade';
                dataLocale.config = {
                    url: url,
                    lang: elem.language_country,
                    locals: locales[elem.language_country]
                };
                // exec the cb one by lang
                self.push(dataLocale);
            });
            cb();
        }))
        .pipe(data(function(file) {
            return getLocale(file);
        }))
        .pipe(jade({
            pretty: gutil.env.type !== 'production'
        }))
        .pipe(through2.obj(function(data, enc, cb) {
            data.path = path.dirname(data.path) + data.config.url + 'index.html';
            this.push(data);
            cb();
        }))
        .pipe(usemin({
            outputRelativePath: './',
            js: (gutil.env.type === 'production' ? [uglify, rev] : [sourcemaps.init, 'concat', sourcemaps.write]),
            css: (gutil.env.type === 'production' ? [cleanCSS, rev] : [sourcemaps.init, 'concat', sourcemaps.write]),
            less: (gutil.env.type === 'production' ? [less, cleanCSS, rev] : [sourcemaps.init, less, 'concat', sourcemaps.write])
        }))
        /*
         * try to replace in locales.json the @@config vars
         */
        .pipe(replace({
            patterns: [{
                json: envConfig
            }],
            prefix: '@@config.'
        }))
        .pipe(gulp.dest('./dist/'))
        .pipe(connect.reload());

});

gulp.task('bower', function() {
    return bower();
});

gulp.task('connect', function() {
    connect.server({
        root: 'dist',
        port: 9000,
        livereload: true
    });
});

gulp.task('onesky', function() {

    return gulp.src('./onesky.json')
        .pipe(onesky({
            projectId: '68574',
            sourceFile: ['default.json','terms.json']
        }))
        .pipe(gulp.dest('app/locales'))
});

gulp.task('clean', function() {
    return del(['dist']);
});

gulp.task('copy:images', function() {
    return gulp.src('./app/images/**',  { base: 'app' })
        .pipe(gulp.dest('./dist/'));
});

gulp.task('copy', function() {
    return gulp.src('./app/*')
        .pipe(gulp.dest('./dist/'));
});

gulp.task('watch', function () {
    gulp.watch(['./app/**/*.jade', './app/styles/**/*.css', './app/styles/less/**/*.less', './app/**/*.js', './app/locales/*.json'], ['templates']);
    gulp.watch(['./app/images/**'], ['copy:images']);
});

/**
 * generate routing.json
 */
gulp.task('routing', function () {
    return gulp
        .src('./app/locales/languages.json')
        .pipe(through2.obj(function (file, enc, callback) {
            var routeFile = new gutil.File({
                path: './routing.json',
                contents: new Buffer(JSON.stringify(routes, null, 4))
            });

            this.push(routeFile);
            callback();
        }))
        .pipe(gulp.dest("dist"));
});

/**
 * generate a sitemap.xml
 * The 'main url' is the first in languages.json.
 * If you want to override the priority you must to set the _priority key
 */
gulp.task('sitemap', function () {

    return gulp
        .src('./app/views/*.jade')
        .pipe(sitemap({basePath: envConfig.base_path}))
        .pipe(gulp.dest("dist"));

});

gulp.task('default', ['templates', 'bower', 'copy:images', 'copy', 'connect', 'sitemap', 'routing', 'watch']);
gulp.task('deploy', ['templates', 'bower', 'copy:images', 'copy', 'sitemap', 'routing']);

