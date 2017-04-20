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
        return function (arg1) { return new Promise(function (resolve, reject) {
            fun(arg1, function (err, result) {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        }); };
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
        return function (arg1, arg2) { return new Promise(function (resolve, reject) {
            fun(arg1, arg2, function (err, result) {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        }); };
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
/**
 * Deferred: a wrapper for Promise that exposes fulfill / reject
 */
var Deferred = (function () {
    function Deferred(strict) {
        if (strict === void 0) { strict = false; }
        this.strict = strict;
        this.resolved = false;
        var self = this;
        this._promise = new Promise(function (fulfill, reject) {
            self._fulfill = function (v) {
                fulfill(v);
                self.resolved = true;
            };
            self._reject = function (e) {
                reject(e);
                self.resolved = true;
            };
        });
    }
    Deferred.prototype.toPromise = function () {
        return this._promise;
    };
    Deferred.prototype.follow = function (pv) {
        pv.then(this._fulfill, this._reject);
    };
    /**
     * NOTE v must be a value
     * @param v the value
     */
    Deferred.prototype.fulfill = function (v) {
        if (this.strict && this.resolved) {
            throw new Error("already resolved");
        }
        else {
            this._fulfill(v);
        }
    };
    Deferred.prototype.reject = function (e) {
        if (this.strict && this.resolved) {
            throw new Error("already resolved");
        }
        else {
            this._reject(e);
        }
    };
    return Deferred;
}());
exports.Deferred = Deferred;
