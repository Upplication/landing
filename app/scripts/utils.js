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
 * @param current_lang the current page lang
 * @param routing a map with the views and langs available
 * @param view the current page view
 */
var checkLanguage = function (current_lang, routing, view) {
    var langCookie = getCookie("ppl_language"),
        location, browserLang, lang;

    if (langCookie) {
        //CHECK IF CURRENT LANG != LANG COOKIE
        if (langCookie.substring(0, 2) !== current_lang.substring(0, 2)) {
            //Redirect to lang cookie version
            location = routing[view][langCookie];
            log("Location in cookie -> " + location);
            log("Routing -> ");
            log(routing);

            if (location) {
                window.location = location;
            }
        }
    } else {
        browserLang = window.navigator.userLanguage || window.navigator.language;
        //CHECK BROWSER PREFERENCES
        if (browserLang !== current_lang.substring(0, 2)) {
            //TODO: improve this , not manually
            //Redirect to browser lang
            lang = "";
            if (browserLang == "es") {
                lang = "es_ES";
                setCookie("ppl_language", "es-ES");
            } else {
                lang = "en_EN";
                setCookie("ppl_language", "en-EN");
            }
            location = routing[view][lang];
            log("Location in cookie -> " + location);
        }
    }

    if (location) {
        log("Redirecting to -> " + location);
        window.location = location + window.location.hash;
    }
};