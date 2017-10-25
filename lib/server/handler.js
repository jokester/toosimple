"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const url = require("url");
const servestatic = require("serve-static");
const formidable = require("formidable");
const helper = require("./helper");
var HandlerFactory;
(function (HandlerFactory) {
    /**
     * middleware: log requests to console
     */
    function dumpReq(log) {
        return (req, res, next) => {
            switch (req.url) {
                case "/favicon.ico":
                    break;
                default:
                    log.info(`${req.method} ${req.url}`);
            }
            next();
        };
    }
    HandlerFactory.dumpReq = dumpReq;
    /**
     * middleware: decode url in request
     */
    function decodeReqURL(log) {
        return (req, res, next) => {
            try {
                // NOTE this also drops query/hash from path
                const before = req.url;
                const parsed = url.parse(req.url);
                const after = req.url = decodeURI(parsed.pathname);
                log.debug(`decodeReqURL(): '${before}' => '${after}'`);
                next();
            }
            catch (e) {
                log.error(e);
                res.statusCode = 500;
                res.end(`error decoding URL`);
            }
        };
    }
    HandlerFactory.decodeReqURL = decodeReqURL;
    /**
     * middleware: reject requests with non-normalized URL
     */
    function rejectDangerousPath(log) {
        return (req, res, next) => {
            if (helper.isPathNormalized(req.url)) {
                next();
            }
            else {
                log.warn(`rejected access to '${req.url}'`);
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
        return (req, res, next) => {
            let handlerTried = 0;
            tryHandler(0);
            return;
            function tryHandler(handlerToTry) {
                // ensure that next() can only be called by current handler, at most once
                if (handlerTried !== handlerToTry) {
                    log.fatal(`HandlerFactory#combile: next() for handler#${handlerToTry - 1} is called more than once`);
                    return;
                }
                const nextHandler = handlers[handlerTried++];
                if (nextHandler) {
                    nextHandler(req, res, () => {
                        tryHandler(1 + handlerToTry);
                    });
                }
                else if (next) {
                    next();
                }
                else {
                    log.fatal(`HandlerFactory#combile: all handlers are consumed. consider add a next or fallback handler`);
                }
            }
        };
    }
    HandlerFactory.combine = combine;
    /**
     * Our handler that serves directory with custom HTML template
     */
    function indexHTML(ctx, root) {
        return (req, res, next) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const urlPath = req.url;
            if (!urlPath.endsWith("/"))
                return next();
            else if (req.method !== "GET")
                return next();
            try {
                const realPath = helper.mappedPath(root, req.url);
                const children = yield ctx.fs.readDirDetail(realPath);
                const html = yield ctx.renderer.dirIndex(realPath, root, children);
                res.setHeader("Content-Type", "text/html");
                res.end(html);
                return;
            }
            catch (e) {
                ctx.logger.error(e);
                res.statusCode = 500;
                res.end();
            }
            next();
        });
    }
    HandlerFactory.indexHTML = indexHTML;
    function indexJSON(ctx, root) {
        return (req, res, next) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const urlPath = req.url;
            if (!urlPath.endsWith("/"))
                return next();
            else if (req.method !== "GET")
                return next();
            else if (req.headers["x-toosimple-api"] !== "listDir")
                return next();
            try {
                const realPath = helper.mappedPath(root, urlPath);
                const items = yield ctx.fs.readDirDetail(realPath);
                res.setHeader("content-type", "application/json");
                res.end(JSON.stringify(items));
            }
            catch (e) {
                ctx.logger.error(`indexJSON: failed to serve urlPath`);
                res.statusCode = 500;
                res.end();
            }
        });
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
        return (req, res, next) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const urlPath = req.url;
            if (req.method !== "POST") {
                return next();
            }
            else if (!urlPath.endsWith("/")) {
                return next();
            }
            const pathParts = urlPath.split("/");
            const fsPath = path.join(fsRoot, ...pathParts);
            try {
                const form = new formidable.IncomingForm();
                form.multiples = true;
                // FIXME should we create upload under root?
                const uploaded = yield helper.parseForm(form, req);
                // flatten file array
                const files = [];
                for (const fName in uploaded.files) {
                    const f = uploaded.files[fName];
                    // f maybe File[] or File
                    if (f instanceof Array) {
                        files.push(...f);
                    }
                    else {
                        files.push(f);
                    }
                }
                for (const f of files) {
                    if (!f.size)
                        continue;
                    if (/\//.test(f.name)) {
                        throw new Error(`illegal original filename: ${f.name}`);
                    }
                    const newPath = path.join(fsPath, f.name);
                    yield fs.mv(f.path, newPath);
                }
                res.statusCode = 302;
                res.setHeader("Location", urlPath);
                res.end();
            }
            catch (e) {
                res.statusCode = 500;
                res.end();
                log.error(e);
            }
        });
    }
    HandlerFactory.formUploadHandler = formUploadHandler;
    /**
     * serve static assets with another serve-asset middleware
     * TODO: serve actual assets
     */
    function assetHandler(log, assetRoot) {
        return (req, res, next) => {
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
        return (req, res, next) => {
            log.error("");
            try {
                res.statusCode = 500;
                res.end();
            }
            catch (e) { }
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
