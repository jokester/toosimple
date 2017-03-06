"use strict";
const tslib_1 = require("tslib");
const path = require("path");
const url = require("url");
const ejs = require("ejs");
const formidable = require("formidable");
const servestatic = require("serve-static");
const fsp = require("./fs-promise");
const templateStr = fsp.readFile(path.join(__dirname, "..", "assets", "dir.ejs.html")).then(buf => buf.toString());
var HandlerFactory;
(function (HandlerFactory) {
    /**
     * whether path contains *no* '/../' or '.'
     *
     * Most UA normalizes URL and removes '/../' before sending it.
     * (nodejs does not normalize URL).
     * A crafted UA may not do so, which we have to reject for security.
     *
     * @param {string} urlPath
     * @returns {boolean}
     */
    function isPathNormalized(urlPath) {
        // prohibit . / .. in path resolution for security
        // NOTE node.js does not normalize URL
        // (browser often does that, but a crafted client may not)
        const pathParts = urlPath.split("/");
        return !pathParts.some(part => !!part.match(/^\.\.?$/));
    }
    function dump() {
        return (req, res, next) => {
            console.info(`req URL: ${req.url}`);
            next();
        };
    }
    HandlerFactory.dump = dump;
    function decodeReqURL() {
        return (req, res, next) => {
            try {
                const before = req.url;
                const parsed = url.parse(req.url);
                const after = req.url = decodeURI(parsed.pathname);
                // console.info(`decodeReqURL(): '${before}' => '${after}'`);
                next();
            }
            catch (e) {
                console.error(e);
                res.statusCode = 500;
                res.end(`error decoding URL`);
            }
        };
    }
    HandlerFactory.decodeReqURL = decodeReqURL;
    function combine(handlers) {
        return (req, res, next) => {
            let handlerTried = 0;
            const tryHandler = (handlerToTry) => {
                if (handlerTried !== handlerToTry) {
                    console.error(`HandlerFactory#combile: next() for handler#${handlerToTry - 1} is called more than once`);
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
            };
            tryHandler(0);
        };
    }
    HandlerFactory.combine = combine;
    /**
     * Our handler that serves directory with custom template
     */
    function indexHandler(root) {
        return (req, res, next) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const urlPath = req.url;
            if (!urlPath.endsWith("/"))
                return next();
            else if (req.method !== "GET")
                return next();
            else if (!isPathNormalized(urlPath)) {
                res.statusCode = 403;
                res.end();
                return;
            }
            const pathParts = urlPath.split("/");
            // FIXME add an option to prohibit symlink
            try {
                const realPath = path.join(root, ...pathParts);
                const stat = yield fsp.stat(realPath);
                if (!stat.isDirectory()) {
                    return next();
                }
                const childNames = yield fsp.readdir(realPath);
                const children = yield Promise.all(childNames.map((name) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                    const fullPath = path.join(realPath, name);
                    const stat = yield fsp.stat(fullPath);
                    const nameWithSlash = stat.isDirectory() ? `${name}/` : name;
                    const href = path.join(urlPath, nameWithSlash);
                    const canDownload = !stat.isDirectory();
                    return {
                        name: nameWithSlash,
                        href: href,
                        isDir: stat.isDirectory(),
                        canDownload: canDownload,
                    };
                })));
                // add link to ..
                if (urlPath !== "/") {
                    children.unshift({
                        name: "../",
                        href: path.join(urlPath, ".."),
                        isDir: true,
                        canDownload: false,
                    });
                }
                const html = ejs.render(yield templateStr, {
                    title: `${pathParts.slice(0, -1).join("/") || "/"} - toosimple`,
                    items: children,
                    urlPath: urlPath,
                });
                res.end(html);
                return;
            }
            catch (e) {
                console.error(e);
            }
            next();
        });
    }
    HandlerFactory.indexHandler = indexHandler;
    /**
     * Static file handler
     *
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
     */
    function formUploadHandler(root) {
        return (req, res, next) => {
            const urlPath = req.url;
            if (req.method !== "POST") {
                return next();
            }
            else if (!urlPath.endsWith("/")) {
                return next();
            }
            else if (!isPathNormalized(urlPath)) {
                res.statusCode = 403;
                res.end();
                return;
            }
            const pathParts = urlPath.split("/");
            const fsPath = path.join(root, ...pathParts);
            (() => tslib_1.__awaiter(this, void 0, void 0, function* () {
                try {
                    const form = new formidable.IncomingForm();
                    form.multiples = true;
                    // TODO we should create upload under root
                    // form.uploadDir = await uploadTemp;
                    const uploaded = yield fsp.parseForm(form, req);
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
                        yield fsp.mv(f.path, newPath);
                    }
                    res.statusCode = 302;
                    res.setHeader("Location", urlPath);
                    res.end();
                }
                catch (e) {
                    res.statusCode = 500;
                    res.end();
                    console.error(e);
                }
            }))();
        };
    }
    HandlerFactory.formUploadHandler = formUploadHandler;
    /**
     * serve static assets with another ecstatic middleware
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
exports.createHandler = (root) => {
    return HandlerFactory.combine([
        // Decode url
        HandlerFactory.decodeReqURL(),
        // our custom index with precedence
        HandlerFactory.indexHandler(root),
        // TODO serve assets (JS/CSS) or bind them in
        // HandlerFactory.assetHandler(),
        HandlerFactory.formUploadHandler(root),
        // only use ecstatic for files
        HandlerFactory.staticHandler(root),
        // last handler that always return 500
        HandlerFactory.failedHandler(),
    ]);
};
