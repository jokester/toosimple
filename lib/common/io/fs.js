"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var fs = require("fs");
var path = require("path");
var promisify_1 = require("../type/promisify");
var text_1 = require("./text");
/**
 * FS: node's builtin as module
 */
var FSImpl;
(function (FSImpl) {
    function cp(oldPath, newPath) {
        return new Promise(function (fulfill, reject) {
            var readStream = fs.createReadStream(oldPath);
            var writeStream = fs.createWriteStream(newPath);
            readStream.on("error", reject);
            writeStream.on("error", reject);
            readStream.on("close", fulfill);
            readStream.pipe(writeStream);
        });
    }
    FSImpl.cp = cp;
    /**
     * mv: use POSIX rename first, and fallback to (cp + unlink)
     *
     * @export
     * @param {string} oldPath
     * @param {string} newPath
     */
    function mv(oldPath, newPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 7]);
                        return [4 /*yield*/, FSImpl.rename(oldPath, newPath)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 2:
                        e_1 = _a.sent();
                        if (!(e_1 && e_1.code === "EXDEV")) return [3 /*break*/, 5];
                        /**
                         * on "EXDEV: cross-device link not permitted" error
                         * fallback to cp + unlink
                         */
                        return [4 /*yield*/, cp(oldPath, newPath)];
                    case 3:
                        /**
                         * on "EXDEV: cross-device link not permitted" error
                         * fallback to cp + unlink
                         */
                        _a.sent();
                        return [4 /*yield*/, FSImpl.unlink(oldPath)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5: throw e_1;
                    case 6: return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    }
    FSImpl.mv = mv;
    FSImpl.readDir = promisify_1.toPromise1(fs.readdir);
    FSImpl.readFile = promisify_1.toPromise1(fs.readFile);
    FSImpl.readText = promisify_1.toPromise2(fs.readFile);
    FSImpl.lstat = promisify_1.toPromise1(fs.lstat);
    FSImpl.stat = promisify_1.toPromise1(fs.stat);
    FSImpl.unlink = promisify_1.toPromise1(fs.unlink);
    FSImpl.mkdtemp = promisify_1.toPromise1(fs.mkdtemp);
    FSImpl.rmdir = promisify_1.toPromise1(fs.rmdir);
    // NOTE 'rename' (and POSIX 'rename' syscall) is limited to same filesystem.
    FSImpl.rename = promisify_1.toPromise2(fs.rename);
    FSImpl.writeFile = promisify_1.toPromise2(fs.writeFile);
    /**
     * read lines from a (UTF-8 text) file
     *
     * @param {string} filename
     * @returns {Promise<string[]>}
     */
    function readLines(filename) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _a;
            return tslib_1.__generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = text_1.chunkToLines;
                        return [4 /*yield*/, FSImpl.readText(filename, { encoding: "utf-8" })];
                    case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                }
            });
        });
    }
    FSImpl.readLines = readLines;
    /**
     * @export
     * @param {string} dirName
     * @returns {Promise<DirItem[]>} (name + isDir + size) of entries
     */
    function readDirDetail(dirName) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            var s, childNames, children;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, FSImpl.stat(dirName)];
                    case 1:
                        s = _a.sent();
                        if (!s.isDirectory()) {
                            throw new Error("expected a directory at '" + dirName + "'");
                        }
                        return [4 /*yield*/, FSImpl.readDir(dirName)];
                    case 2:
                        childNames = _a.sent();
                        children = childNames.map(function (name) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                            var fullPath, childS, childItem;
                            return tslib_1.__generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        fullPath = path.join(dirName, name);
                                        return [4 /*yield*/, FSImpl.stat(fullPath)];
                                    case 1:
                                        childS = _a.sent();
                                        childItem = {
                                            name: name,
                                            isDir: childS.isDirectory(),
                                            // -1 works better with JSON
                                            // NaN will be serialized to `null`
                                            size: childS.isDirectory() ? -1 : childS.size
                                        };
                                        return [2 /*return*/, childItem];
                                }
                            });
                        }); });
                        return [2 /*return*/, Promise.all(children)];
                }
            });
        });
    }
    FSImpl.readDirDetail = readDirDetail;
})(FSImpl || (FSImpl = {}));
exports.FS = FSImpl;
