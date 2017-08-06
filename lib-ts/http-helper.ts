import * as path from "path";
import { IncomingMessage, ServerResponse } from "http";
import * as formidable from "formidable";

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
    if (path.match("//"))
        return false;

    const pathParts = path.split("/");
    return !pathParts.some(part => !!part.match(/^\.\.?$/));
}

export function parseForm(parser: formidable.IncomingForm,
    req: IncomingMessage) {

    type ParsedForm = { fields: formidable.Fields, files: formidable.Files };
    return new Promise<ParsedForm>((fulfill, reject) => {
        parser.parse(req, (err, fields, files) => {
            if (err) {
                reject(err);
            } else {
                fulfill({ fields: fields, files: files });
            }
        });
    });
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
    return path.join(root, ...normalizedPath.split("/"));
}