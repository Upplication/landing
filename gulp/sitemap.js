'use strict';

var gutil = require('gulp-util');
var path = require('path');
var through2 = require('through2');
var fs = require('fs');
var _locales = require('./locales');

module.exports = function (opts) {

    var concat = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n' +
        '\txmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

    var dateformat = require('dateformat');
    var langs = JSON.parse(fs.readFileSync('./app/locales/languages.json'));
    var locales = _locales();

    function bufferContents(file, enc, cb) {

        if (!opts.basePath){
            this.emit('error', new gutil.PluginError('gulp-sitemap', 'basePath is mandatory'));
            cb();
            return;
        }

        // ignore empty files
        if (file.isNull()) {
            cb();
            return;
        }

        // we don't do streams (yet)
        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-sitemap',  'Streaming not supported'));
            cb();
            return;
        }

        var view = path.basename(file.path, '.jade');

        var first = true;
        var priority = '0.5';
        langs.codes.forEach(function(code) {
            var lang = code.language_country;
            var viewConfig = locales[lang][view];

            if (viewConfig._sitemap === false) {
                gutil.log("sitemap skipped for url: " + viewConfig._url);
                return;
            }

            var url = opts.basePath + viewConfig._url;
            if (url.indexOf("http") != 0) {
                url = "https:" + url;
            }

            if (first){
                concat += '\t<url>\n\t\t<loc>' + url + '</loc>\n';
                if (viewConfig._priority)
                    priority = viewConfig._priority;
                first = false;
            }
            concat += '\t\t<xhtml:link rel="alternate" hreflang="' + lang + '" href="' + url + '"/>\n';
        });

        concat += '\t\t<lastmod>' + dateformat(fs.statSync(file.path).mtime, 'yyyy-mm-dd') +'</lastmod>\n';
        concat += '\t\t<priority>' + priority + '</priority>\n';
        concat += '\t</url>\n';

        cb();
    }

    function endStream(cb) {

        concat += '</urlset>';

        var joined = new gutil.File({
            path: './sitemap.xml',
            contents: new Buffer(concat)
        });

        this.push(joined);
        cb();
    }

    return through2.obj(bufferContents, endStream);
};