"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
/**
 * Components for server rendering
 */
const preact = require("preact");
const path = require("path");
const preact_render_to_string_1 = require("preact-render-to-string");
const components_1 = require("./components");
var Render;
(function (Render) {
    function dirIndex(fsPath, fsRoot, items) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const relPath = path.relative(fsRoot, fsPath);
            if (relPath.startsWith("..")) {
                throw new Error(`${fsPath} is outside ${fsRoot}`);
            }
            if (relPath) {
                // when fsPath !== fsRoot, add a link to ..
                items = [{
                        name: "..",
                        size: -1,
                        isDir: true
                    }].concat(items);
            }
            return renderIndex({
                title: `${path.relative(fsRoot, fsPath)}/`,
                fsPath: fsPath,
                items: items.map(i => {
                    const name = i.isDir ? `${i.name}/` : i.name;
                    return {
                        href: name,
                        canDownload: !i.isDir,
                        title: name,
                        name: name,
                    };
                })
            });
        });
    }
    Render.dirIndex = dirIndex;
})(Render = exports.Render || (exports.Render = {}));
class IndexPage extends preact.Component {
    render(props) {
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
    }
}
function renderIndex(props) {
    const index = preact.h(IndexPage, Object.assign({}, props));
    return [
        `<!DOCTYPE html>
<html lang="en-US">`,
        head(props.title),
        preact_render_to_string_1.render(index, null, { pretty: false }),
        `</html>`
    ].join("");
}
exports.renderIndex = renderIndex;
function head(title) {
    return [
        `<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />`,
        preact_render_to_string_1.render(preact.h("title", null, title)),
        `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/hack/0.7.7/hack.css" integrity="sha256-c/3noOgwbDGzfWfBnqwqAi9yTPr11DTSZlQJ5grjOB0="
        crossorigin="anonymous" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/hack/0.7.7/dark-grey.css" integrity="sha256-B9oAyfCZFHDKM9Bw4VeYLURNKjAnpdAXRxYglycpmxY="
        crossorigin="anonymous" />

<style type="text/css">

    #file-list > h1, #upload-box > h1 {
        display: block;
    }

    #file-list,
    #upload-box,
    #footer {
        padding: 4px;
    }

    #footer {
        display: none;
    }

    @media screen and (min-width:768px) {
        #footer {
            display: inline-block;
            position: fixed;
            right: 0px;
            bottom: 0px;
        }
    }
</style>
</head>`
    ].join("");
}
