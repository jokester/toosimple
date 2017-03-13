import { IncomingMessage, ServerResponse } from "http";
import * as path from "path";
import * as url from "url";
import * as ejs from "ejs";
import * as formidable from "formidable";
import * as servestatic from "serve-static";

import { AbstractService } from './service';

interface HTTPHandler {
    (req: IncomingMessage, res: ServerResponse, next?: () => void): void;
}

export namespace Helper {

    /**
     * Most UA normalizes URL and removes '/../' before sending it.
     * (nodejs does not normalize URL).
     * A crafted UA may not do so, which we have to reject for security.
     *
     * @param {string} path
     * @returns {boolean} whether path contains *no* '/../' or '.'
     */
    export function isPathNormalized(path: string): boolean {
        // prohibit . / .. in path resolution for security
        // NOTE node.js does not normalize URL
        // (browser often does that, but a crafted client may not)
        if (path.match('//'))
            return false;

        const pathParts = path.split("/");
        return !pathParts.some(part => !!part.match(/^\.\.?$/));
    }

    type ParsedForm = { fields: formidable.Fields, files: formidable.Files }
    export function parseForm(parser: formidable.IncomingForm,
        req: IncomingMessage): Promise<ParsedForm> {
        return new Promise((fulfill, reject) => {
            parser.parse(req, (err, fields, files) => {
                if (err) {
                    reject(err);
                } else {
                    fulfill({ fields: fields, files: files });
                }
            });
        });
    }

    export function getPath(urlStr: string) {
    }

    /**
     * 
     * @export
     * @param {string} root root path in filesystem
     * @param {string} urlStr path from a {IncomingMessage} object
     * @returns filesystem path that corresponds to joined (root + normalizedPath)
     * 
     */
    export function mappedPath(root: string, normalizedPath: string) {
        return path.join(root, ...normalizedPath.split('/'));
    }
}

namespace HandlerFactory {

    /**
     * middleware: log requests to console
     */
    export function dumpReq(log: AbstractService.Log): HTTPHandler {
        return (req, res, next) => {
            switch (req.url) {
                case "/favicon.ico":
                    break;
                default:
                    log.info(`${req.method} ${req.url}`);
            }
            next();
        }
    }

    /**
     * middleware: decode url in request
     */
    export function decodeReqURL(log: AbstractService.Log): HTTPHandler {
        return (req, res, next) => {
            try {
                // NOTE this also drops query/hash from path
                const before = req.url;
                const parsed = url.parse(req.url);
                const after = req.url = decodeURI(parsed.pathname);
                log.debug(`decodeReqURL(): '${before}' => '${after}'`);
                next();
            } catch (e) {
                log.error(e);
                res.statusCode = 500;
                res.end(`error decoding URL`);
            }
        }
    }

    /**
     * middleware: reject requests with non-normalized URL
     */
    export function rejectDangerousPath(log: AbstractService.Log): HTTPHandler {
        return (req, res, next) => {
            if (Helper.isPathNormalized(req.url)) {
                next();
            } else {
                res.statusCode = 403;
                res.end();
            }
        }
    }

    /**
     * Combine multi HTTPHandler(s) into one
     * The new handler will call handlers one by one.
     * @param {HTTPHandler[]} handlers
     * @returns {HTTPHandler}
     */
    export function combine(log: AbstractService.Log, handlers: HTTPHandler[]): HTTPHandler {
        return (req, res, next) => {
            let handlerTried = 0;
            tryHandler(0);

            function tryHandler(handlerToTry: number) {
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
                } else if (next) {
                    next();
                } else {
                    res.statusCode = 500;
                }
            };
        };
    }

    /**
     * Our handler that serves directory with custom HTML template
     */
    export function indexHTML(fs: AbstractService.FS, log: AbstractService.Log, root: string): HTTPHandler {
        const templateStr = fs.readText(path.join(__dirname, "..", "assets", "dir.ejs.html"), { encoding: 'utf-8' });
        return async (req, res, next) => {
            const urlPath = req.url;

            if (!urlPath.endsWith("/"))
                return next();
            else if (req.method !== "GET")
                return next();

            const pathParts = urlPath.split("/");

            try {
                const realPath = Helper.mappedPath(root, req.url);
                const children = await fs.readDirDetail(realPath);

                // add link to ..
                if (urlPath !== "/") {
                    children.unshift({
                        name: "..",
                        isDir: true,
                        size: -1
                    });
                }

                // FIXME  render index as a service
                const html = ejs.render(await templateStr, {
                    // FIXME title may contain '//' form certain URL
                    title: `${pathParts.slice(0, -1).join("/") || "/"} - toosimple`,
                    items: children,
                    urlPath: urlPath,
                });
                res.end(html);
                return;
            } catch (e) {
                log.error(e);
            }

            next();
        };
    }

    export function indexJSON(fs: AbstractService.FS, log: AbstractService.Log, root: string): HTTPHandler {
        return async (req, res, next) => {
            // TODO
        }
    }

    /**
     * Serve static file with serve-static
     */
    export function staticHandler(root: string): HTTPHandler {
        return servestatic(root, {
            dotfiles: "allow",
            index: false,
        });
    }

    /**
     * File uploading handler
     * files POST-ed to `/a/b/c/` will be saved to `root/a/b/c/`
     */
    export function formUploadHandler(fs: AbstractService.FS, log: AbstractService.Log, root: string): HTTPHandler {

        return async (req, res, next) => {
            const urlPath = req.url;
            if (req.method !== "POST") {
                return next();
            } else if (!urlPath.endsWith("/")) {
                return next();
            }

            const pathParts = urlPath.split("/");
            const fsPath = path.join(root, ...pathParts);

            try {
                const form = new formidable.IncomingForm();
                form.multiples = true;
                // FIXME should we create upload under root?
                const uploaded = await Helper.parseForm(form, req);

                // flatten file array
                const files: formidable.File[] = [];
                for (const fName in uploaded.files) {
                    const f = uploaded.files[fName];
                    // f maybe File[] or File
                    if (f instanceof Array) {
                        files.push(...f);
                    } else {
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

                    await fs.mv(f.path, newPath);
                }
                res.statusCode = 302;
                res.setHeader("Location", urlPath);
                res.end();
            } catch (e) {
                res.statusCode = 500;
                res.end();
                log.error(e);
            }
        };
    }

    /**
     * serve static assets with another serve-asset middleware
     * TODO serve actual assets
     */
    export function assetHandler(assetRoot: string): HTTPHandler {
        return (req, res, next) => {

            res.statusCode = 500;
            res.end();
        };
    }

    /**
     * Always return 500 to finish the response
     */
    export function failedHandler(): HTTPHandler {
        return (req, res, next) => {
            res.statusCode = 500;
            res.end();
        };
    }
}

export const createHandler = (fs: AbstractService.FS, log: AbstractService.Log, root: string) => {

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
