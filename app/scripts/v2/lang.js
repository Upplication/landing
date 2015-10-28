/**
 * Save the lang when it is clicked to store as default lang for the user.
 *
 * depends on scripts/utils.js
 */
$(function () {
    var setupLang = function(){
        var $langElem = $("a.lang-link[data-lang]");
        //Add dynamic translations
        var lang = $langElem.data("lang");
        //Change lang_cookie
        $langElem.click(function () {
            setCookie("ppl_language", $(this).data("lang"));
            log("change lang to =" + $(this).data("lang"));
        });
        //Display cookies announce
        if (!getCookie("showed-cookies")) {
            $("#cookies").addClass("show");
        }
    };

    setupLang();
});