"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Methods that convert (err, result)=>void callback to promise
 *
 * NOTE not working well with overloaded functions
 * NOTE not working well with parameter names
 */
var Callback2Promise;
(function (Callback2Promise) {
    function toPromise1(fun) {
        return function (arg1) { return new Promise(function (resolve, reject) {
            fun(arg1, function (err, result) {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        }); };
    }
    Callback2Promise.toPromise1 = toPromise1;
    /**
     * partial specialization of toPromise1 where R is void
     */
    function toPromise1v(fun) {
        return toPromise1(fun);
    }
    Callback2Promise.toPromise1v = toPromise1v;
    function toPromise2(fun) {
        return function (arg1, arg2) { return new Promise(function (resolve, reject) {
            fun(arg1, arg2, function (err, result) {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        }); };
    }
    Callback2Promise.toPromise2 = toPromise2;
    /**
     * partial specialization of toPromise2 where R is void
     */
    function toPromise2v(fun) {
        return toPromise2(fun);
    }
    Callback2Promise.toPromise2v = toPromise2v;
})(Callback2Promise = exports.Callback2Promise || (exports.Callback2Promise = {}));
/**
 * converts (foo(args) -> R) to Promise<R>
 *
 * @deprecated
 */
exports.toPromise = function (fun) {
    var argArray = [].slice.call(arguments, 1);
    return new Promise(function (fulfill, reject) {
        try {
            var result = fun.apply(null, argArray);
            fulfill(result);
        }
        catch (e) {
            reject(e);
        }
    });
};
/**
 * Lift a function's argument and return value to Promise
 */
exports.liftPromise = function (fun, thisArg) {
    return function () {
        var args = [].slice.call(arguments);
        return Promise.all(args).then(function (gotAwaits) { return fun.apply(thisArg, gotAwaits); });
    };
};
