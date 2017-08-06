"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var path = require("path");
var url = require("url");
var servestatic = require("serve-static");
var formidable = require("formidable");
var helper = require("./http-helper");
var HandlerFactory;
(function (HandlerFactory) {
    /**
     * middleware: log requests to console
     */
    function dumpReq(log) {
        return function (req, res, next) {
            switch (req.url) {
                case "/favicon.ico":
                    break;
                default:
                    log.info(req.method + " " + req.url);
            }
            next();
        };
    }
    HandlerFactory.dumpReq = dumpReq;
    /**
     * middleware: decode url in request
     */
    function decodeReqURL(log) {
        return function (req, res, next) {
            try {
                // NOTE this also drops query/hash from path
                var before = req.url;
                var parsed = url.parse(req.url);
                var after = req.url = decodeURI(parsed.pathname);
                log.debug("decodeReqURL(): '" + before + "' => '" + after + "'");
                next();
            }
            catch (e) {
                log.error(e);
                res.statusCode = 500;
                res.end("error decoding URL");
            }
        };
    }
    HandlerFactory.decodeReqURL = decodeReqURL;
    /**
     * middleware: reject requests with non-normalized URL
     */
    function rejectDangerousPath(log) {
        return function (req, res, next) {
            if (helper.isPathNormalized(req.url)) {
                next();
            }
            else {
                log.warn("rejected access to '" + req.url + "'");
                res.statusCode = 403;
                res.end();
            }
        };
    }
    HandlerFactory.rejectDangerousPath = rejectDangerousPath;
    /**
     * Combine multiple HTTPHandler(s) into one
     * The new handler will call handlers in turn
     * @param {HTTPHandler[]} handlers
     * @returns {HTTPHandler}
     */
    function combine(log, handlers) {
        return function (req, res, next) {
            var handlerTried = 0;
            tryHandler(0);
            function tryHandler(handlerToTry) {
                // ensure that next() can only be called by current handler, at most once
                if (handlerTried !== handlerToTry) {
                    log.error("HandlerFactory#combile: next() for handler#" + (handlerToTry - 1) + " is called more than once");
                    return;
                }
                var nextHandler = handlers[handlerTried++];
                if (nextHandler) {
                    nextHandler(req, res, function () {
                        tryHandler(1 + handlerToTry);
                    });
                }
                else if (next) {
                    next();
                }
                else {
                    res.statusCode = 500;
                }
            }
            ;
        };
    }
    HandlerFactory.combine = combine;
    /**
     * Our handler that serves directory with custom HTML template
     */
    function indexHTML(ctx, root) {
        var _this = this;
        return function (req, res, next) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var urlPath, realPath, children, html, e_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        urlPath = req.url;
                        if (!urlPath.endsWith("/"))
                            return [2 /*return*/, next()];
                        else if (req.method !== "GET")
                            return [2 /*return*/, next()];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        realPath = helper.mappedPath(root, req.url);
                        return [4 /*yield*/, ctx.fs.readDirDetail(realPath)];
                    case 2:
                        children = _a.sent();
                        return [4 /*yield*/, ctx.render.dirIndex(realPath, root, children)];
                    case 3:
                        html = _a.sent();
                        res.setHeader("Content-Type", "text/html");
                        res.end(html);
                        return [2 /*return*/];
                    case 4:
                        e_1 = _a.sent();
                        ctx.logger.error(e_1);
                        res.statusCode = 500;
                        res.end();
                        return [3 /*break*/, 5];
                    case 5:
                        next();
                        return [2 /*return*/];
                }
            });
        }); };
    }
    HandlerFactory.indexHTML = indexHTML;
    function indexJSON(ctx, root) {
        var _this = this;
        return function (req, res, next) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var urlPath, realPath, items, e_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        urlPath = req.url;
                        if (!urlPath.endsWith("/"))
                            return [2 /*return*/, next()];
                        else if (req.method !== "GET")
                            return [2 /*return*/, next()];
                        else if (req.headers["x-toosimple-api"] !== "listDir")
                            return [2 /*return*/, next()];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        realPath = helper.mappedPath(root, urlPath);
                        return [4 /*yield*/, ctx.fs.readDirDetail(realPath)];
                    case 2:
                        items = _a.sent();
                        res.setHeader("content-type", "application/json");
                        res.end(JSON.stringify(items));
                        return [3 /*break*/, 4];
                    case 3:
                        e_2 = _a.sent();
                        ctx.logger.error("indexJSON: failed to serve urlPath");
                        res.statusCode = 500;
                        res.end();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
    }
    HandlerFactory.indexJSON = indexJSON;
    /**
     * Serve static file with serve-static
     */
    function staticHandler(root) {
        return servestatic(root, {
            dotfiles: "allow",
            index: false,
        });
    }
    HandlerFactory.staticHandler = staticHandler;
    /**
     * File uploading handler
     * files POST-ed to `/a/b/c/` will be saved to `root/a/b/c/`
     */
    function formUploadHandler(fs, log, fsRoot) {
        var _this = this;
        return function (req, res, next) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var urlPath, pathParts, fsPath, form, uploaded, files, fName, f, _i, files_1, f, newPath, e_3;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        urlPath = req.url;
                        if (req.method !== "POST") {
                            return [2 /*return*/, next()];
                        }
                        else if (!urlPath.endsWith("/")) {
                            return [2 /*return*/, next()];
                        }
                        pathParts = urlPath.split("/");
                        fsPath = path.join.apply(path, [fsRoot].concat(pathParts));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 7, , 8]);
                        form = new formidable.IncomingForm();
                        form.multiples = true;
                        return [4 /*yield*/, helper.parseForm(form, req)];
                    case 2:
                        uploaded = _a.sent();
                        files = [];
                        for (fName in uploaded.files) {
                            f = uploaded.files[fName];
                            // f maybe File[] or File
                            if (f instanceof Array) {
                                files.push.apply(files, f);
                            }
                            else {
                                files.push(f);
                            }
                        }
                        _i = 0, files_1 = files;
                        _a.label = 3;
                    case 3:
                        if (!(_i < files_1.length)) return [3 /*break*/, 6];
                        f = files_1[_i];
                        if (!f.size)
                            return [3 /*break*/, 5];
                        if (/\//.test(f.name)) {
                            throw new Error("illegal original filename: " + f.name);
                        }
                        newPath = path.join(fsPath, f.name);
                        return [4 /*yield*/, fs.mv(f.path, newPath)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6:
                        res.statusCode = 302;
                        res.setHeader("Location", urlPath);
                        res.end();
                        return [3 /*break*/, 8];
                    case 7:
                        e_3 = _a.sent();
                        res.statusCode = 500;
                        res.end();
                        log.error(e_3);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        }); };
    }
    HandlerFactory.formUploadHandler = formUploadHandler;
    /**
     * serve static assets with another serve-asset middleware
     * TODO: serve actual assets
     */
    function assetHandler(log, assetRoot) {
        return function (req, res, next) {
            log.debug("");
            res.statusCode = 500;
            res.end();
        };
    }
    HandlerFactory.assetHandler = assetHandler;
    /**
     * Always return 500 to finish the response
     */
    function failedHandler(log) {
        return function (req, res, next) {
            res.statusCode = 500;
            res.end();
        };
    }
    HandlerFactory.failedHandler = failedHandler;
})(HandlerFactory || (HandlerFactory = {}));
function createHandler(ctx, fsRoot) {
    return HandlerFactory.combine(ctx.logger, [
        HandlerFactory.rejectDangerousPath(ctx.logger),
        HandlerFactory.decodeReqURL(ctx.logger),
        HandlerFactory.dumpReq(ctx.logger),
        HandlerFactory.indexJSON(ctx, fsRoot),
        // our custom index with precedence
        HandlerFactory.indexHTML(ctx, fsRoot),
        // TODO serve assets (JS/CSS) or embed them in html
        // HandlerFactory.assetHandler(),
        HandlerFactory.formUploadHandler(ctx.fs, ctx.logger, fsRoot),
        // only use ecstatic for files
        HandlerFactory.staticHandler(fsRoot),
        // last handler that always return 500
        HandlerFactory.failedHandler(ctx.logger),
    ]);
}
exports.createHandler = createHandler;
;
