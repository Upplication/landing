Zepto(function ($) {
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
        var langElems = $(".change-lang a[data-lang]"),
            lang;

        //Add dynamic translations
        for (var i = 0; i < langElems.length; i++) {
            lang = $(langElems[i]).data("lang");

            //Change lang_cookie
            $(".change-lang a[data-lang='" + lang + "']").click(function () {
                setCookie("ppl_language", $(this).data("lang"));
                log("Cambio lang a =" + $(this).data("lang"));
            });
        }
        //Stilize current language
        $(".change-lang a[data-lang='" + $("body").attr("data-lang") + "']").css("font-weight", "800 !important");

        //Display cookies announce
        if (!getCookie("showed-cookies")) {
            $("#cookies").addClass("show");
        }

        var registerSuccessCallback = function (fn, submit) {
            return function (data) {
                if (data.success) {
                    window.location = addUtmParamsToUrl(DASHBOARD_PATH + "/web" + data.url);
                } else {
                    $(this).find("input").prop("disabled", false);
                    submit.val(submit.data("text"));
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

        var registerErrorCallback = function (submit) {
            return function (xhr) {
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
            addUtmParamsToForm($form);

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
                success: registerSuccessCallback(function (form, error) {
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
            addUtmParamsToForm($form);

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
                success: registerSuccessCallback(function (form, error) {
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
        var youtubeVideo = $('#youtube-video');
        if (youtubeVideo.length > 0) {
            youtubeVideo.magnificPopup({
                type: 'inline',
                midClick: true
            });
        }

        var ajaxErrorPopup = $('#ajax-error-popup');
        if (ajaxErrorPopup.length > 0) {
            ajaxErrorPopup.magnificPopup({
                type: 'inline'
            });
        }
    };

    var setupPricingPlan = function () {
        var euros = $('.euro'),
            dollar = $('.dollar'),
            monthly = true,
            currentEuros = true;

        /**
         * Change the prices
         */
        var changePrices = function () {
            /**
             * Change the prices
             * @param  {HTMLElement} select   Currency to select
             * @param  {HTMLElement} unselect Currency to unselect
             * @param  {Array} prices   Array with prices
             * @param  {String} currency Currency text
             */
            var change = function (select, unselect, prices, currency) {
                unselect.attr('data-selected', 'false');
                select.attr('data-selected', 'true');

                $('span.currency').html(currency);
                $('span.period').html(monthly ? $UPP.month : $UPP.year);

                $.each($('div.plan').find('span.price'), function (i) {
                    $(this).html(prices[i]);
                });
            };

            if (currentEuros) {
                change(euros, dollar, monthly ? $UPP.pricesEuro : $UPP.pricesEuroYear, $UPP.euro);
            } else {
                change(dollar, euros, monthly ? $UPP.pricesDollars : $UPP.pricesDollarsYear, $UPP.dollar);
            }
        };

        // Change the currency
        var changeCurrency = function () {
            currentEuros = !currentEuros;
            changePrices();
        };

        // Switch between monthly and yearly billing
        $('#billing-period-toggle').on('click', function () {
            var self = $(this);
            self.toggleClass('yearly');
            self.attr('data-billing-period', self.hasClass('yearly')
                ? 'yearly' : 'monthly');
            monthly = !monthly;
            changePrices();
        });

        euros.on('click', changeCurrency);
        dollar.on('click', changeCurrency);
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
    setupPricingPlan();
    setupUTMTracking();

    ShowCase.setup($);
});

// Register screen plugin
(function (window, document) {
    'use strict';

    var signupScreen;

    /**
     * Display fields to enter a seller code
     */
    var showSellerForm = function (e) {
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

    var hideSellerForm = function (e) {
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
    var showSignupScreen = function (e) {
        e.preventDefault();
        e.stopPropagation();

        signupScreen.className = 'animated fadeIn';
    };

    /**
     * Closes the signup screen
     */
    var closeSignupScreen = function (e) {
        signupScreen.className = 'animated fadeOut';
        window.setTimeout(function () {
            signupScreen.className = 'closed';
            hideSellerForm();
        }, 301);

        e.preventDefault();
        e.stopPropagation();
    };

    // Setup click listeners for the signup screen triggers when the
    // dom content has been loaded
    window.addEventListener('DOMContentLoaded', function () {
        var triggers = document.getElementsByClassName('triggers-signup'),
            closers = document.getElementsByClassName('btn-signup-close'),
            i;

        signupScreen = document.getElementById('signup-screen');

        for (i = 0; i < triggers.length; i++) {
            triggers[i].addEventListener('click', showSignupScreen);
        }

        for (i = 0; i < closers.length; i++) {
            closers[i].addEventListener('click', closeSignupScreen);
        }

        document.getElementById('seller-code').addEventListener('click', showSellerForm);
        document.getElementById('without-seller-code').addEventListener('click', hideSellerForm);
    });

})(window, document);

/**
 * ShowCase component
 */
var ShowCase = {
    arrowLeft: null,
    arrowRight: null,
    selectorBtns: null,
    selector: null,
    categories: null,
    isHome: false,
    lastPosition: 0,
    currentPosition: 0,
    numCategories: 0,
    /**
     * Returns the offset of the selector list for the current position
     * @method offsetForPosition
     * @returns {number}
     */
    offsetForPosition: function () {
        return 130 - (this.currentPosition * 62);
    },
    /**
     * Moves to the next page
     * @method nextPage
     */
    nextPage: function () {
        this.movePage(1);
    },
    /**
     * Moves to the previous page
     * @method prevPage
     */
    prevPage: function () {
        this.movePage(-1);
    },
    _resetClasses: function (elem) {
        elem.removeClass('hidden animated fadeIn fadeOut');
    },
    /**
     * Moves the page to the given direction the number of positions given by dir
     * @method movePage
     * @param {Number} dir Direction (dir < 0 means prev, otherwise next)
     */
    movePage: function (dir) {
        this.lastPosition = this.currentPosition;
        this.currentPosition += dir;

        if (this.currentPosition < 0) {
            this.currentPosition = this.numCategories - 1;
        } else if (this.currentPosition >= this.numCategories) {
            this.currentPosition = 0;
        }

        var offset = this.offsetForPosition();
        this.selector.css({
            left: offset + 'px'
        });

        var lastCategory = $(this.categories[this.lastPosition]),
            initialWidth = lastCategory.css('width');
        lastCategory.css({
            float: 'left',
            width: '100%'
        });
        
        this._resetClasses(lastCategory);
        lastCategory.addClass('animated fadeOut');
        lastCategory.one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
            lastCategory.css({
                width: initialWidth,
                float: 'none'
            });
            lastCategory.addClass('hidden');

            this.showCategory(dir > 0);
        }.bind(this));
    },
    /**
     * Show the current category
     * @method showCategory
     */
    showCategory: function () {
        var category = $(this.categories[this.currentPosition]);
        this._resetClasses(category);
        category.addClass('animated fadeIn');
        var iframe = category.find('iframe');
        iframe.attr('src', iframe.attr('data-url'));

        if (!this.isHome) {
            this.setActiveSelector();
        }
    },
    /**
     * Set the active selector button
     */
    setActiveSelector: function () {
        this.selectorBtns.removeClass('active');
        $(this.selectorBtns[this.currentPosition]).addClass('active');
    },
    /**
     * Configures the showcase component
     * @method setup
     * @param {jQuery} $
     */
    setup: function ($) {
        if ($('section#showcase').length === 0) return;

        this.isHome = $('#content').hasClass('home');

        this.arrowLeft = $('.prev-btn');
        this.arrowRight = $('.next-btn');
        this.selector = $('.app-categories').find('ul');
        this.categories = $('.showcase-item');
        var selectorBtns = this.selector.find('li');
        this.selectorBtns = selectorBtns;
        this.numCategories = this.categories.length;

        if (!this.isHome) {
            var self = this;
            selectorBtns.unbind().click(function (e) {
                e.preventDefault();
                e.stopPropagation();

                var elem = $(this);
                var index = selectorBtns.index(elem);
                self.movePage(index - self.currentPosition);
            });

            this.setActiveSelector();
        }

        var iframe = $(this.categories[this.currentPosition]).find('iframe');
        iframe.attr('src', iframe.attr('data-url'));

        this.arrowLeft.unbind().click(this.prevPage.bind(this));
        this.arrowRight.unbind().click(this.nextPage.bind(this));
    }
};