"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const preact = require("preact");
class DirItem extends preact.Component {
    render() {
        const item = this.props.item;
        return (preact.h("li", null,
            preact.h("a", { download: item.canDownload, href: item.href, title: item.name }, item.name)));
    }
}
exports.DirItem = DirItem;
class FileList extends preact.Component {
    render() {
        const props = this.props;
        return (preact.h("ul", null, this.props.items.map((item, k) => preact.h(DirItem, { item: item, key: k }))));
    }
}
exports.FileList = FileList;
class FileNavigator extends preact.Component {
    render() {
        return preact.h("p", null, "ho");
    }
}
