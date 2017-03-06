/**
 * Export fs as promise
 *
 * (Overloaded function may get incorrect type after Promisify.toPromiseN)
 */
"use strict";
const tslib_1 = require("tslib");
const fs = require("fs");
const util_1 = require("./util");
exports.readdir = util_1.Promisify.toPromise1(fs.readdir);
exports.readFile = util_1.Promisify.toPromise1(fs.readFile);
exports.lstat = util_1.Promisify.toPromise1(fs.lstat);
exports.stat = util_1.Promisify.toPromise1(fs.stat);
exports.unlink = util_1.Promisify.toPromise1(fs.unlink);
exports.mkdtemp = util_1.Promisify.toPromise1(fs.mkdtemp);
exports.rmdir = util_1.Promisify.toPromise1(fs.rmdir);
// NOTE 'rename' (and POSIX 'rename' syscall) is limited to same filesystem.
exports.rename = util_1.Promisify.toPromise2(fs.rename);
function cp(oldPath, newPath) {
    return new Promise((fulfill, reject) => {
        const readStream = fs.createReadStream(oldPath);
        const writeStream = fs.createWriteStream(newPath);
        readStream.on("error", reject);
        writeStream.on("error", reject);
        readStream.on("close", fulfill);
        readStream.pipe(writeStream);
    });
}
exports.cp = cp;
/**
 * mv: use POSIX rename first, and fallback to (cp + unlink)
 *
 * @export
 * @param {string} oldPath
 * @param {string} newPath
 */
function mv(oldPath, newPath) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.rename(oldPath, newPath);
        }
        catch (e) {
            if (e && e.code === "EXDEV") {
                /**
                 * on "EXDEV: cross-device link not permitted" error
                 * fallback to cp + unlink
                 */
                yield cp(oldPath, newPath);
                yield exports.unlink(oldPath);
            }
            else {
                throw e;
            }
        }
    });
}
exports.mv = mv;
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
