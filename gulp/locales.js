var fs = require('fs');
var path = require('path');
var _ = require('lodash');

/**
 * create the locales for pug
 * {
 *  "es": {content...},
 *  "en": {content...}
 * }
 */
module.exports = function() {

    var langs = JSON.parse(fs.readFileSync( './app/locales/languages.json'));
    var result = {};
    var defaultLocale = {};

    fs.readdirSync('./app/locales/').forEach(function(locale){
        if (path.basename(locale, '.json').indexOf('_' + langs.default) > 0) {
            _.merge(defaultLocale, JSON.parse(fs.readFileSync('./app/locales/' + locale)));
        }
    });

    result[langs.default] = defaultLocale;

    langs.codes.forEach(function(elem) {
        var lang = elem.language_country;
        if (langs.default != lang) {
            var localeGrouped = {};
            fs.readdirSync('./app/locales/').forEach(function(locale){
                if (langs.default != lang && path.basename(locale, '.json').indexOf('_' + lang) > 0) {
                    _.merge(localeGrouped, JSON.parse(fs.readFileSync('./app/locales/' + locale)));
                }
            });

            // fullfill with the default
            localeGrouped = _.merge({}, defaultLocale, localeGrouped);
            result[lang] = localeGrouped;
        }
    });
    return result;
};