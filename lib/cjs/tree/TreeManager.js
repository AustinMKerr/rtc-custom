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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeManager = void 0;
var React = __importStar(require("react"));
var react_1 = require("react");
var TreeItemChildren_1 = require("../treeItem/TreeItemChildren");
var DragBetweenLine_1 = require("./DragBetweenLine");
var useFocusWithin_1 = require("./useFocusWithin");
var useTreeKeyboardBindings_1 = require("./useTreeKeyboardBindings");
var SearchInput_1 = require("../search/SearchInput");
var Tree_1 = require("./Tree");
var ControlledTreeEnvironment_1 = require("../controlledEnvironment/ControlledTreeEnvironment");
var DragAndDropProvider_1 = require("../drag/DragAndDropProvider");
var MaybeLiveDescription_1 = require("./MaybeLiveDescription");
var TreeManager = function () {
    var _a = (0, Tree_1.useTree)(), treeId = _a.treeId, rootItem = _a.rootItem, renderers = _a.renderers, treeInformation = _a.treeInformation;
    var environment = (0, ControlledTreeEnvironment_1.useTreeEnvironment)();
    var containerRef = (0, react_1.useRef)();
    var dnd = (0, DragAndDropProvider_1.useDragAndDrop)();
    (0, useTreeKeyboardBindings_1.useTreeKeyboardBindings)();
    (0, useFocusWithin_1.useFocusWithin)(containerRef.current, function () {
        environment.setActiveTree(treeId);
    }, function () {
        environment.setActiveTree(function (oldTreeId) {
            return oldTreeId === treeId ? undefined : oldTreeId;
        });
    });
    var rootChildren = environment.items[rootItem].children;
    var treeChildren = (React.createElement(React.Fragment, null,
        React.createElement(MaybeLiveDescription_1.MaybeLiveDescription, null),
        React.createElement(TreeItemChildren_1.TreeItemChildren, { depth: 0, parentId: rootItem }, rootChildren !== null && rootChildren !== void 0 ? rootChildren : []),
        React.createElement(DragBetweenLine_1.DragBetweenLine, { treeId: treeId }),
        React.createElement(SearchInput_1.SearchInput, { containerRef: containerRef.current })));
    var containerProps = __assign({ onDragOver: function (e) {
            e.preventDefault(); // Allow drop. Also implicitly set by items, but needed here as well for dropping on empty space
            dnd.onDragOverTreeHandler(e, treeId, containerRef);
        }, onMouseDown: function () { return dnd.abortProgrammaticDrag(); }, ref: containerRef, style: { position: 'relative' }, role: 'tree', 'aria-label': !treeInformation.treeLabelledBy
            ? treeInformation.treeLabel
            : undefined, 'aria-labelledby': treeInformation.treeLabelledBy }, {
        'data-rct-tree': treeId,
    });
    return renderers.renderTreeContainer({
        children: treeChildren,
        info: treeInformation,
        containerProps: containerProps,
    });
};
exports.TreeManager = TreeManager;
