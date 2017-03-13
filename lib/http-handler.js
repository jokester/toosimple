"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path = require("path");
const url = require("url");
const ejs = require("ejs");
const formidable = require("formidable");
const servestatic = require("serve-static");
var Helper;
(function (Helper) {
    /**
     * Most UA normalizes URL and removes '/../' before sending it.
     * (nodejs does not normalize URL).
     * A crafted UA may not do so, which we have to reject for security.
     *
     * @param {string} path
     * @returns {boolean} whether path contains *no* '/../' or '.'
     */
    function isPathNormalized(path) {
        // prohibit . / .. in path resolution for security
        // NOTE node.js does not normalize URL
        // (browser often does that, but a crafted client may not)
        if (path.match('//'))
            return false;
        const pathParts = path.split("/");
        return !pathParts.some(part => !!part.match(/^\.\.?$/));
    }
    Helper.isPathNormalized = isPathNormalized;
    function parseForm(parser, req) {
        return new Promise((fulfill, reject) => {
            parser.parse(req, (err, fields, files) => {
                if (err) {
                    reject(err);
                }
                else {
                    fulfill({ fields: fields, files: files });
                }
            });
        });
    }
    Helper.parseForm = parseForm;
    function getPath(urlStr) {
    }
    Helper.getPath = getPath;
    /**
     *
     * @export
     * @param {string} root root path in filesystem
     * @param {string} urlStr path from a {IncomingMessage} object
     * @returns filesystem path that corresponds to joined (root + normalizedPath)
     *
     */
    function mappedPath(root, normalizedPath) {
        return path.join(root, ...normalizedPath.split('/'));
    }
    Helper.mappedPath = mappedPath;
})(Helper = exports.Helper || (exports.Helper = {}));
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
            if (Helper.isPathNormalized(req.url)) {
                next();
            }
            else {
                res.statusCode = 403;
                res.end();
            }
        };
    }
    HandlerFactory.rejectDangerousPath = rejectDangerousPath;
    /**
     * Combine multi HTTPHandler(s) into one
     * The new handler will call handlers one by one.
     * @param {HTTPHandler[]} handlers
     * @returns {HTTPHandler}
     */
    function combine(log, handlers) {
        return (req, res, next) => {
            let handlerTried = 0;
            tryHandler(0);
            function tryHandler(handlerToTry) {
                // ensure that next() can only be called by current handler, at most once
                if (handlerTried !== handlerToTry) {
                    log.error(`HandlerFactory#combile: next() for handler#${handlerToTry - 1} is called more than once`);
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
    function indexHTML(fs, log, root) {
        const templateStr = fs.readText(path.join(__dirname, "..", "assets", "dir.ejs.html"), { encoding: 'utf-8' });
        return (req, res, next) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const urlPath = req.url;
            if (!urlPath.endsWith("/"))
                return next();
            else if (req.method !== "GET")
                return next();
            const pathParts = urlPath.split("/");
            try {
                const realPath = Helper.mappedPath(root, req.url);
                const children = yield fs.readDirDetail(realPath);
                // add link to ..
                if (urlPath !== "/") {
                    children.unshift({
                        name: "..",
                        isDir: true,
                        size: -1
                    });
                }
                // FIXME  render index as a service
                const html = ejs.render(yield templateStr, {
                    // FIXME title may contain '//' form certain URL
                    title: `${pathParts.slice(0, -1).join("/") || "/"} - toosimple`,
                    items: children,
                    urlPath: urlPath,
                });
                res.end(html);
                return;
            }
            catch (e) {
                log.error(e);
            }
            next();
        });
    }
    HandlerFactory.indexHTML = indexHTML;
    function indexJSON(fs, log, root) {
        return (req, res, next) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            // TODO
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
    function formUploadHandler(fs, log, root) {
        return (req, res, next) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const urlPath = req.url;
            if (req.method !== "POST") {
                return next();
            }
            else if (!urlPath.endsWith("/")) {
                return next();
            }
            const pathParts = urlPath.split("/");
            const fsPath = path.join(root, ...pathParts);
            try {
                const form = new formidable.IncomingForm();
                form.multiples = true;
                // FIXME should we create upload under root?
                const uploaded = yield Helper.parseForm(form, req);
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
     * TODO serve actual assets
     */
    function assetHandler(assetRoot) {
        return (req, res, next) => {
            res.statusCode = 500;
            res.end();
        };
    }
    HandlerFactory.assetHandler = assetHandler;
    /**
     * Always return 500 to finish the response
     */
    function failedHandler() {
        return (req, res, next) => {
            res.statusCode = 500;
            res.end();
        };
    }
    HandlerFactory.failedHandler = failedHandler;
})(HandlerFactory || (HandlerFactory = {}));
exports.createHandler = (fs, log, root) => {
    return HandlerFactory.combine(log, [
        HandlerFactory.rejectDangerousPath(log),
        HandlerFactory.decodeReqURL(log),
        HandlerFactory.dumpReq(log),
        // our custom index with precedence
        HandlerFactory.indexHTML(fs, log, root),
        // TODO serve assets (JS/CSS) or bind them in
        // HandlerFactory.assetHandler(),
        HandlerFactory.formUploadHandler(fs, log, root),
        // only use ecstatic for files
        HandlerFactory.staticHandler(root),
        // last handler that always return 500
        HandlerFactory.failedHandler(),
    ]);
};
