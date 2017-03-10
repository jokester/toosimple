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
     * Combile multi HTTPHandler(s) to one
     * The new handler will use {@param handler} one by one.
     * @param {HTTPHandler[]} handlers
     * @returns {HTTPHandler}
     */
    export function combine(log: AbstractService.Log, handlers: HTTPHandler[]): HTTPHandler {
        return (req, res, next) => {
            let handlerTried = 0;
            tryHandler(0);

            function tryHandler(handlerToTry: number) {
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
     * Our handler that serves directory with custom template
     */
    export function indexHandler(fs: AbstractService.FS, log: AbstractService.Log, root: string): HTTPHandler {
        const templateStr = fs.readText(path.join(__dirname, "..", "assets", "dir.ejs.html"), { encoding: 'utf-8' });
        return async (req, res, next) => {
            const urlPath = req.url;

            if (!urlPath.endsWith("/"))
                return next();
            else if (req.method !== "GET")
                return next();

            const pathParts = urlPath.split("/");

            // FIXME add an option to prohibit symlink
            try {
                const realPath = path.join(root, ...pathParts);
                const stat = await fs.stat(realPath);
                if (!stat.isDirectory()) {
                    return next();
                }

                const childNames = await fs.readDir(realPath);
                const children = await Promise.all(childNames.map(async name => {
                    const fullPath = path.join(realPath, name);
                    const stat = await fs.stat(fullPath);
                    const nameWithSlash = stat.isDirectory() ? `${name}/` : name;
                    const href = path.join(urlPath, nameWithSlash);
                    const canDownload = !stat.isDirectory();
                    return {
                        name: nameWithSlash,
                        href: href,
                        isDir: stat.isDirectory(),
                        canDownload: canDownload,
                    };
                }));

                // add link to ..
                if (urlPath !== "/") {
                    children.unshift({
                        name: "../",
                        href: path.join(urlPath, ".."),
                        isDir: true,
                        canDownload: false,
                    });
                }

                const html = ejs.render(await templateStr, {
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
        HandlerFactory.indexHandler(fs, log, root),

        // TODO serve assets (JS/CSS) or bind them in
        // HandlerFactory.assetHandler(),
        HandlerFactory.formUploadHandler(fs, log, root),

        // only use ecstatic for files
        HandlerFactory.staticHandler(root),

        // last handler that always return 500
        HandlerFactory.failedHandler(),
    ]);
};
