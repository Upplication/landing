'use strict';

//
// common global functions
//

/**
 * log if the env is not production
 * @param text console.log this text
 */
var log = function (text) {
    if ($UPP.localConfig.env != "PRO") {
        console.log(text);
    }
};

/**
 * Get the cookie value from a concrete key
 * @param name Cookie name
 * @returns {String} val
 */
var getCookie = function (name) {
    var cookieValue = document.cookie,
        start = cookieValue.indexOf(" " + name + "=");
    if (start == -1) {
        start = cookieValue.indexOf(name + "=");
    }

    if (start == -1) {
        cookieValue = null;
    } else {
        start = cookieValue.indexOf("=", start) + 1;
        var end = cookieValue.indexOf(";", start);
        if (end == -1) {
            end = cookieValue.length;
        }
        cookieValue = unescape(cookieValue.substring(start, end));
    }

    return cookieValue;
};

/**
 * Set a cookie with a key and a value.
 * This cookie is for 10 years for the path / and the domain is not set and should pick up the current domain with subdmomain
 * @param name {String} key
 * @param value {String} value
 */
var setCookie = function (name, value) {
    var CookieDate = new Date,
        domain = '';
    CookieDate.setFullYear(CookieDate.getFullYear() + 10);

    if ($UPP.localConfig.env != "DES") {
        domain = " ;domain=" + document.domain;
    }

    var cookie = name + "=" + value + "; expires=" + CookieDate.toGMTString() + ";path=/"; //+ domain + ";path=/";
    log("cookie=" + cookie);
    document.cookie = cookie;
};

/**
 * Check if the current lang page is the user
 * preference lang and change it if is not the
 * same.
 *
 * If the user dont have a preference lang, then
 * the browser lang is used.
 *
 * http://www.w3schools.com/tags/ref_language_codes.asp
 * https://www.w3schools.com/tags/ref_country_codes.asp
 *
 * @param current_lang the current page lang in format like 'es-ES' or 'en-EN'
 * @param routing a map with the views and langs available
 * @param view the current page view
 */
var checkLanguage = function (current_lang, routing, view) {

    var langCookie = getCookie("upp_language"),
        browserLang = window.navigator.userLanguage || window.navigator.language,
        location;

    log("current lang : " + current_lang);
    log("lang cookie : " + langCookie);
    log("browser lang : " + browserLang);
    log("current location : " + window.location);

    if (!browserLang ||
            // see: https://perishablepress.com/list-all-user-agents-top-search-engines/
            // tests: https://regex101.com/r/kX6zN9/1
            /googlebot|adsbot-google|mediapartners-google|aolbuild|baidu|bingbot|bingpreview|msnbot|duckduckgo|teoma|slurp|yandex|bot|spider|robot|crawl/i.test(window.navigator.userAgent)) {
        // if we dont have browserLang because we are a bot or
        // some old browser we dont change the current url.
        return;
    }

    var userLang = langCookie || browserLang;

    if (userLang !== current_lang) {
        //Redirect to lang cookie version
        location = routing[view][userLang];
        // if not found full concrete website, use the language part only
        if (!location && userLang.substring(0, 2) !== current_lang.substring(0, 2)) {
            location = routing[view][userLang.substring(0, 2)];
        }

        if (!langCookie) {
            setCookie("upp_language", browserLang);
        }

        log("Location -> " + location);
        log("Routing -> ");
        log(routing);
    }

    if (location) {
        log("Redirecting to -> " + location);
        window.location = location + window.location.hash;
    }
};