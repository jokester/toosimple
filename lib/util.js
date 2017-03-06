"use strict";
/**
 * Methods that convert callback to promise
 *
 * NOTE not working well with overloaded functions
 */
var Promisify;
(function (Promisify) {
    function toPromise1(fun) {
        return (arg1) => new Promise((resolve, reject) => {
            fun(arg1, (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    }
    Promisify.toPromise1 = toPromise1;
    function toPromise2(fun) {
        return (arg1, arg2) => new Promise((resolve, reject) => {
            fun(arg1, arg2, (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    }
    Promisify.toPromise2 = toPromise2;
})(Promisify = exports.Promisify || (exports.Promisify = {}));
