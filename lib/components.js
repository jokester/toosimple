"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var preact = require("preact");
var DirItem = (function (_super) {
    tslib_1.__extends(DirItem, _super);
    function DirItem() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DirItem.prototype.render = function () {
        var item = this.props.item;
        return (preact.h("li", null,
            preact.h("a", { download: item.canDownload, href: item.href, title: item.name }, item.name)));
    };
    return DirItem;
}(preact.Component));
exports.DirItem = DirItem;
var FileList = (function (_super) {
    tslib_1.__extends(FileList, _super);
    function FileList() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FileList.prototype.render = function () {
        var props = this.props;
        return (preact.h("ul", null, this.props.items.map(function (item, k) { return preact.h(DirItem, { item: item, key: k }); })));
    };
    return FileList;
}(preact.Component));
exports.FileList = FileList;
var FileNavigator = (function (_super) {
    tslib_1.__extends(FileNavigator, _super);
    function FileNavigator() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    FileNavigator.prototype.render = function () {
        return preact.h("p", null, "ho");
    };
    return FileNavigator;
}(preact.Component));
