"use strict";
const tslib_1 = require("tslib");
const path = require("path");
const ejs = require("ejs");
const servestatic = require("serve-static");
const fsp = require("./fs-promise");
var HandlerFactory;
(function (HandlerFactory) {
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
            if (!urlPath.endsWith('/'))
                return next();
            if (req.method !== "GET")
                return next();
            // prohibit . / .. in path resolution for security
            // NOTE node.js does not normalize URL
            // (browser often does that, but a crafted client may not)
            const pathParts = urlPath.split('/');
            if (pathParts.some(part => !!part.match(/^\.\.?$/))) {
                res.statusCode = 403;
                res.end();
                return;
            }
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
                if (urlPath !== '/') {
                    children.unshift({
                        name: "../",
                        href: path.join(urlPath, '..'),
                        isDir: true,
                        canDownload: false,
                    });
                }
                const template = yield fsp.readFile(path.join(__dirname, '..', 'assets', 'dir.ejs.html'));
                const html = ejs.render(template.toString(), {
                    title: `${pathParts.slice(0, -1).join('/') || '/'} - toosimple`,
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
            if (req.method !== "POST") {
                return next();
            }
            res.statusCode = 200;
            res.end("NOT IMPLEMENTED");
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
//# sourceMappingURL=http-handler.js.map