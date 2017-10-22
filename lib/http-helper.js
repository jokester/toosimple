"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
/**
 * Most UA normalizes URL and removes '/../' before sending it.
 * (nodejs does not normalize URL).
 * A crafted UA may not do so, which we have to reject for security.
 *
 * @param {string} path
 * @returns {boolean} whether path contains *no* '/../' or '.'
 */
function isPathNormalized(path) {
    // prohibit . / .. in path resolution for security
    // NOTE node.js does not normalize URL
    // (browser often does that, but a crafted client may not)
    if (path.match("//"))
        return false;
    const pathParts = path.split("/");
    return !pathParts.some(part => !!part.match(/^\.\.?$/));
}
exports.isPathNormalized = isPathNormalized;
function parseForm(parser, req) {
    return new Promise((fulfill, reject) => {
        parser.parse(req, (err, fields, files) => {
            if (err) {
                reject(err);
            }
            else {
                fulfill({ fields: fields, files: files });
            }
        });
    });
}
exports.parseForm = parseForm;
/**
 *
 * @export
 * @param {string} root root path in filesystem
 * @param {string} urlStr path from a {IncomingMessage} object
 * @returns filesystem path that corresponds to joined (root + normalizedPath)
 *
 */
function mappedPath(root, normalizedPath) {
    return path.join(root, ...normalizedPath.split("/"));
}
exports.mappedPath = mappedPath;
