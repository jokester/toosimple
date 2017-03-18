"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * Services that does actual stuff
 */
const util_1 = require("./util");
const fs = require("fs");
const path = require("path");
const ejs = require("ejs");
const server_rendering_1 = require("./server-rendering");
var Render;
(function (Render) {
    /**
     * @deprecated
     */
    var EjsImpl;
    (function (EjsImpl) {
        function dirIndex(template, fsPath, fsRoot, items) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const relPath = path.relative(fsRoot, fsPath);
                if (relPath.startsWith('..')) {
                    throw new Error(`${fsPath} is outside ${fsRoot}`);
                }
                if (relPath) {
                    // when fsPath !== fsRoot, add a link to ..
                    items = [{
                            name: "..",
                            size: -1,
                            isDir: true
                        }].concat(items);
                }
                const interpolate = {
                    title: `${relPath}/`,
                    fsPath: fsPath,
                    items: items.map(i => {
                        const name = i.isDir ? `${i.name}/` : i.name;
                        return {
                            href: name,
                            canDownload: !i.isDir,
                            title: name,
                            name: name,
                        };
                    }),
                };
                return ejs.render(template, interpolate);
            });
        }
        EjsImpl.dirIndex = dirIndex;
    })(EjsImpl || (EjsImpl = {}));
    var PreactServerRendering;
    (function (PreactServerRendering) {
        function dirIndex(template, fsPath, fsRoot, items) {
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                return server_rendering_1.renderIndex({
                    title: `${path.relative(fsRoot, fsPath)}/`,
                    fsPath: fsPath,
                    items: items.map(i => {
                        const name = i.isDir ? `${i.name}/` : i.name;
                        return {
                            href: name,
                            canDownload: !i.isDir,
                            title: name,
                            name: name,
                        };
                    })
                });
            });
        }
        PreactServerRendering.dirIndex = dirIndex;
    })(PreactServerRendering || (PreactServerRendering = {}));
    Render.Actual = EjsImpl;
    Render.Preact = PreactServerRendering;
})(Render = exports.Render || (exports.Render = {}));
var FS;
(function (FS) {
    var $Impl;
    (function ($Impl) {
        function cp(oldPath, newPath) {
            return new Promise((fulfill, reject) => {
                const readStream = fs.createReadStream(oldPath);
                const writeStream = fs.createWriteStream(newPath);
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
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                try {
                    yield $Impl.rename(oldPath, newPath);
                }
                catch (e) {
                    if (e && e.code === "EXDEV") {
                        /**
                         * on "EXDEV: cross-device link not permitted" error
                         * fallback to cp + unlink
                         */
                        yield cp(oldPath, newPath);
                        yield $Impl.unlink(oldPath);
                    }
                    else {
                        throw e;
                    }
                }
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
            return tslib_1.__awaiter(this, void 0, void 0, function* () {
                const s = yield $Impl.stat(dirName);
                if (!s.isDirectory()) {
                    throw new Error(`expect directory at '${dirName}'`);
                }
                const childNames = yield $Impl.readDir(dirName);
                const children = childNames.map((name) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const fullPath = path.join(dirName, name);
                    const childS = yield $Impl.stat(fullPath);
                    const childItem = {
                        name: name,
                        isDir: childS.isDirectory(),
                        // -1 works better with JSON
                        // NaN will be serialized to `null`
                        size: childS.isDirectory() ? -1 : childS.size
                    };
                    return childItem;
                }));
                return Promise.all(children);
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
            debug(...param) {
                if (verbosity >= 3) {
                    console.debug.apply(console, param);
                }
            },
            // lvl2
            info(...param) {
                if (verbosity >= 2) {
                    console.info.apply(console, param);
                }
            },
            // lvl1
            warn(...param) {
                if (verbosity >= 1) {
                    console.info.apply(console, param);
                }
            },
            // lvl0
            error(...param) {
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
