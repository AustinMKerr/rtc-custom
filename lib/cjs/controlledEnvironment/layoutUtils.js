"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOutsideOfContainer = exports.computeItemHeightArray = exports.computeItemHeight = void 0;
var utils_1 = require("../utils");
var computeItemHeight = function (treeId) {
    var _a, _b;
    var firstItem = (_a = (0, utils_1.getDocument)()) === null || _a === void 0 ? void 0 : _a.querySelector("[data-rct-tree=\"".concat(treeId, "\"] [data-rct-item-container=\"true\"]"));
    return (_b = firstItem === null || firstItem === void 0 ? void 0 : firstItem.offsetHeight) !== null && _b !== void 0 ? _b : 5;
};
exports.computeItemHeight = computeItemHeight;
var computeItemHeightArray = function (treeId) {
    var document = (0, utils_1.getDocument)();
    if (!document) {
        return [];
    }
    var items = document.querySelectorAll("[data-rct-tree=\"".concat(treeId, "\"] [data-rct-item-container=\"true\"]"));
    return Array.from(items).map(function (item) { return item.offsetHeight; });
};
exports.computeItemHeightArray = computeItemHeightArray;
var isOutsideOfContainer = function (e, treeBb) {
    return e.clientX < treeBb.left ||
        e.clientX > treeBb.right ||
        e.clientY < treeBb.top ||
        e.clientY > treeBb.bottom;
};
exports.isOutsideOfContainer = isOutsideOfContainer;
