
Zepto(function ($) {
    'use strict';

    var lang_elems = $(".change-lang li[data-lang]"),
        lang;

    //Add dynamic translations
    for (var i = 0; i < lang_elems.length; i++) {
        lang = $(lang_elems[i]).data("lang");

        //Change lang_cookie
        $(".change-lang li[data-lang='" + lang + "'] a").click(function () {
            setCookie("ppl_language", $(this).parent().data("lang"));
            log("Cambio lang a =" + $(this).parent().data("lang"));
        });
    }
    //Stilize current language
    $(".change-lang li[data-lang='" + $("body").attr("data-lang") + "'] a").css("font-weight", "800 !important");

    //Display cookies announce
    if (!getCookie("showed-cookies")) {
        $("#cookies").addClass("show");
    }

    var registerSuccessCallback = function (fn, submit) {
        return function(data) {
            // end loading
            $(this).find("input").prop("disabled", false);
            submit.val(submit.data("text"));

            if (data.success) {
                window.location = DASHBOARD_PATH + "/web" + data.url;
            } else {
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
                        console.log(ajax.error[10]);
                        break;
                }

                fn(this, error);
            }
        };
    };

    var registerErrorCallback = function(submit) {
        return function (xhr, type) {
            console.log(xhr);
            // end loading
            $(this).find("input").prop("disabled", false);
            submit.val(submit.data("text"));

            $.magnificPopup.open({
                items: {
                    src: '#ajax-error-popup',
                    type: 'inline'

                },
                callbacks: {
                    close: function () {
                        // Will fire when popup is closed
                        $.magnificPopup.close();
                    }
                }
            });
        };
    };

    //Register form through AJAX
    //Validation done in HTML5 (patterns, minlength, etc)
    $("form[name='register']").submit(function (e) {
        e.preventDefault();

        var $form = $(this);
        // mixpanel store automatically the utm_* vars and store in a cookie
        $.each(["utm_source", "utm_campaign", "utm_medium", "utm_content"], function (i, val) {
            if (mixpanel.get_property(val)) {
                var $utm = $("<input>")
                    .attr("type", "hidden")
                    .attr("name", val).val(mixpanel.get_property(val));
                $form.append($utm);
            }
        });

        var url = DASHBOARD_PATH + "/web/register";
        var data = $form.serialize();

        log("URL: " + url);
        log("Data to send:" + data);
        // loading
        $(this).find("input").prop("disabled", true);
        var submit = $(this).find("input[type='submit']");

        submit.val(submit.data("loading"));

        $.ajax({
            type: "GET", // jsonp only work with get
            url: url,
            data: data,
            context: this,
            dataType: "jsonp",
            success: registerSuccessCallback(function(form, error) {
                var $email = $(form).find("[for=email]"),
                $appName = $(form).find("[for=appName]"),
                $seller = $(form).find("[for=seller]");

                if (error.email) {
                    $email.find('p.error').text(error.email);
                    $email.find('p.error').show();
                    $email.find('input').addClass("error");
                }

                if (error.appName) {
                    $appName.find('p.error').text(error.appName);
                    $appName.find('p.error').show();
                    $appName.find('input').addClass("error");
                }

                if (error.seller) {
                    $seller.find('p.error').text(error.seller);
                    $seller.find('p.error').show();
                    $seller.find('input').addClass("error");
                }
            }, submit),
            error: registerErrorCallback(submit)
        });
    });

    //Hide errors on input fields when it is modified
    $("[name='register'] input").on('keypress', function () {
        $(this).siblings("p.error").hide();
        $(this).removeClass("error");
    });

    //Register form through AJAX
    //Validation done in HTML5 (patterns, minlength, etc)
    $("form[name='signup']").submit(function (e) {
        e.preventDefault();

        var $form = $(this);
        // mixpanel store automatically the utm_* vars and store in a cookie
        $.each(["utm_source", "utm_campaign", "utm_medium", "utm_content"], function (i, val) {
            if (mixpanel.get_property(val)) {
                var $utm = $("<input>")
                    .attr("type", "hidden")
                    .attr("name", val).val(mixpanel.get_property(val));
                $form.append($utm);
            }
        });

        var url = DASHBOARD_PATH + "/web/register";
        var data = $form.serialize();

        log("URL: " + url);
        log("Data to send:" + data);
        // loading
        $(this).find("input").prop("disabled", true);
        var submit = $(this).find("input[type='submit']");

        submit.val(submit.data("loading"));

        $.ajax({
            type: "GET", // jsonp only work with get
            url: url,
            data: data,
            context: this,
            dataType: "jsonp",
            success: registerSuccessCallback(function(form, error) {
                var $email = $(form).find('[data-for="email"]'),
                    $appName = $(form).find('[data-for="appName"]'),
                    $seller = $(form).find('[data-for="seller"]');

                if (error.email) {
                    $email.text(error.email);
                    $email.show();
                    $('[name=email]').addClass("error");
                }

                if (error.appName) {
                    $appName.text(error.appName);
                    $appName.show();
                    $('[name=appName]').addClass("error");
                }

                if (error.seller) {
                    $seller.text(error.seller);
                    $seller.show();
                    $('[name=seller]').addClass("error");
                }
            }, submit),
            error: registerErrorCallback(submit)
        });
    });

    //Hide errors on input fields when it is modified
    $("[name='signup'] input").on('keypress', function () {
        $(this).siblings("p.error").hide();
        $(this).removeClass("error");
    });

    //Display sidebar menu in mobile
    var toogleMenu = function () {
        var $outer = $("div.outer-wrap");
        if ($outer.css("height") == "100%") {
            $outer.css("height", "auto");
        }
        else {
            $outer.css("height", "100%");
            $(".slide-pannel.effects").toggleClass("slide-right");
        }
    };

    $(".icon-list").on("click", toogleMenu);

    // youtube are only present in one page
    if ($('#youtube-video').length > 0) {
        $('#youtube-video').magnificPopup({
            type: 'inline',
            midClick: true
        });
    }

    if ($('#ajax-error-popup').length > 0) {
        $('#ajax-error-popup').magnificPopup({
            type: 'inline'
        });
    }
});

