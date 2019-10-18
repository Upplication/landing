var gulp = require('gulp');
var fs = require('fs');
var jade = require('gulp-jade');
var data = require('gulp-data');
var path = require('path');
var through2 = require('through2');
var revReplace = require('gulp-rev-replace');
var connect = require('gulp-connect');
var replace = require('gulp-replace-task');
var uglify = require('gulp-uglify');
var cleanCSS = require('gulp-clean-css');
var rev = require('gulp-rev');
var del = require('del');
var gutil = require('gulp-util');
var less = require('gulp-less');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
var concat = require('gulp-concat');
var minifyInline = require('gulp-minify-inline');
var revdel = require('gulp-rev-delete-original');
var merge = require('merge-stream');
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
                                throw new Error("The url: " + url + " already exists in view: " + viewKey + " with the lang: " + langKey);
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

gulp.task('vendor:js', function() {
    var baseTask =
        gulp.src([
            './node_modules/@bower_components/jquery/dist/jquery.min.js',
            './node_modules/@bower_components/materialize/dist/js/materialize.min.js',
            './node_modules/@bower_components/owl.carousel/dist/owl.carousel.min.js',
            './node_modules/@bower_components/aos/dist/aos.js'
            ])
            .pipe(gutil.env.mode !== 'production' ? sourcemaps.init() : gutil.noop())
            .pipe(concat('base.js'))
            .pipe(gutil.env.mode !== 'production' ? sourcemaps.write() : gutil.noop())
            .pipe(gulp.dest('./dist/scripts/vendor'));

    var vodafoneTask =
        gulp.src([
            './node_modules/@bower_components/jquery/dist/jquery.min.js',
            './node_modules/@bower_components/materialize/dist/js/materialize.min.js'
            ])
            .pipe(gutil.env.mode !== 'production' ? sourcemaps.init() : gutil.noop())
            .pipe(concat('vodafone.js'))
            .pipe(gutil.env.mode !== 'production' ? sourcemaps.write() : gutil.noop())
            .pipe(gulp.dest('./dist/scripts/vendor'));


    // add all bower_components
    var vendorTask =
        gulp.src('./node_modules/@bower_components/**/*.js')
            .pipe(gulp.dest('./dist/bower_components'));


    return merge([baseTask, vodafoneTask, vendorTask]);
});

gulp.task('vendor:css', function() {
    var baseTask =
        gulp.src([
            './node_modules/@bower_components/upplication-icons/dist/upplication/upplication-icons.css',
            './node_modules/@bower_components/materialize/dist/css/materialize.min.css',
            './node_modules/@bower_components/owl.carousel/dist/assets/owl.carousel.min.css',
            './node_modules/@bower_components/aos/dist/aos.css'
            ])
            .pipe(gutil.env.mode !== 'production' ? sourcemaps.init() : gutil.noop())
            .pipe(concat('base.css'))
            .pipe(gutil.env.mode !== 'production' ? sourcemaps.write() : gutil.noop())
            .pipe(gulp.dest('./dist/styles/vendor'));

    var vodafoneTask =
        gulp.src([
            './node_modules/@bower_components/upplication-icons/dist/wingu/wingu-icons.css',
            './node_modules/@bower_components/materialize/dist/css/materialize.min.css'
            ])
            .pipe(gutil.env.mode !== 'production' ? sourcemaps.init() : gutil.noop())
            .pipe(concat('vodafone.css'))
            .pipe(gutil.env.mode !== 'production' ? sourcemaps.write() : gutil.noop())
            .pipe(gulp.dest('./dist/styles/vendor'));

    // add all bower_components
    var vendorTask =
        gulp.src('./node_modules/@bower_components/**/*.css')
            .pipe(gulp.dest('./dist/bower_components'));

    return merge([baseTask, vodafoneTask, vendorTask]);
});

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
            pretty: gutil.env.mode !== 'production'
        }))
        .pipe(through2.obj(function(data, enc, cb) {
            data.path = path.dirname(data.path) + data.config.url + 'index.html';
            this.push(data);
            cb();
        }))
        .pipe(replace({
            patterns: [{
                json: envConfig
            }],
            prefix: '@@config.'
        }))
        .pipe(gulp.dest('./dist/'))
        .pipe(gutil.env.mode !== 'production' ? connect.reload() : gutil.noop());
});

