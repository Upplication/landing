'use strict';

var crypto = require('crypto');
var gutil = require('gulp-util');
var path = require('path');
var request = require('request-promise');
var through2 = require('through2');
var Promise = require("bluebird");

module.exports = function (opts) {

    opts = opts || {};

    if (!opts.projectId)
        throw new gutil.PluginError('gulp-onesky', 'please specify project id');

    if (!opts.sourceFile)
        throw new gutil.PluginError('gulp-onesky', 'please specify source file name');

    return through2.obj(function(file, enc, callback) {

        var stream = this;

        if (file.isNull()) {
            // nothing to do
            stream.emit('error', new gutil.PluginError('gulp-onesky', 'crendetials not provided'));
            return;
        }

        var credentials = JSON.parse(file.contents);
        var secret = credentials.secretKey;
        var key = credentials.publicKey;

        if (!secret || !key){
            stream.emit('error', new gutil.PluginError('gulp-onesky', 'secretKey and publicKey are mandatory'));
            return;
        }

        var requests = [];
        var time = Math.floor(Date.now() / 1000);
        var hash = crypto.createHash('md5').update('' + time + secret).digest('hex');
        var url = 'https://platform.api.onesky.io/1/projects/' + opts.projectId +
            '/translations/multilingual';

        opts.sourceFile.forEach(function(file) {

            var qs = {
                'api_key': key,
                'timestamp': time,
                'dev_hash': hash,
                'file_format': 'I18NEXT_MULTILINGUAL_JSON',
                'source_file_name': file
            };

            requests.push(
                request({ uri: url, qs: qs, json: true})
                .then(function (body) {
                    Object.keys(body).forEach(function(lang) {
                        stream.push(new gutil.File({
                            path: path.join(file.replace('.json', '') + '_' + lang + '.json'),
                            contents: new Buffer(JSON.stringify(body[lang].translation, null, 2))
                        }));
                    });
                })
                .catch(function(err) {
                    stream.emit('error', new gutil.PluginError('gulp-onesky',err));
                })
            );
        });

        Promise.all(requests).then(function() {
            callback();
        });
    });
};