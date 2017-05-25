'use strict';

var upplication = function ($, document, window) {
    /**
     * analytics implemented by Segment.IO
     * @see https://segment.io/docs/libraries/analytics.js/
     * @type {*}
     */
    var tracker = window.analytics || {};

    var _global_properties = {};

    var _log = function (text) {
        if ($UPP.localConfig.env != "PRO") {
            console.log(text);
        }
    };

    var _add_global = function (props) {
        for (var prop in _global_properties) {
            if (_global_properties.hasOwnProperty(prop)) {
                if (!props[prop]) {
                    props[prop] = _global_properties[prop];
                }
            }
        }
        return props;
    };

    var track = function (event, props, cb) {
        props = _add_global(props);
        tracker && tracker.track && tracker.track(event, props, cb);
    };

    var identify = function (userId, traits) {
        _log("Identificating the user:" + userId + " with traits: " + traits);
        tracker.identify(userId, traits);
    };

    var track_links = function (element_id, event, properties) {
        $(document).ready(function () {
            var $element = $(element_id)
            if ($element) {
                properties = _add_global(properties);
                $element.each(function (i, elem) {
                    tracker.trackLink(elem, event, properties);
                    _log("Trackeando link: " + element_id);
                });
            }
        });
    };

    var track_forms = function (element_id, event, properties) {
        $(document).ready(function () {
            var $element = $(element_id);
            if (should_track && $element) {
                properties = _add_global(properties);
                $element.each(function (i, elem) {
                    tracker.trackForm(elem, event, properties);
                    _log("Trackeando link: " + element_id);
                });
            }
        });
    };

    return {
        /**
         * track a event
         * @param event the name of the event
         * @param props properties associated
         * @param cb callback the callback
         */
        track: track,
        /**
         * identify a concrete user
         * https://segment.com/docs/integrations/mixpanel/#identify
         * @param userId unique id
         * @param traits A dictionary of traits you know about the user, like their email or name. You can read more about traits in the identify reference.
         */
        identify: identify,
        track_links: track_links,
        track_forms: track_forms
    };

}($, document, window);

