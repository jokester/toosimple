import { IncomingMessage, ServerResponse } from 'http';

/// <reference path="./ecstatic.d.ts" />
import ecstatic = require('ecstatic');

interface HTTPHandler {
    (req: IncomingMessage, res: ServerResponse, next?: () => void): void
}

export const handlerFactory = {


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

    export function indexHandler(root: string): HTTPHandler {
        return (req, res, next) => {
            // TODO
        };
    }

    export function staticHandler(root: string): HTTPHandler {
        return ecstatic({
            root: root,
            autoIndex: false,
            handleError: false,
        });
    }

    export function uploadHandler(root: string): HTTPHandler {
        return (req, res, next) => {
            if (req.method !== "PUT") {
                return next();
            }
        }
    }

    export function fallbackHandler(): HTTPHandler {
        return (req, res, next) => {
            res.statusCode = 500;
            res.end();
        }
    }
}

/**
 *
 */
export const createHandler = (root: string) => {

    return HandlerFactory.combine([
        HandlerFactory.staticHandler(root),
        HandlerFactory.fallbackHandler(),
    ]);

}