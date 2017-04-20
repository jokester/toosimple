"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var mocha_typescript_1 = require("mocha-typescript");
var TestSuite = (function () {
    function TestSuite() {
    }
    TestSuite.prototype.testSync = function () {
    };
    TestSuite.prototype.testAsync = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    return TestSuite;
}());
tslib_1.__decorate([
    mocha_typescript_1.test,
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", void 0)
], TestSuite.prototype, "testSync", null);
tslib_1.__decorate([
    mocha_typescript_1.test,
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", []),
    tslib_1.__metadata("design:returntype", Promise)
], TestSuite.prototype, "testAsync", null);
TestSuite = tslib_1.__decorate([
    mocha_typescript_1.suite
], TestSuite);
