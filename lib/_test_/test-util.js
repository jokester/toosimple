"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mocha_typescript_1 = require("mocha-typescript");
const chai_1 = require("chai");
const util_1 = require("../util");
let Test_Deferred = class Test_Deferred {
    resolve_fulfill() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const p = new util_1.Deferred();
            chai_1.expect(p.resolved).to.eq(false);
            p.fulfill("hey");
            chai_1.expect(p.resolved).to.eq(true);
            chai_1.expect(yield p.toPromise()).to.eq("hey");
            p.fulfill("ho");
            chai_1.expect(yield p.toPromise()).to.eq("hey");
            p.reject(1);
            chai_1.expect(yield p.toPromise()).to.eq("hey");
        });
    }
    resolve_reject() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const p = new util_1.Deferred();
            chai_1.expect(p.resolved).to.eq(false);
            p.reject("ho");
            chai_1.expect(p.resolved).to.eq(true);
            let reason;
            try {
                yield p.toPromise();
                chai_1.expect(1).to.eq(0, "should not be here");
            }
            catch (e) {
                reason = e;
            }
            chai_1.expect(reason).to.eq("ho");
        });
    }
    strict() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const p = new util_1.Deferred(true);
            p.fulfill("");
            chai_1.expect(() => p.fulfill("3")).to.throw("already resolved");
            chai_1.expect(() => p.reject("3")).to.throw("already resolved");
        });
    }
};
tslib_1.__decorate([
    mocha_typescript_1.test,
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], Test_Deferred.prototype, "resolve_fulfill", null);
tslib_1.__decorate([
    mocha_typescript_1.test,
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], Test_Deferred.prototype, "resolve_reject", null);
tslib_1.__decorate([
    mocha_typescript_1.test,
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], Test_Deferred.prototype, "strict", null);
Test_Deferred = tslib_1.__decorate([
    mocha_typescript_1.suite
], Test_Deferred);