// Register screen plugin
(function(global, window, document) {
    'use strict';

    var signupScreen;

    /**
     * Display fields to enter a seller code
     */
    var showSellerForm = function(e) {
        var field = document.getElementById('app-seller'),
            form = document.getElementById('signup-form'),
            input = document.getElementById('seller-input'),
            link = document.getElementById('without-seller-code');

        field.className = field.className.replace('closed', '');
        e.target.className += ' display-none';
        link.className = link.className.replace('display-none', '');
        form.className += ' force-vertical';

        input.required = 'required';

        e.preventDefault();
        e.stopPropagation();
    };

    var hideSellerForm = function(e) {
        var field = document.getElementById('app-seller'),
            form = document.getElementById('signup-form'),
            input = document.getElementById('seller-input'),
            link = document.getElementById('seller-code'),
            targetLink = document.getElementById('without-seller-code');

        field.className += ' closed';
        input.value = '';
        targetLink.className += ' display-none';
        link.className = link.className.replace('display-none', '');
        form.className = form.className.replace('force-vertical', '');

        input.removeAttribute('required');

        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    /**
     * Shows the signup screen
     */
    var showSignupScreen = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        signupScreen.className = 'animated fadeIn';
    };

    /**
     * Closes the signup screen
     */
    var closeSignupScreen = function(e) {
        signupScreen.className = 'animated fadeOut';
        window.setTimeout(function() {
            signupScreen.className = 'closed';
            hideSellerForm();
        }, 301);

        e.preventDefault();
        e.stopPropagation();
    };

    // Setup click listeners for the signup screen triggers when the 
    // dom content has been loaded
    window.addEventListener('DOMContentLoaded', function() {
        var triggers = document.getElementsByClassName('triggers-signup'),
            closers = document.getElementsByClassName('btn-signup-close');

        signupScreen = document.getElementById('signup-screen');

        for (var i = 0; i < triggers.length; i++) {
            triggers[i].addEventListener('click', showSignupScreen);
        }

        for (var i = 0; i < closers.length; i++) {
            closers[i].addEventListener('click', closeSignupScreen);
        }

        document.getElementById('seller-code').addEventListener('click', showSellerForm);
        document.getElementById('without-seller-code').addEventListener('click', hideSellerForm);
    });
})(this, window, document);