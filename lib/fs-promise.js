"use strict";
const fs = require("fs");
const util_1 = require("./util");
exports.readdir = util_1.Promisify.toPromise1(fs.readdir);
exports.readFile = util_1.Promisify.toPromise1(fs.readFile);
exports.lstat = util_1.Promisify.toPromise1(fs.lstat);
exports.stat = util_1.Promisify.toPromise1(fs.stat);
//# sourceMappingURL=fs-promise.js.map