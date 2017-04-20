"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 * Services that does actual stuff
 */
var util_1 = require("./util");
var fs = require("fs");
var path = require("path");
var server_rendering_1 = require("./server-rendering");
var Render;
(function (Render) {
    var PreactServerRendering;
    (function (PreactServerRendering) {
        function dirIndex(fsPath, fsRoot, items) {
            return tslib_1.__awaiter(this, void 0, void 0, function () {
                var relPath;
                return tslib_1.__generator(this, function (_a) {
                    relPath = path.relative(fsRoot, fsPath);
                    if (relPath.startsWith('..')) {
                        throw new Error(fsPath + " is outside " + fsRoot);
                    }
                    if (relPath) {
                        // when fsPath !== fsRoot, add a link to ..
                        items = [{
                                name: "..",
                                size: -1,
                                isDir: true
                            }].concat(items);
                    }
                    return [2 /*return*/, server_rendering_1.renderIndex({
                            title: path.relative(fsRoot, fsPath) + "/",
                            fsPath: fsPath,
                            items: items.map(function (i) {
                                var name = i.isDir ? i.name + "/" : i.name;
                                return {
                                    href: name,
                                    canDownload: !i.isDir,
                                    title: name,
                                    name: name,
                                };
                            })
                        })];
                });
            });
        }
        PreactServerRendering.dirIndex = dirIndex;
    })(PreactServerRendering || (PreactServerRendering = {}));
    Render.Preact = PreactServerRendering;
})(Render = exports.Render || (exports.Render = {}));
var FS;
(function (FS) {
    var $Impl;
    (function ($Impl) {
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
        $Impl.cp = cp;
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
                            return [4 /*yield*/, $Impl.rename(oldPath, newPath)];
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
                            return [4 /*yield*/, $Impl.unlink(oldPath)];
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
        $Impl.mv = mv;
        $Impl.readDir = util_1.Promisify.toPromise1(fs.readdir);
        $Impl.readFile = util_1.Promisify.toPromise1(fs.readFile);
        $Impl.readText = util_1.Promisify
            .toPromise2(fs.readFile);
        $Impl.lstat = util_1.Promisify.toPromise1(fs.lstat);
        $Impl.stat = util_1.Promisify.toPromise1(fs.stat);
        $Impl.unlink = util_1.Promisify.toPromise1v(fs.unlink);
        $Impl.mkdtemp = util_1.Promisify.toPromise1(fs.mkdtemp);
        $Impl.rmdir = util_1.Promisify.toPromise1v(fs.rmdir);
        // NOTE 'rename' (and POSIX 'rename' syscall) is limited to same filesystem.
        $Impl.rename = util_1.Promisify.toPromise2v(fs.rename);
        /**
         *
         *
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
                        case 0: return [4 /*yield*/, $Impl.stat(dirName)];
                        case 1:
                            s = _a.sent();
                            if (!s.isDirectory()) {
                                throw new Error("expect directory at '" + dirName + "'");
                            }
                            return [4 /*yield*/, $Impl.readDir(dirName)];
                        case 2:
                            childNames = _a.sent();
                            children = childNames.map(function (name) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
                                var fullPath, childS, childItem;
                                return tslib_1.__generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            fullPath = path.join(dirName, name);
                                            return [4 /*yield*/, $Impl.stat(fullPath)];
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
        $Impl.readDirDetail = readDirDetail;
    })($Impl || ($Impl = {}));
    /**
     * export it as FileSystemService, so that arguments can have correct name
     */
    FS.Acutal = $Impl;
})(FS = exports.FS || (exports.FS = {}));
var Log;
(function (Log) {
    /**
     *
     * @param verbosity
     */
    function createLogger(verbosity) {
        return {
            // lvl3
            debug: function () {
                var param = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    param[_i] = arguments[_i];
                }
                if (verbosity >= 3) {
                    console.debug.apply(console, param);
                }
            },
            // lvl2
            info: function () {
                var param = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    param[_i] = arguments[_i];
                }
                if (verbosity >= 2) {
                    console.info.apply(console, param);
                }
            },
            // lvl1
            warn: function () {
                var param = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    param[_i] = arguments[_i];
                }
                if (verbosity >= 1) {
                    console.info.apply(console, param);
                }
            },
            // lvl0
            error: function () {
                var param = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    param[_i] = arguments[_i];
                }
                if (verbosity >= 0) {
                    console.info.apply(console, param);
                }
            },
        };
    }
    Log.debug = createLogger(3);
    Log.normal = createLogger(2);
    Log.quiet = createLogger(1);
    Log.dead = createLogger(0);
})(Log = exports.Log || (exports.Log = {}));
