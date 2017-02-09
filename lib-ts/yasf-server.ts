import { IncomingMessage, ServerResponse } from 'http';

/// <reference path="./ecstatic.d.ts" />
import ecstatic = require('ecstatic');

interface HTTPHandler {
    (req: IncomingMessage, res: ServerResponse, next: () => void): void
}

export const handlerFactory = {


}

module HandlerFactory {

    export function combine(handlers: HTTPHandler[]): HTTPHandler {
        return (req, res, next) => {
            // NOTE handlers should behave and call next() no more than once.
            let nextIndex = 0;
            const tryNextHandler = () => {
                const nextHandler = handlers[nextIndex++];
                if (nextHandler) {
                    nextHandler(req, res, tryNextHandler);
                } else {
                    next();
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
export const createServer = (root: string) => (req: IncomingMessage, res: ServerResponse) => {

    return HandlerFactory.combine([
        HandlerFactory.staticHandler(root),
        HandlerFactory.fallbackHandler(),
    ]);

}