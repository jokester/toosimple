"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Methods that convert (err, result)=>void callback to promise
 *
 * NOTE not working well with overloaded functions
 * NOTE not working well with parameter names
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
    /**
     * partial specialization of toPromise1 where R is void
     */
    function toPromise1v(fun) {
        return toPromise1(fun);
    }
    Promisify.toPromise1v = toPromise1v;
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
    /**
     * partial specialization of toPromise2 where R is void
     */
    function toPromise2v(fun) {
        return toPromise2(fun);
    }
    Promisify.toPromise2v = toPromise2v;
})(Promisify = exports.Promisify || (exports.Promisify = {}));
