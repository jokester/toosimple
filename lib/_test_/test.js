"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const mocha_typescript_1 = require("mocha-typescript");
let TestSuite = class TestSuite {
    testSync() {
    }
    testAsync() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
        });
    }
};
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
