/**
 * provide the functions to show or hide
 * the cookies warning.
 *
 * must exists a html with an id: 'cookies' and must
 * exist a close button with id: 'cookies-accept'
 * to accept the cookies policies and close the message.
 *
 * depends on scripts/utils.js
 */
$(function() {
    'use strict';
    // Display cookies announce
    if (!getCookie("showed-cookies")) {
        $("#cookies").addClass("show");
    }

    $("#cookies-accept").click(function() {
        setCookie("showed-cookies", "true");
        $("#cookies").removeClass('show');
    });
});