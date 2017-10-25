import { IncomingMessage, ServerResponse } from "http";
import * as path from "path";
import * as url from "url";
import * as servestatic from "serve-static";
import * as formidable from "formidable";

import { FSType } from "../common/io";
import { LoggerType } from "../common/util/logger";
import { Theme } from "../components";
import { Renderer } from "./server-rendering";
import { ParsedOptions } from "../options";

import * as helper from "./helper";

type RefinedFS = Pick<FSType, "readDirDetail" | "mv">;
type RefinedOptions = Pick<ParsedOptions, "allowUpload">;

/**
 * dependcies for all handlers
 */
export interface HandlerContext {
    options: RefinedOptions;
    logger: LoggerType;
    fs: RefinedFS;
    renderer: Renderer;
}

interface HTTPHandler {
    (req: IncomingMessage, res: ServerResponse, next?: () => void): void;
}

namespace HandlerFactory {

    /**
     * middleware: log requests to console
     */
    export function dumpReq(log: LoggerType): HTTPHandler {
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

    /**
     * middleware: decode url in request
     */
    export function decodeReqURL(log: LoggerType): HTTPHandler {
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
        };
    }

    /**
     * middleware: reject requests with non-normalized URL
     */
    export function rejectDangerousPath(log: LoggerType): HTTPHandler {
        return (req, res, next) => {
            if (helper.isPathNormalized(req.url)) {
                next();
            } else {
                log.warn(`rejected access to '${req.url}'`);
                res.statusCode = 403;
                res.end();
            }
        };
    }

    /**
     * Combine multiple HTTPHandler(s) into one
     * The new handler will call handlers in turn
     * @param {HTTPHandler[]} handlers
     * @returns {HTTPHandler}
     */
    export function combine(log: LoggerType, handlers: HTTPHandler[]): HTTPHandler {
        handlers = handlers.filter(h => !!h);

        return (req, res, next) => {
            let handlerTried = 0;
            tryHandler(0);
            return;

            function tryHandler(handlerToTry: number) {
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
                } else if (next) {
                    next();
                } else {
                    log.fatal(`HandlerFactory#combile: all handlers are consumed. consider add a next or fallback handler`);
                }
            }
        };
    }

    /**
     * Our handler that serves directory with custom HTML template
     */
    export function indexHTML(ctx: HandlerContext, root: string): HTTPHandler {
        return async (req, res, next) => {
            const urlPath = req.url;

            if (!urlPath.endsWith("/"))
                return next();
            else if (req.method !== "GET")
                return next();

            try {
                const realPath = helper.mappedPath(root, req.url);
                const children = await ctx.fs.readDirDetail(realPath);

                const html = await ctx.renderer.dirIndex(realPath, root, children);

                res.setHeader("Content-Type", "text/html");
                res.end(html);
                return;
            } catch (e) {
                ctx.logger.error(e);
                res.statusCode = 500;
                res.end();
            }

            next();
        };
    }

    export function indexJSON(ctx: HandlerContext, root: string): HTTPHandler {
        return async (req, res, next) => {
            const urlPath = req.url;

            if (!urlPath.endsWith("/"))
                return next();
            else if (req.method !== "GET")
                return next();
            else if (req.headers["x-toosimple-api"] !== "listDir")
                return next();

            try {
                const realPath = helper.mappedPath(root, urlPath);
                const items = await ctx.fs.readDirDetail(realPath);
                res.setHeader("content-type", "application/json");
                res.end(JSON.stringify(items));
            } catch (e) {
                ctx.logger.error(`indexJSON: failed to serve urlPath`);
                res.statusCode = 500;
                res.end();
            }
        };
    }

    /**
     * Serve static file with serve-static
     */
    export function staticHandler(root: string): HTTPHandler {
        return servestatic(root, {
            /** FIXME:  */
            dotfiles: "allow",
            index: false,
        });
    }

    /**
     * File uploading handler
     * files POST-ed to `/a/b/c/` will be saved to `root/a/b/c/`
     */
    export function formUploadHandler(fs: RefinedFS, log: LoggerType, fsRoot: string): HTTPHandler {

        return async (req, res, next) => {
            const urlPath = req.url;
            if (req.method !== "POST") {
                return next();
            } else if (!urlPath.endsWith("/")) {
                return next();
            }

            const pathParts = urlPath.split("/");
            const fsPath = path.join(fsRoot, ...pathParts);

            try {
                const form = new formidable.IncomingForm();
                form.multiples = true;
                // FIXME should we create upload under root?
                const uploaded = await helper.parseForm(form, req);

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
     * TODO: serve actual assets
     */
    export function assetHandler(log: LoggerType, assetRoot: string): HTTPHandler {
        return (req, res, next) => {
            log.debug("");
            res.statusCode = 500;
            res.end();
        };
    }

    /**
     * Always return 500 to finish the response
     */
    export function failedHandler(log: LoggerType): HTTPHandler {
        return (req, res, next) => {
            log.error("");
            try {
                res.statusCode = 500;
                res.end();
            } catch (e) { }
        };
    }
}

export function createHandler(ctx: HandlerContext, fsRoot: string) {

    // HandlerFactory.assetHandler(),
    return HandlerFactory.combine(ctx.logger, [

        HandlerFactory.rejectDangerousPath(ctx.logger),

        HandlerFactory.decodeReqURL(ctx.logger),

        // HandlerFactory.assetHandler(),

        HandlerFactory.dumpReq(ctx.logger),

        HandlerFactory.indexJSON(ctx, fsRoot),

        // our custom index with precedence
        HandlerFactory.indexHTML(ctx, fsRoot),

        // TODO serve assets (JS/CSS) or embed them in html


        // FIXME: enable/disable upload control
        HandlerFactory.formUploadHandler(ctx.fs, ctx.logger, fsRoot),

        // TODO: ajax (FormData) upload handler

        // only use ecstatic for files
        HandlerFactory.staticHandler(fsRoot),

        // last handler that always return 500
        HandlerFactory.failedHandler(ctx.logger),
    ]);
}
