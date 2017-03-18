"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 *
 */
const preact = require("preact");
const preact_render_to_string_1 = require("preact-render-to-string");
class Greeting extends preact.Component {
    render() {
        return preact.h("p", null, "hey");
    }
}
preact.render(preact.h(Greeting, null), document.body);
class FileNavigator extends preact.Component {
    render() {
        return preact.h("p", null, "ho");
    }
}
const FileService = {
    listDir(path) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return AJAX.getJSON(path, { 'X-toosimple-api': "listDir" });
        });
    },
    uploadFile(file, destPath) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
        });
    }
};
var AJAX;
(function (AJAX) {
    function getJSON(url, headers) {
        return getText(url, headers)
            .then(jsonStr => JSON.parse(jsonStr));
    }
    AJAX.getJSON = getJSON;
    const setHeaders = (headers) => (xhr) => {
        if (headers) {
            for (const k in headers) {
                xhr.setRequestHeader(k, headers[k]);
            }
        }
    };
    function getText(url, headers) {
        return request("GET", url, setHeaders(headers))
            .then(xhr => xhr.responseText);
    }
    function request(method, url, decorator) {
        return new Promise((fulfill, reject) => {
            const xhr = new XMLHttpRequest();
            if (decorator)
                decorator(xhr);
            xhr.onerror = () => reject(xhr);
            xhr.onabort = () => reject(xhr);
            xhr.onreadystatechange = () => {
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
console.log("RENDERED", preact_render_to_string_1.render(preact.h(Greeting, null)));
