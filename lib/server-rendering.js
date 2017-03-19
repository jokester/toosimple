"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Components for server rendering
 */
const preact = require("preact");
const preact_render_to_string_1 = require("preact-render-to-string");
const components_1 = require("./components");
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
