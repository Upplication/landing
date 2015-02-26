'use strict';
/**
 * Register observers:
 * Topic.on("success", fn1);
 * Topic.on("success", fn2);
 * Launch the event:
 * Topic.fire("success");
 *
 * Then fn1 and fn2 are executed
 * @type {{, fire: fire, on: on}}
 */
var Topic = function($){
    return {
        _observers: {},

        fire: function (event) {
            var arrayFN = this._observers[event];

            $.each(arrayFN, function (index, fn) {
                fn();
            });
        },

        on: function (event, fn) {
            var arrayFN = this._observers[event];
            if (arrayFN) {
                arrayFN.push(fn);
            }
            else {
                this._observers[event] = [fn];
            }
        }
    }
}($);