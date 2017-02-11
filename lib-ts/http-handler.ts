import { IncomingMessage, ServerResponse } from 'http';
import * as path from 'path';
import * as ejs from 'ejs';

import * as servestatic from 'serve-static';

import * as fsp from './fs-promise';

interface HTTPHandler {
    (req: IncomingMessage, res: ServerResponse, next?: () => void): void
}

module HandlerFactory {

    export function combine(handlers: HTTPHandler[]): HTTPHandler {
        return (req, res, next) => {
            let handlerTried = 0;

            const tryHandler = (handlerToTry: number) => {
                if (handlerTried !== handlerToTry) {
                    console.error(`HandlerFactory#combile: next() for handler#${handlerToTry - 1} is called more than once`);
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
            }
            tryHandler(0);
        };
    }

    /**
     * Our handler that serves directory with custom template
     */
    export function indexHandler(root: string): HTTPHandler {
        return async (req, res, next) => {
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
                const stat = await fsp.stat(realPath);
                if (!stat.isDirectory()) {
                    return next();
                }

                const childNames = await fsp.readdir(realPath);
                const children = await Promise.all(childNames.map(async name => {
                    const fullPath = path.join(realPath, name);
                    const stat = await fsp.stat(fullPath);
                    const nameWithSlash = stat.isDirectory() ? `${name}/` : name;
                    const href = path.join(urlPath, nameWithSlash);
                    const canDownload = !stat.isDirectory();
                    return {
                        name: nameWithSlash,
                        href: href,
                        isDir: stat.isDirectory(),
                        canDownload: canDownload,
                    }
                }));

                if (urlPath !== '/') {
                    children.unshift({
                        name: "../",
                        href: path.join(urlPath, '..'),
                        isDir: true,
                        canDownload: false,
                    })
                }

                const template = await fsp.readFile(path.join(__dirname, '..', 'assets', 'dir.ejs.html'));
                const html = ejs.render(template.toString(), {
                    title: `${pathParts.slice(0, -1).join('/')} -- -□-□-`,
                    items: children,
                    urlPath: urlPath,
                });
                res.end(html);
                return;
            } catch (e) {
                console.error(e);
            }

            next();
        };
    }

    /**
     * Static file handler
     *
     */
    export function staticHandler(root: string): HTTPHandler {
        return servestatic(root, {
            dotfiles: "allow",
            index: false,
        });
    }

    /**
     * File uploading handler
     */
    export function formUploadHandler(root: string): HTTPHandler {
        return (req, res, next) => {
            if (req.method !== "POST") {
                return next();
            }

            res.statusCode = 200;
            res.end("NOT IMPLEMENTED");
        }
    }

    /**
     * serve static assets with another ecstatic middleware
     */
    export function assetHandler(assetRoot: string): HTTPHandler {
        return (req, res, next) => {

            res.statusCode = 500;
            res.end();
        }
    }

    /**
     * Always return 500 to finish the response
     */
    export function failedHandler(): HTTPHandler {
        return (req, res, next) => {
            res.statusCode = 500;
            res.end();
        }
    }
}

export const createHandler = (root: string) => {

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