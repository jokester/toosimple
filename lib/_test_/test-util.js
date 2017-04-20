"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var mocha_typescript_1 = require("mocha-typescript");
var chai_1 = require("chai");
var util_1 = require("../util");
var Test_Deferred = (function () {
    function Test_Deferred() {
    }
    Test_Deferred.prototype.resolve_fulfill = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var p, _a, _b, _c, _d, _e, _f;
            return tslib_1.__generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        p = new util_1.Deferred();
                        chai_1.expect(p.resolved).to.eq(false);
                        p.fulfill("hey");
                        chai_1.expect(p.resolved).to.eq(true);
                        _a = chai_1.expect;
                        return [4 /*yield*/, p.toPromise()];
                    case 1:
                        _a.apply(void 0, [_g.sent()]).to.eq("hey");
                        p.fulfill("ho");
                        _c = chai_1.expect;
                        return [4 /*yield*/, p.toPromise()];
                    case 2:
                        _c.apply(void 0, [_g.sent()]).to.eq("hey");
                        p.reject(1);
                        _e = chai_1.expect;
                        return [4 /*yield*/, p.toPromise()];
                    case 3:
                        _e.apply(void 0, [_g.sent()]).to.eq("hey");
                        return [2 /*return*/];
                }
            });
        });
    };
    Test_Deferred.prototype.resolve_reject = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var p, reason, e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        p = new util_1.Deferred();
                        chai_1.expect(p.resolved).to.eq(false);
                        p.reject("ho");
                        chai_1.expect(p.resolved).to.eq(true);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, p.toPromise()];
                    case 2:
                        _a.sent();
                        chai_1.expect(1).to.eq(0, "should not be here");
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        reason = e_1;
                        return [3 /*break*/, 4];
                    case 4:
                        chai_1.expect(reason).to.eq("ho");
                        return [2 /*return*/];
                }
            });
        });
    };
    Test_Deferred.prototype.strict = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var p;
            return tslib_1.__generator(this, function (_a) {
                p = new util_1.Deferred(true);
                p.fulfill("");
                chai_1.expect(function () { return p.fulfill("3"); }).to.throw("already resolved");
                chai_1.expect(function () { return p.reject("3"); }).to.throw("already resolved");
                return [2 /*return*/];
            });
        });
    };
    return Test_Deferred;
}());
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
