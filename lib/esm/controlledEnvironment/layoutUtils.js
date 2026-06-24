import { getDocument } from '../utils';
export var computeItemHeight = function (treeId) {
    var _a, _b;
    var firstItem = (_a = getDocument()) === null || _a === void 0 ? void 0 : _a.querySelector("[data-rct-tree=\"".concat(treeId, "\"] [data-rct-item-container=\"true\"]"));
    return (_b = firstItem === null || firstItem === void 0 ? void 0 : firstItem.offsetHeight) !== null && _b !== void 0 ? _b : 5;
};
export var computeItemHeightArray = function (treeId) {
    var document = getDocument();
    if (!document) {
        return [];
    }
    var items = document.querySelectorAll("[data-rct-tree=\"".concat(treeId, "\"] [data-rct-item-container=\"true\"]"));
    return Array.from(items).map(function (item) { return item.offsetHeight; });
};
export var isOutsideOfContainer = function (e, treeBb) {
    return e.clientX < treeBb.left ||
        e.clientX > treeBb.right ||
        e.clientY < treeBb.top ||
        e.clientY > treeBb.bottom;
};
