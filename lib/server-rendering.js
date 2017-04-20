"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 * Components for server rendering
 */
var preact = require("preact");
var preact_render_to_string_1 = require("preact-render-to-string");
var components_1 = require("./components");
var IndexPage = (function (_super) {
    tslib_1.__extends(IndexPage, _super);
    function IndexPage() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    IndexPage.prototype.render = function (props) {
        return (preact.h("body", { class: "hack dark-grey" },
            preact.h("div", { class: "main container grid" },
                preact.h("div", { id: "file-list", class: "cell -8of12" },
                    preact.h("h1", null, "Files"),
                    preact.h("h3", null, props.fsPath),
                    preact.h(components_1.FileList, { items: props.items })),
                preact.h("div", { id: "upload-box", class: "cell -4of12" },
                    preact.h("h1", null, "Upload"),
                    preact.h("form", { method: "POST", encType: "multipart/form-data" },
                        preact.h("p", null,
                            preact.h("input", { type: "file", name: "file1", multiple: true })),
                        preact.h("input", { type: "submit", value: "Upload" })))),
            preact.h("div", { id: "footer" },
                preact.h("h6", null,
                    "Powered by ",
                    preact.h("a", { href: "https://github.com/jokester/toosimple" }, "jokester/toosimple")))));
    };
    return IndexPage;
}(preact.Component));
function renderIndex(props) {
    var index = preact.h(IndexPage, tslib_1.__assign({}, props));
    return [
        "<!DOCTYPE html>\n<html lang=\"en-US\">",
        head(props.title),
        preact_render_to_string_1.render(index, null, { pretty: false }),
        "</html>"
    ].join("");
}
exports.renderIndex = renderIndex;
function head(title) {
    return [
        "<head>\n<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />",
        preact_render_to_string_1.render(preact.h("title", null, title)),
        "<link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/hack/0.7.7/hack.css\" integrity=\"sha256-c/3noOgwbDGzfWfBnqwqAi9yTPr11DTSZlQJ5grjOB0=\"\n        crossorigin=\"anonymous\" />\n<link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/hack/0.7.7/dark-grey.css\" integrity=\"sha256-B9oAyfCZFHDKM9Bw4VeYLURNKjAnpdAXRxYglycpmxY=\"\n        crossorigin=\"anonymous\" />\n\n<style type=\"text/css\">\n\n    #file-list > h1, #upload-box > h1 {\n        display: block;\n    }\n\n    #file-list,\n    #upload-box,\n    #footer {\n        padding: 4px;\n    }\n\n    #footer {\n        display: none;\n    }\n\n    @media screen and (min-width:768px) {\n        #footer {\n            display: inline-block;\n            position: fixed;\n            right: 0px;\n            bottom: 0px;\n        }\n    }\n</style>\n</head>"
    ].join("");
}