gulp.task('scripts', function() {

    var stylesPath = "./app/scripts";

    function getFolders(dir) {
        return fs.readdirSync(dir)
            .filter(function(file) {
                return fs.statSync(path.join(dir, file)).isDirectory();
            });
    }

    var folders = getFolders(stylesPath);
    var tasks = folders.map(function(folder) {
        return gulp.src(path.join(stylesPath, folder, '/**/*.js'))
            .pipe(gutil.env.mode !== 'production' ? sourcemaps.init() : gutil.noop())
            .pipe(concat(folder + '.js'))
            .pipe(gutil.env.mode !== 'production' ? sourcemaps.write() : gutil.noop())
            .pipe(gulp.dest("./dist/scripts"))
            .pipe(gutil.env.mode !== 'production' ? connect.reload() : gutil.noop())
    });

    return merge(tasks);
});

gulp.task('post', ['rev:scripts', 'rev:styles', 'templates'], function() {
    if (gutil.env.mode === 'production') {
        return gulp.src([
                '!./node_modules/@bower_components/**/*',
                './dist/**/*.html'
            ])
            .pipe(revReplace({manifest: gulp.src("./dist/rev-manifest-*.json")}))
            .pipe(minifyInline())
            .pipe(gulp.dest('./dist/'));
    } else {
        gutil.log("Skipped",  gutil.colors.cyan("'post'"), "task when", gutil.colors.green("--mode=production"), "not present");
    }
});

gulp.task('rev:scripts', ['scripts'], function() {
    if (gutil.env.mode === 'production') {
        return gulp.src('./dist/scripts/**/*.js')
            .pipe(uglify())
            .pipe(rev())
            .pipe(revdel())
            .pipe(gulp.dest('./dist/scripts'))
            .pipe(rev.manifest('rev-manifest-js.json'))
            .pipe(gulp.dest("./dist"))
    } else {
        gutil.log("Skipped",  gutil.colors.cyan("'rev:scripts'"), "task when", gutil.colors.green("--mode=production"), "not present");
    }
});

gulp.task('rev:styles', ['styles'], function() {
    if (gutil.env.mode === 'production') {
        return gulp.src('./dist/styles/**/*.css')
            .pipe(cleanCSS({processImport: false}))// not process import because a timeout error:
            .pipe(rev())
            .pipe(revdel())
            .pipe(gulp.dest('./dist/styles'))
            .pipe(rev.manifest('rev-manifest-css.json'))
            .pipe(gulp.dest("./dist"))
    } else {
        gutil.log("Skipped",  gutil.colors.cyan("'rev:styles'"), "task when", gutil.colors.green("--mode=production"), "not present");
    }
});

gulp.task('styles', function() {
    return gulp.src("./app/styles/less/**/[^_]*.less")
        .pipe(gutil.env.mode !== 'production' ?  sourcemaps.init() : gutil.noop())
        .pipe(less())
        .pipe(gutil.env.mode !== 'production' ? sourcemaps.write() : gutil.noop())
        .pipe(replace({
            patterns: [{
                json: envConfig
            }],
            prefix: '@@config.'
        }))
        .pipe(gulp.dest("./dist/styles"))
        .pipe(gutil.env.mode !== 'production' ? connect.reload() : gutil.noop());
});

gulp.task('connect', ['templates'], function() {
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
            sourceFile: ['default.json','terms.json', 'aplicateca_terms.json', 'home.json', 'successful.json']
        }))
        .pipe(gulp.dest('app/locales'))
});

gulp.task('clean', function() {
    return del(['dist']);
});

gulp.task('copy:images', function() {
    return gulp.src('./app/images/**',  { base: 'app' })
        .pipe(gutil.env.mode === 'production' ? imagemin() : gutil.noop())
        .pipe(gulp.dest('./dist/'));
});

gulp.task('copy', function() {
    return gulp.src('./app/*')
        .pipe(gulp.dest('./dist/'));
});

gulp.task('watch', function () {
    if (gutil.env.mode !== 'production') {
        gulp.watch(['./app/**/*.jade', './app/locales/*.json'], ['templates']);
        gulp.watch(['./app/styles/less/**/*.less'], ['styles']);
        gulp.watch(['./app/**/*.js'], ['scripts']);
        gulp.watch(['./app/images/**'], ['copy:images']);
    } else {
        gutil.log("Skipped",  gutil.colors.cyan("'watch'"), "task when", gutil.colors.green("--mode=production"));
    }

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

gulp.task('default', ['templates', 'styles', 'scripts', 'post', 'vendor:js', 'vendor:css', 'copy:images', 'copy', 'sitemap', 'routing', 'connect', 'watch']);
gulp.task('deploy', ['templates', 'styles', 'scripts', 'post', 'vendor:js', 'vendor:css', 'copy:images', 'copy', 'sitemap', 'routing']);

