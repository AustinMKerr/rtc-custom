"use strict";
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
exports.DragBetweenLine = void 0;
var React = __importStar(require("react"));
var Tree_1 = require("./Tree");
var DragAndDropProvider_1 = require("../drag/DragAndDropProvider");
var DragBetweenLine = function (_a) {
    var _b;
    var treeId = _a.treeId;
    var _c = (0, DragAndDropProvider_1.useDragAndDrop)(), draggingPosition = _c.draggingPosition, itemHeight = _c.itemHeight, itemsHeightArray = _c.itemsHeightArray;
    var renderers = (0, Tree_1.useTree)().renderers;
    var shouldDisplay = draggingPosition &&
        draggingPosition.targetType === 'between-items' &&
        draggingPosition.treeId === treeId;
    if (!shouldDisplay) {
        return null;
    }
    var lineProps = {
        onDragOver: function (e) { return e.preventDefault(); }, // Allow dropping
    };
    return (React.createElement("div", { style: {
            position: 'absolute',
            left: '0',
            right: '0',
            top: "".concat(itemsHeightArray.slice(0, (_b = draggingPosition === null || draggingPosition === void 0 ? void 0 : draggingPosition.linearIndex) !== null && _b !== void 0 ? _b : 0).reduce(function (acc, height) { return acc + height; }, 0), "px"),
        } }, renderers.renderDragBetweenLine({
        draggingPosition: draggingPosition,
        lineProps: lineProps,
    })));
};
exports.DragBetweenLine = DragBetweenLine;
