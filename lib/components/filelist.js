"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const preact = require("preact");
function DirItem(props) {
    const item = props.item;
    return (preact.h("li", { key: String(props.key) },
        preact.h("a", { download: item.canDownload, href: item.href, title: item.name }, item.name)));
}
function DirList(props) {
    return (preact.h("ul", null, props.items.map((item, k) => preact.h(DirItem, { item: item, key: k }))));
}
exports.DirList = DirList;
