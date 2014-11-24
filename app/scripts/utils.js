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

var updateVisitInfo = function () {
    localStorage.numVisits = (parseInt(localStorage.numVisits) || 0) + 1;
}
/**
 * get the cookie value from a concrete key
 * @param c_name key
 * @returns {String} val
 */
var getCookie = function (c_name) {
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start == -1) {
        c_start = c_value.indexOf(c_name + "=");
    }

    if (c_start == -1) {
        c_value = null;
    } else {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end == -1) {
            c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start, c_end));
    }
    return c_value;
}
/**
 * set a cookie with a key and a value.
 * This cookie is for 10 years for the path / and the domain is not set and should pick up the current domain with subdmomain
 * @param c_name {String} key
 * @param c_value {String} value
 */
var setCookie = function (c_name, c_value) {
    var CookieDate = new Date;
    CookieDate.setFullYear(CookieDate.getFullYear() + 10);
    var domain = "";

    if ($UPP.localConfig.env != "DES") {
        domain = " ;domain=" + document.domain;
    }
    var aux = c_name + "=" + c_value + "; expires=" + CookieDate.toGMTString() + ";path=/"; //+ domain + ";path=/";
    log("aux=" + aux);
    document.cookie = aux;
};


var checkLanguage = function () {
    var lang_cookie = getCookie("ppl_language"),
        location, browser_lang, lang;

    if (lang_cookie) {
        //CHECK IF CURRENT LANG != LANG COOKIE
        if (lang_cookie.substring(0, 2) !== current_lang.substring(0, 2)) {
            //Redirect to lang cookie version
            location = routing[view][lang_cookie];

            log("Hay cookie -> " + location);
            log("Routing -> " + routing);
            //debugger
            if (location) {
                window.location = location;
            }
        }
    } else {
        browser_lang = window.navigator.userLanguage || window.navigator.language;
        //CHECK BROWSER PREFERENCES
        if (browser_lang !== current_lang.substring(0, 2)) {
            //TODO: improve this , not manually
            //Redirect to browser lang
            lang = "";
            if (browser_lang == "es") {
                lang = "es_ES";
                setCookie("ppl_language", "es-ES");
            } else {
                lang = "en_EN";
                setCookie("ppl_language", "en-EN");
            }
            location = routing[view][lang];
            log("No hay cookie -> " + location);

            if (location) {
                window.location = location;
            }
        }
    }
};

var closeCookies = function () {
    setCookie("showed-cookies", "true");
    $("#cookies").removeClass('show');
};