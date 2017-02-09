import { IncomingMessage, ServerResponse } from 'http';
import * as path from 'path';

import { EcstaticStatic } from './ecstatic';
const ecstatic = require('ecstatic') as EcstaticStatic;

interface HTTPHandler {
    (req: IncomingMessage, res: ServerResponse, next?: () => void): void
}

module HandlerFactory {

    export function combine(handlers: HTTPHandler[]): HTTPHandler {
        return (req, res, next) => {
            // NOTE handlers should behave and call next() once at most 
            let nextIndex = 0;
            const tryNextHandler = () => {
                const nextHandler = handlers[nextIndex++];
                if (nextHandler) {
                    nextHandler(req, res, tryNextHandler);
                } else if (next) {
                    next();
                } else {
                    res.statusCode = 500;
                }
            }
            tryNextHandler();
        };
    }

    /**
     * Our handler that serves directory with custom template
     */
    export function indexHandler(root: string): HTTPHandler {
        return (req, res, next) => {
            next();
        };
    }

    /**
     * Static file handler
     */
    export function staticHandler(root: string): HTTPHandler {
        return ecstatic({
            root: root,
            autoIndex: false,
            handleError: true,
        });
    }

    /**
     * File uploading handler
     */
    export function uploadHandler(root: string): HTTPHandler {
        return (req, res, next) => {
            if (req.method !== "PUT") {
                return next();
            }
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

        // only use ecstatic for files
        HandlerFactory.staticHandler(root),

        // last handler that always return 500
        HandlerFactory.failedHandler(),
    ]);

};