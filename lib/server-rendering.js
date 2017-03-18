"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Components for server rendering
 */
const preact = require("preact");
const preact_render_to_string_1 = require("preact-render-to-string");
const components_1 = require("./components");
function renderIndex(props) {
    const index = preact.h(components_1.FileList, { items: props.items });
    return preact_render_to_string_1.render(index);
}
exports.renderIndex = renderIndex;
