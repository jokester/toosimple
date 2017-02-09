"use strict";
const ecstatic = require('ecstatic');
var HandlerFactory;
(function (HandlerFactory) {
    function combine(handlers) {
        return (req, res, next) => {
            // NOTE handlers should behave and call next() once at most 
            let nextIndex = 0;
            const tryNextHandler = () => {
                const nextHandler = handlers[nextIndex++];
                if (nextHandler) {
                    nextHandler(req, res, tryNextHandler);
                }
                else if (next) {
                    next();
                }
                else {
                    res.statusCode = 500;
                }
            };
            tryNextHandler();
        };
    }
    HandlerFactory.combine = combine;
    /**
     * Our handler that serves directory with custom template
     */
    function indexHandler(root) {
        return (req, res, next) => {
            next();
        };
    }
    HandlerFactory.indexHandler = indexHandler;
    /**
     * Static file handler
     */
    function staticHandler(root) {
        return ecstatic({
            root: root,
            autoIndex: false,
            handleError: true,
        });
    }
    HandlerFactory.staticHandler = staticHandler;
    /**
     * File uploading handler
     */
    function uploadHandler(root) {
        return (req, res, next) => {
            if (req.method !== "PUT") {
                return next();
            }
        };
    }
    HandlerFactory.uploadHandler = uploadHandler;
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
        // only use ecstatic for files
        HandlerFactory.staticHandler(root),
        // last handler that always return 500
        HandlerFactory.failedHandler(),
    ]);
};
//# sourceMappingURL=http-handler.js.map