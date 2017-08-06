"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 *
 */
var preact = require("preact");
var Greeting = (function (_super) {
    tslib_1.__extends(Greeting, _super);
    function Greeting() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Greeting.prototype.render = function () {
        return preact.h("p", null, "hey");
    };
    return Greeting;
}(preact.Component));
preact.render(preact.h(Greeting, null), document.body);
var AJAX;
(function (AJAX) {
    function listDir(path) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, getJSON(path, { "X-toosimple-api": "listDir" })];
            });
        });
    }
    AJAX.listDir = listDir;
    function uploadFile(file, destPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            return tslib_1.__generator(this, function (_a) {
                throw "NOT IMPLEMENTED";
            });
        });
    }
    AJAX.uploadFile = uploadFile;
    function getJSON(url, headers) {
        return getText(url, headers)
            .then(function (jsonStr) { return JSON.parse(jsonStr); });
    }
    var setHeaders = function (headers) { return function (xhr) {
        if (headers) {
            for (var k in headers) {
                xhr.setRequestHeader(k, headers[k]);
            }
        }
    }; };
    function getText(url, headers) {
        return request("GET", url, setHeaders(headers))
            .then(function (xhr) { return xhr.responseText; });
    }
    function request(method, url, decorator) {
        return new Promise(function (fulfill, reject) {
            var xhr = new XMLHttpRequest();
            if (decorator)
                decorator(xhr);
            xhr.onerror = function () { return reject(xhr); };
            xhr.onabort = function () { return reject(xhr); };
            xhr.onreadystatechange = function () {
                if (xhr.status === XMLHttpRequest.DONE) {
                    if (200 <= xhr.status && xhr.status < 400) {
                        fulfill(xhr);
                    }
                    else {
                        reject(xhr);
                    }
                }
            };
        });
    }
})(AJAX || (AJAX = {}));
AJAX.listDir("/").then(function (l) { return console.log("AJAX.listDir", l); });
