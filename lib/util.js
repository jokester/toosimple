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
/**
 * Deferred: a wrapper for Promise that exposes fulfill / reject
 */
class Deferred {
    constructor(strict = false) {
        this.strict = strict;
        this.resolved = false;
        const self = this;
        this._promise = new Promise((fulfill, reject) => {
            self._fulfill = (v) => {
                fulfill(v);
                self.resolved = true;
            };
            self._reject = (e) => {
                reject(e);
                self.resolved = true;
            };
        });
    }
    toPromise() {
        return this._promise;
    }
    follow(pv) {
        pv.then(this._fulfill, this._reject);
    }
    /**
     * NOTE v must be a value
     * @param v the value
     */
    fulfill(v) {
        if (this.strict && this.resolved) {
            throw new Error("already resolved");
        }
        else {
            this._fulfill(v);
        }
    }
    reject(e) {
        if (this.strict && this.resolved) {
            throw new Error("already resolved");
        }
        else {
            this._reject(e);
        }
    }
}
exports.Deferred = Deferred;
