import * as React from 'react';
import { useTree } from './Tree';
import { useDragAndDrop } from '../drag/DragAndDropProvider';
export var DragBetweenLine = function (_a) {
    var _b;
    var treeId = _a.treeId;
    var _c = useDragAndDrop(), draggingPosition = _c.draggingPosition, itemHeight = _c.itemHeight, itemsHeightArray = _c.itemsHeightArray;
    var renderers = useTree().renderers;
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
