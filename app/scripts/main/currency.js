jQuery(document).ready(function($) {
    /**
     * ISO 4217 currency code. This means this should be a three characters
     * string, all uppercase, representing the currency.
     *
     * @typedef {String} CurrencyCode
     * @see {@link http://www.xe.com/symbols.php}
     */

    /**
     * @typedef {Object} CurrencyRates
     * @property {CurrencyCode} base
     * @property {String} date - Date when this rates apply, in format
     *         `yyyy-MM-dd`.
     * @property {Object} rates - Currency conversion rates. Every property
     *         on this object is a be {@link CurrencyCode} and it's value
     *         is the conversion rate to be applied relative to current
     *         object {@link #base}
     */

     /**
      * Default base currency
      * @type {CurrencyCore}
      */
    var CURRENCY_BASE = 'EUR'
    /**
     * Other currencies that are not the base and should be handled by this
     * script.
     * @type {CurrencyCode[]}
     */
    var CURRENCY_SYMBOLS = [ 'USD', 'MXN' ]

    function IpGeolocationService() {}

    IpGeolocationService.prototype.getInfo = function(cb) {
        var url = "http://ip-api.com/json"
        $.getJSON(url, cb)
    }

    /**
     * Provides currency rates information via an async HTTP API.
     * @param {CurrencyCode} [conf.base] - ISO Symbol of the currency base for
     *        rate calculation. All rates for other currencies will be relative
     *        to this currency. If not provided, defaults to `'USD'`.
     * @param {CurrencyCode[]} [conf.symbols] - When requesting currency rates
     *        via this instance, only rates for this currencies should be
     *        included on the result. If not provided all available rates will
     *        be returned when rates are requested.
     * @see {@link http://fixer.io/}
     */
    function CurrencyService(conf) {
        this.conf = conf || {}
    }

    /**
     * Returns via callback the currency conversion rates based on the conf
     * provided on service constructon.
     *
     * @param  {Function} cb
     * @return {CurrencyRates}
     * @see {@link CurrencyService}
     */
    CurrencyService.prototype.getRates = function(cb) {
        var conf = $.extend({}, this.conf)

        var url = 'http://api.fixer.io/latest'
        var params = []
        if (conf.symbols)
            params.push('base=' + conf.base)
        if (conf.symbols.length > 0)
            params.push('symbols=' + conf.symbols.join(','))
        url += '?' + params.join('&')
        $.getJSON(url, cb)
    }

    /**
     * Wraps a HTMLElement and provides functionality over its content related
     * with currencies values. Changes on properties via getters and setters
     * will be retrieved, stored and reflected directly on the HTMLElement.
     *
     * If a base PriceContainer is provided the actual price on the current
     * instance is expected to be related with the base price, but it is not
     * necessary available right after construction and probably will be needed
     * to provide it via {@link #setPrice}. See {@link #getPrice} for a more
     * detailed explanation.
     *
     * This class works under lazy-init, this means that if no setter is called
     * after construction, maybe some html element properties won't be reflecting
     * an updated value.
     *
     * @param {jQuery} $elem
     * @param {PriceContainer} [basePriceContainer]
     */
    function PriceContainer($elem, basePriceContainer) {
        this.$element  = $elem
        this.basePriceContainer = basePriceContainer || null
        this.$price = $elem.find('.price')
        this.setPrice(this.getPrice())
        this.setCurrencyCode(this.getCurrencyCode() || CURRENCY_BASE)
    }

    /**
     * Matches and allows extraction of the currency code for any currency
     * className created via {@link PriceContainer.getCurrencyClassName}
     * @type {RegExp}
     */
    PriceContainer.CURRENCY_CLASS_NAME_REGEX = /^price-currency-([a-z]{3})/i

    /**
     * Generates a className for the given currencyCode.
     * @param  {CurrencyCode} currencyCode
     * @return {String}
     */
    PriceContainer.buildCurrencyClassName = function(currencyCode) {
        if (typeof currencyCode !== 'string')
            throw new TypeError('currencyCode must be a string')
        if (currencyCode.length !== 3)
            throw new Error('currencyCode is expected to be 3 characters long')
        return 'price-currency-' + currencyCode.toLowerCase()
    }

    /**
     * ClassName that will be added to the PriceContainer bound HTMLElement when
     * price for the said container is not yet available.
     *
     * @type {String}
     */
    PriceContainer.PRICE_NOT_YET_AVAILABLE = 'price-loading'

    /**
     * Returns the current price value on the container. Null value is returned
     * only if this container was provided with a base {@link PriceContainer} on
     * construction and price has not been updated via {@link #setPrice}
     * afterwards.
     *
     * @return {Number|null}
     */
    PriceContainer.prototype.getPrice = function() {
        var price = this.$price.text()
        /** @todo: Decimal/hundreds symbols should be properly handled here */
        price = price.replace(/,/g, '.')
        return Number(price) || null
    }

    /**
     * Updates the current price on the container. If price is null, className
     * provided by {@link .PRICE_NOT_YET_AVAILABLE} will be added to the current
     * container bound element.
     *
     * @param {Number} price
     */
    PriceContainer.prototype.setPrice = function(price) {
        var className = PriceContainer.PRICE_NOT_YET_AVAILABLE
        this.$element.toggleClass(className, price === null)
        /** @todo: Decimal/hundreds symbols should be properly handled here */
        this.$price.text(price)
    }

    /**
     * Retrieves all classNames from current bound HTMLElement that match
     * {@link PriceContainer.CURRENCY_CLASS_NAME_REGEX}.
     * @private
     * @return {String[]}
     */
    PriceContainer.prototype.getCurrencyClassNames = function() {
        var classNames  = this.$element.attr('class').split(/\s+/)
        var currencyClassRgx = PriceContainer.CURRENCY_CLASS_NAME_REGEX
        return classNames.filter(function(c) {
            return currencyClassRgx.test(c)
        })
    }

    /**
     * Retrieves current currency of the container based on its classNames.
     * If no className is found that provides currency will return null
     *
     * @return {CurrencyCode|null}
     */
    PriceContainer.prototype.getCurrencyCode = function() {
        var currencyClassNames = this.getCurrencyClassNames()

        if (currencyClassNames.length <= 0)
            return null

        currencyClassNames = currencyClassNames[0]
        var currencyClassRgx = PriceContainer.CURRENCY_CLASS_NAME_REGEX
        var currencySymbol = currencyClassRgx.exec(currencyClassNames)[1]
        return currencySymbol.toUpperCase()
    }

    /**
     * Sets the current currency code to the one provided. This adds a class
     * generated via {@link .getCurrencyClassName} to the bound HTML element
     *
     * @param {CurrencyCode} code
     */
    PriceContainer.prototype.setCurrencyCode = function(code) {
        var currencyClasses = this.getCurrencyClassNames()
        this.$element.removeClass(function() {
            return currencyClasses.join(' ')
        })
        this.$element.addClass(PriceContainer.buildCurrencyClassName(code))
    }

    /**
     * If a base {@link PriceContainer} was provided on construction, this
     * method returns the result of {@link #getPrice} on said base container.
     *
     * @return {Number|Null}
     */
    PriceContainer.prototype.getBasePrice = function () {
        if (!this.basePriceContainer)
            return null
        return this.basePriceContainer.getPrice()
    }

    /**
     * If a base {@link PriceContainer} was provided on construction, this
     * method returns the result of {@link #getCurrencyCode} on said base
     * container.
     *
     * @return {Number|Null}
     */
    PriceContainer.prototype.getBaseCurrencyCode = function () {
        if (!this.basePriceContainer)
            return null
        return this.basePriceContainer.getCurrencyCode()
    }

    /**
     * Tries to find a pricing table and at least one currency changer. If any
     * of them is not found, the function ends.
     *
     * Adds a click listener to every currency changer that toggles a currency
     * class on the pricing table based on the `data-currency` attribute on
     * the currency changer.
     */
    function initializeCurrencySelectors() {
        var $pricing = $('.pricing-tables')
        var $currencyChangers = $('[data-currency]')

        if ($pricing.length == 0 || $currencyChangers.length === 0)
            return

        var setSelectedCurrencyClassName = function(currencyCode) {
            $pricing.addClass('selected-currency-' + currencyCode)
        }

        var removeSelectedCurrencyClassName = function() {
            $pricing.removeClass(function(i, classNames) {
                return classNames.split(/\s+/).filter(function(className) {
                    return /^selected-currency-([a-z]{3})$/.test(className)
                }).join(' ')
            })
        }

        $currencyChangers.on('click', function(ev) {
            var currencyCode = ev.target.getAttribute('data-currency').toLowerCase()
            removeSelectedCurrencyClassName()
            setSelectedCurrencyClassName(currencyCode)
        })
    }

    /**
     * Finds all `.price-container` on the document, wraps every one of them
     * on a {@link PriceContainer} and generates the missing priceContainers
     * based on CURRENCY_SYMBOLS (HTMLElement and {@link PriceContainer}
     * instances).
     *
     * @return {PriceContainer[]} All instances generated on the process.
     */
    function initializePriceContainers() {
        var priceContainers = $('.price-container').map(function(i, e) {
            var $priceContainer = $(e)
            var priceContainer = new PriceContainer($priceContainer)
            var priceContainers = [ priceContainer ]
            CURRENCY_SYMBOLS.reduce(function(insertAfter, s) {
                var $priceContainerClone = $priceContainer.clone()
                var priceContainerClone = new PriceContainer($priceContainerClone, priceContainer)
                priceContainerClone.setCurrencyCode(s)
                priceContainerClone.setPrice(null)
                priceContainers.push(priceContainerClone)
                return $priceContainerClone.insertAfter(insertAfter)
            }, $priceContainer)
            return priceContainers
        }).get()
        // Flatten the "array of arrays"
        return [].concat.apply([], priceContainers)
    }

    /**
     * Updates all the provided priceContainers prices with the given
     * conversion rates. Due to how priceContainers work this will only affect
     * {@link PriceContainer}-s that were provided with a base PriceContaiener,
     * in our case that means every priceContainer generated after the page
     * loaded (created on {@link initializePriceContainers})
     *
     * @param  {PriceContainer[]} priceContainers [description]
     * @param  {CurrencyRates} rates
     */
    function updatePriceContainers(priceContainers, rates) {
        $.extend(fx, rates) // Setup FX with the provided base and rates from the api
        priceContainers
        .filter(function(priceContainer) {
            // Igonre price containers that have not a base price
            return priceContainer.getBaseCurrencyCode() !== null
        })
        .forEach(function(priceContainer) {
            var basePrice = priceContainer.getBasePrice()
            var baseSymbol = priceContainer.getBaseCurrencyCode()
            var currencySymbol = priceContainer.getCurrencyCode()
            var rate = fx(basePrice).from(baseSymbol).to(currencySymbol)
            var price = rate.toFixed(2)
            priceContainer.setPrice(price)
        })
    }

    /**
     * Setups everything necessary and starts it
     */
    function initialize() {
        var currencyService = new CurrencyService({
            base: CURRENCY_BASE,
            symbols: CURRENCY_SYMBOLS
        })
        var geolocationService = new IpGeolocationService()

        var priceContainers = initializePriceContainers()
        if (priceContainers.length <= 0) // If no price containers, do nothing
            return
        // Retrieve conversion rates and update price containers
        currencyService.getRates(function(data) {
            updatePriceContainers(priceContainers, data)
        })
        // Retrieve client info by its current IP
        geolocationService.getInfo(function(data) {
            $('html').attr('country', data.countryCode)
        })
        initializeCurrencySelectors()
    }

    initialize()
})
