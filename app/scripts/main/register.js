/**
 * Register form setup with:
 * - utm parameters
 * - ajax register with error codes
 * - the form must have a concrete structure:
 *      form(name='register')
 *          p(class='general-error') with general error code
 *          input(name=appName|email|password)
 *          p(class='register-appName-error|register-email-error|register-password-error') with concrete error for the input
 *
 *          submit(data-text="default text", data-loading="loading text", value=optional***)
 *              span text (optional)***
 * *** span text or value must exist to set the text of the submit button|input
 *
 * depends on scripts/utils.js
 */
$(function () {
    'use strict';

    var UTM_PARAMS = ["utm_source", "utm_campaign", "utm_medium", "utm_content"];

    /**
     * Adds the UTM parameters to the given form.
     * @param {jQuery} $form Form where the params will be appended
     */
    var addUtmParamsToForm = function ($form) {
        $.each(UTM_PARAMS, function (i, val) {
            var utmVal = getCookie(val);
            if (utmVal) {
                var $utm = $("<input>")
                    .attr("type", "hidden")
                    .attr("name", val).val(utmVal);
                $form.append($utm);
            }
        });
    };

    /**
     * Adds the UTM parameters to the given url
     * @param {String} url with utm params at login
     */
    var addUtmParamsToUrl = function (url) {
        var params = "&";
        if (url.indexOf("?") == -1) {
            params = "?";
        }

        $.each(UTM_PARAMS, function (i, val) {
            var utmVal = getCookie(val);
            if (utmVal) {
                params += val + "=" + utmVal + "&";
            }
        });

        url += params.substring(0, params.length - 1);

        return url;
    };

    var setup = function () {

        var registerSuccessCallback = function (fn, submit) {
            return function (data) {
                if (data.success) {
                    Topic.fire("register-success");
					window.setTimeout(function(){
						window.location = addUtmParamsToUrl(DASHBOARD_PATH + "/web" + data.url);
					}, 400);
                } else {
                    $(this).find("input").prop("disabled", false);

                    submit.val(submit.data("text"));
                    var $innerSpan = submit.find("span");
                    if ($innerSpan.length > 0) {
                        $innerSpan.text(submit.data("text"));
                    }

                    submit.prop("disabled", false);
                    var error = {};

                    switch (data.case) {
                        case 2:
                            //CREATING_APPREQUEST_ERROR
                            error.appName = ajax.error[2];
                            break;
                        case 3:
                            //DUPLICATE_EMAIL_ERROR
                            error.email = ajax.error[3];
                            break;
                        case 4:
                            //DUPLICATE_NAME_ERROR
                            error.appName = ajax.error[4];
                            break;
                        case 5:
                            //SELLER_ERROR
                            error.seller = ajax.error[5];
                            break;
                        case 6:
                            //DUPLICATE_NAME_AND_DUPLICATED_EMAIL_ERROR
                            error.email = ajax.error[3];
                            error.appName = ajax.error[4];
                            break;
                        case 7:
                            //DUPLICATE_NAME_AND_SELLER_ERROR
                            error.appName = ajax.error[4];
                            error.seller = ajax.error[5];
                            break;
                        case 8:
                            //DUPLICATE_EMAIL_AND_SELLER_ERROR
                            error.email = ajax.error[3];
                            error.seller = ajax.error[5];
                            break;
                        case 9:
                            //DUPLICATE_NAME_AND_DUPLICATED_EMAIL_AND_SELLER_ERROR
                            error.email = ajax.error[3];
                            error.appName = ajax.error[4];
                            error.seller = ajax.error[5];
                            break;
                        case 10:
                            //SOME_PARAMETER_NULL_ERROR
                            error.general = ajax.error[10];
                            break;
                    }

                    fn(this, error);
                }
            };
        };

        var registerErrorCallback = function (submit) {
            return function (xhr) {
                // end loading
                $(this).find("input").prop("disabled", false);

                submit.val(submit.data("text"));
                var $innerSpan = submit.find("span");
                if ($innerSpan.length > 0) {
                    $innerSpan.text(submit.data("text"));
                }

                submit.prop("disabled", false);

                $(this).find(".general-error").show();
            };
        };

        //Register form through AJAX
        //Validation done in HTML5 (patterns, minlength, etc)
        $("form[name='register']").submit(function (e) {
            e.preventDefault();
            e.stopPropagation();

            $(this).find(".general-error").hide();

            var $form = $(this);
            addUtmParamsToForm($form);

            var url = DASHBOARD_PATH + "/web/register";
            var data = $form.serialize();
            if (!data) return;

            log("URL: " + url);
            log("Data to send:" + data);
            // loading
            $(this).find("input").prop("disabled", true);
            var submit = $(this).find("[type='submit']");

            submit.val(submit.data("loading"));
            var $innerSpan = submit.find("span");
            if ($innerSpan.length > 0) {
                $innerSpan.text(submit.data("loading"));
            }

            submit.prop("disabled", true);
            $.ajax({
                type: "GET", // jsonp only work with get
                url: url,
                data: data,
                context: this,
                dataType: "jsonp",
                success: registerSuccessCallback(function (form, error) {
                    var $emailError = $(form).find(".register-email-error"),
                        $appNameError = $(form).find(".register-appName-error"),
                        $sellerError = $(form).find(".register-seller-error");

                    if (error.email) {
                        $emailError.text(error.email);
                        $emailError.show();
                        $(form).find('input[name=email]').addClass("error");
                    }

                    if (error.appName) {
                        $appNameError.text(error.appName);
                        $appNameError.show();
                        $(form).find('input[name=appName]').addClass("error");
                    }

                    if (error.seller) {
                        $sellerError.text(error.seller);
                        $sellerError.show();
                        $(form).find('input[name=seller]').addClass("error");
                    }

                    if (error.general) {
                        $(form).find(".general-error").show();
                    }

                }, submit),
                error: registerErrorCallback(submit)
            });
        });

        //Hide errors on input fields when it is modified
        $("[name='register'] input").on('keypress', function () {
            $(this).siblings(".error").hide();
            $(this).siblings().find(".error").hide();
            $(this).removeClass("error");
        });
    };

    /**
     * Tracks the UTM tracking with cookies.
     */
    var setupUTMTracking = function () {
        var params = window.location.search.replace('?', '').split('&');
        for (var i = 0, len = params.length; i < len; i++) {
            var paramParts = params[i].split('=');

            if (UTM_PARAMS.indexOf(paramParts[0]) !== -1) {
                setCookie(paramParts[0], paramParts[1]);
            }
        }
    };

    setup();
    setupUTMTracking();

    // configure modal register (if exists)
    if ($.fn.leanModal)
        $('.modal-trigger').leanModal({opacity: .7});
});