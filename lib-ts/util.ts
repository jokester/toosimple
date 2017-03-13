/**
 * Methods that convert (err, result)=>void callback to promise
 *
 * NOTE not working well with overloaded functions
 * NOTE not working well with parameter names
 */
export namespace Promisify {

    interface CallbackFun1<A1, R> {
        (arg1: A1, callback: (err: Error, result: R) => void): void;
    }

    interface CallbackFun2<A1, A2, R> {
        (arg1: A1, arg2: A2, callback: (err: Error, result: R) => void): void;
    }

    export function toPromise1<A1, R>(fun: CallbackFun1<A1, R>) {
        return (arg1: A1) => new Promise<R>((resolve, reject) => {
            fun(arg1, (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    }

    /**
     * partial specialization of toPromise1 where R is void
     */
    export function toPromise1v<A1>(fun: CallbackFun1<A1, void>) {
        return toPromise1(fun);
    }

    export function toPromise2<A1, A2, R>(fun: CallbackFun2<A1, A2, R>) {
        return (arg1: A1, arg2: A2) => new Promise<R>((resolve, reject) => {
            fun(arg1, arg2, (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            });
        });
    }

    /**
     * partial specialization of toPromise2 where R is void
     */
    export function toPromise2v<A1, A2>(fun: CallbackFun2<A1, A2, void>) {
        return toPromise2<A1, A2, void>(fun);
    }
}

/**
 * Deferred: a wrapper for Promise that exposes fulfill / reject
 */
export class Deferred<T> {
    private readonly _promise: Promise<T>;
    private readonly _fulfill: (v: T) => void;
    private readonly _reject: (e: any) => void;
    readonly resolved = false;

    constructor(private readonly strict = false) {
        const self = this as any;
        this._promise = new Promise((fulfill, reject) => {
            self._fulfill = (v: T) => {
                fulfill(v);
                self.resolved = true;
            };
            self._reject = (e: any) => {
                reject(e);
                self.resolved = true;
            };
        });
    }

    toPromise() {
        return this._promise;
    }

    follow(pv: PromiseLike<T>) {
        pv.then(this._fulfill, this._reject);
    }

    /**
     * NOTE v must be a value
     * @param v the value
     */
    fulfill(v: T) {
        if (this.strict && this.resolved) {
            throw new Error("already resolved");
        } else {
            this._fulfill(v);
        }
    }

    reject(e: any) {
        if (this.strict && this.resolved) {
            throw new Error("already resolved");
        } else {
            this._reject(e);
        }
    }
}