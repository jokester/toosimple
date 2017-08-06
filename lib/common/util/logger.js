"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * @param verbosity
 */
function createLogger(verbosity) {
    return {
        setVerbosity: function (v) {
            verbosity = v;
        },
        // lvl3
        debug: function () {
            var param = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                param[_i] = arguments[_i];
            }
            if (verbosity >= 3) {
                (_a = (console.debug || console.info)).call.apply(_a, [console, "DEBUG"].concat(param));
            }
            var _a;
        },
        // lvl2
        info: function () {
            var param = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                param[_i] = arguments[_i];
            }
            if (verbosity >= 2) {
                (_a = console.info).call.apply(_a, [console, "INFO"].concat(param));
            }
            var _a;
        },
        // lvl1
        warn: function () {
            var param = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                param[_i] = arguments[_i];
            }
            if (verbosity >= 1) {
                (_a = console.warn).call.apply(_a, [console, "WARN"].concat(param));
            }
            var _a;
        },
        // lvl0
        error: function () {
            var param = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                param[_i] = arguments[_i];
            }
            if (verbosity >= 0) {
                (_a = console.error).call.apply(_a, [console, "ERROR"].concat(param));
            }
            var _a;
        },
        // always
        fatal: function () {
            var param = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                param[_i] = arguments[_i];
            }
            (_a = console.error).call.apply(_a, [console, "FATAL"].concat(param));
            var _a;
        }
    };
}
exports.createLogger = createLogger;
var Logger;
(function (Logger) {
    Logger.debug = createLogger(3);
    Logger.normal = createLogger(2);
    Logger.quiet = createLogger(1);
    Logger.silent = createLogger(0);
})(Logger = exports.Logger || (exports.Logger = {}));
