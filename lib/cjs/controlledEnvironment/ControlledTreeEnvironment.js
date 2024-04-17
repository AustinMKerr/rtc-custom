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
exports.ControlledTreeEnvironment = exports.useTreeEnvironment = void 0;
var React = __importStar(require("react"));
var react_1 = require("react");
var InteractionManagerProvider_1 = require("./InteractionManagerProvider");
var DragAndDropProvider_1 = require("../drag/DragAndDropProvider");
var EnvironmentActionsProvider_1 = require("../environmentActions/EnvironmentActionsProvider");
var useControlledTreeEnvironmentProps_1 = require("./useControlledTreeEnvironmentProps");
var TreeEnvironmentContext = React.createContext(null);
var useTreeEnvironment = function () { return (0, react_1.useContext)(TreeEnvironmentContext); };
exports.useTreeEnvironment = useTreeEnvironment;
exports.ControlledTreeEnvironment = React.forwardRef(function (props, ref) {
    var _a, _b, _c;
    var environmentContextProps = (0, useControlledTreeEnvironmentProps_1.useControlledTreeEnvironmentProps)(props);
    var viewState = props.viewState;
    // Make sure that every tree view state has a focused item
    for (var _i = 0, _d = Object.keys(environmentContextProps.trees); _i < _d.length; _i++) {
        var treeId = _d[_i];
        // TODO if the focus item is dragged out of the tree and is not within the expanded items
        // TODO of that tree, the tree does not show any focus item anymore.
        // Fix: use linear items to see if focus item is visible, and reset if not. Only refresh that
        // information when the viewstate changes
        if (!((_a = viewState[treeId]) === null || _a === void 0 ? void 0 : _a.focusedItem) &&
            environmentContextProps.trees[treeId]) {
            viewState[treeId] = __assign(__assign({}, viewState[treeId]), { focusedItem: (_c = (_b = props.items[environmentContextProps.trees[treeId].rootItem]) === null || _b === void 0 ? void 0 : _b.children) === null || _c === void 0 ? void 0 : _c[0] });
        }
    }
    return (React.createElement(TreeEnvironmentContext.Provider, { value: environmentContextProps },
        React.createElement(InteractionManagerProvider_1.InteractionManagerProvider, null,
            React.createElement(DragAndDropProvider_1.DragAndDropProvider, null,
                React.createElement(EnvironmentActionsProvider_1.EnvironmentActionsProvider, { ref: ref }, props.children)))));
});
