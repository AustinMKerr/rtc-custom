"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useControlledTreeEnvironmentProps = void 0;
var react_1 = require("react");
var scrollIntoView_1 = require("../tree/scrollIntoView");
var useRenderers_1 = require("../renderers/useRenderers");
var utils_1 = require("../utils");
var getItemsLinearly_1 = require("../tree/getItemsLinearly");
var useRefCopy_1 = require("../useRefCopy");
var useControlledTreeEnvironmentProps = function (_a) {
    var onExpandItemProp = _a.onExpandItem, onCollapseProp = _a.onCollapseItem, onDropProp = _a.onDrop, props = __rest(_a, ["onExpandItem", "onCollapseItem", "onDrop"]);
    var _b = (0, react_1.useState)({}), trees = _b[0], setTrees = _b[1];
    var _c = (0, react_1.useState)(), activeTreeId = _c[0], setActiveTreeId = _c[1];
    var treeIds = (0, react_1.useMemo)(function () { return Object.keys(trees); }, [trees]);
    var onFocusItem = props.onFocusItem, autoFocus = props.autoFocus, onRegisterTree = props.onRegisterTree, onUnregisterTree = props.onUnregisterTree, items = props.items, viewState = props.viewState;
    var onFocusItemRef = (0, useRefCopy_1.useRefCopy)(onFocusItem);
    var viewStateRef = (0, useRefCopy_1.useRefCopy)(viewState);
    var linearItems = (0, react_1.useMemo)(function () {
        return (0, utils_1.buildMapForTrees)(treeIds, function (treeId) { var _a; return (0, getItemsLinearly_1.getItemsLinearly)(trees[treeId].rootItem, (_a = viewState[treeId]) !== null && _a !== void 0 ? _a : {}, items); });
    }, [trees, items, treeIds, viewState]);
    var onFocusItemHandler = (0, react_1.useCallback)(function (item, treeId, setDomFocus) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (setDomFocus === void 0) { setDomFocus = true; }
        if ((autoFocus !== null && autoFocus !== void 0 ? autoFocus : true) && setDomFocus) {
            var newItem = (_a = (0, utils_1.getDocument)()) === null || _a === void 0 ? void 0 : _a.querySelector("[data-rct-tree=\"".concat(treeId, "\"] [data-rct-item-id=\"").concat(item.index, "\"]"));
            if (((_d = (_c = (_b = (0, utils_1.getDocument)()) === null || _b === void 0 ? void 0 : _b.activeElement) === null || _c === void 0 ? void 0 : _c.attributes.getNamedItem('data-rct-search-input')) === null || _d === void 0 ? void 0 : _d.value) !== 'true') {
                // Move DOM focus to item if the current focus is not on the search input
                (_e = newItem === null || newItem === void 0 ? void 0 : newItem.focus) === null || _e === void 0 ? void 0 : _e.call(newItem);
            }
            else {
                // Otherwise just manually scroll into view
                (0, scrollIntoView_1.scrollIntoView)(newItem);
            }
        }
        if (((_f = viewStateRef.current[treeId]) === null || _f === void 0 ? void 0 : _f.focusedItem) === item.index) {
            return;
        }
        (_g = onFocusItemRef.current) === null || _g === void 0 ? void 0 : _g.call(onFocusItemRef, item, treeId);
    }, [autoFocus, onFocusItemRef, viewStateRef]);
    var registerTree = (0, react_1.useCallback)(function (tree) {
        setTrees(function (trees) {
            var _a;
            return (__assign(__assign({}, trees), (_a = {}, _a[tree.treeId] = tree, _a)));
        });
        onRegisterTree === null || onRegisterTree === void 0 ? void 0 : onRegisterTree(tree);
    }, [onRegisterTree]);
    var unregisterTree = (0, react_1.useCallback)(function (treeId) {
        onUnregisterTree === null || onUnregisterTree === void 0 ? void 0 : onUnregisterTree(trees[treeId]);
        delete trees[treeId];
        setTrees(trees);
    }, [onUnregisterTree, trees]);
    var onCollapseItem = (0, react_1.useCallback)(function (item, treeId) {
        onCollapseProp === null || onCollapseProp === void 0 ? void 0 : onCollapseProp(item, treeId);
        setTrees(function (trees) { return trees; });
    }, [onCollapseProp]);
    var onExpandItem = (0, react_1.useCallback)(function (item, treeId) {
        onExpandItemProp === null || onExpandItemProp === void 0 ? void 0 : onExpandItemProp(item, treeId);
        setTrees(function (trees) { return trees; });
    }, [onExpandItemProp]);
    var onDrop = (0, react_1.useCallback)(function (items, target) {
        onDropProp === null || onDropProp === void 0 ? void 0 : onDropProp(items, target);
        setTrees(function (trees) { return trees; });
    }, [onDropProp]);
    var focusTree = (0, react_1.useCallback)(function (treeId) {
        var _a, _b;
        var focusItem = (_a = (0, utils_1.getDocument)()) === null || _a === void 0 ? void 0 : _a.querySelector("[data-rct-tree=\"".concat(treeId, "\"] [data-rct-item-focus=\"true\"]"));
        (_b = focusItem === null || focusItem === void 0 ? void 0 : focusItem.focus) === null || _b === void 0 ? void 0 : _b.call(focusItem);
    }, []);
    var setActiveTree = (0, react_1.useCallback)(function (treeIdOrSetStateFunction, autoFocusTree) {
        if (autoFocusTree === void 0) { autoFocusTree = true; }
        var maybeFocusTree = function (treeId) {
            var _a, _b;
            if (autoFocusTree &&
                (autoFocus !== null && autoFocus !== void 0 ? autoFocus : true) &&
                treeId &&
                !((_b = (_a = (0, utils_1.getDocument)()) === null || _a === void 0 ? void 0 : _a.querySelector("[data-rct-tree=\"".concat(treeId, "\"]"))) === null || _b === void 0 ? void 0 : _b.contains(document.activeElement))) {
                focusTree(treeId);
            }
        };
        if (typeof treeIdOrSetStateFunction === 'function') {
            setActiveTreeId(function (oldValue) {
                var treeId = treeIdOrSetStateFunction(oldValue);
                if (treeId !== oldValue) {
                    maybeFocusTree(treeId);
                }
                return treeId;
            });
        }
        else {
            var treeId = treeIdOrSetStateFunction;
            setActiveTreeId(treeId);
            maybeFocusTree(treeId);
        }
    }, [autoFocus, focusTree]);
    var renderers = (0, useRenderers_1.useRenderers)(props);
    return __assign(__assign(__assign({}, renderers), props), { onFocusItem: onFocusItemHandler, registerTree: registerTree, unregisterTree: unregisterTree, onExpandItem: onExpandItem, onCollapseItem: onCollapseItem, onDrop: onDrop, setActiveTree: setActiveTree, treeIds: treeIds, trees: trees, activeTreeId: activeTreeId, linearItems: linearItems });
};
exports.useControlledTreeEnvironmentProps = useControlledTreeEnvironmentProps;
