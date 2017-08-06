"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("./fs");
function chunkToLines(chunk) {
    return chunk.toString().split(/\r\n|\r|\n/);
}
exports.chunkToLines = chunkToLines;
function readLines(filename) {
    return fs_1.FS.readFile(filename).then(chunkToLines);
}
exports.readLines = readLines;
