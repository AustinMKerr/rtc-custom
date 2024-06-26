"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useDraggingPosition = void 0;
var react_1 = require("react");
var layoutUtils_1 = require("../controlledEnvironment/layoutUtils");
var ControlledTreeEnvironment_1 = require("../controlledEnvironment/ControlledTreeEnvironment");
var useStableHandler_1 = require("../useStableHandler");
var DraggingPositionEvaluation_1 = require("./DraggingPositionEvaluation");
var useGetParentOfLinearItem_1 = require("./useGetParentOfLinearItem");
var useDraggingPosition = function () {
    var dragCode = (0, react_1.useRef)('initial');
    var _a = (0, react_1.useState)(undefined), draggingItems = _a[0], setDraggingItems = _a[1];
    var itemHeight = (0, react_1.useRef)(0);
    var itemsHeightArray = (0, react_1.useRef)([0]);
    var env = (0, ControlledTreeEnvironment_1.useTreeEnvironment)();
    var getParentOfLinearItem = (0, useGetParentOfLinearItem_1.useGetGetParentOfLinearItem)();
    var isNewDragPosition = (0, useStableHandler_1.useStableHandler)(function (e, treeId, hoveringPosition) {
        if (!hoveringPosition) {
            return false;
        }
        var offset = hoveringPosition.offset, linearIndex = hoveringPosition.linearIndex;
        var newDragCode = "".concat(treeId, "__").concat(linearIndex, "__").concat(offset !== null && offset !== void 0 ? offset : '', "__").concat(hoveringPosition.indentation);
        if (newDragCode !== dragCode.current) {
            dragCode.current = newDragCode;
            return true;
        }
        return false;
    });
    /**
     * Returns undefined for invalid drop targets, like outside the tree.
     */
    var getHoveringPosition = (0, useStableHandler_1.useStableHandler)(function (e, treeId, containerRef) {
        if (!containerRef.current) {
            return undefined;
        }
        itemsHeightArray.current = (0, layoutUtils_1.computeItemHeightArray)(treeId);
        var treeBb = containerRef.current.getBoundingClientRect();
        if ((0, layoutUtils_1.isOutsideOfContainer)(e, treeBb)) {
            return undefined;
        }
        var clientYRelativeToTreeTop = e.clientY - treeBb.top;
        var cumulativeHeight = 0;
        var linearIndex = 0;
        var hoveringPosition = 0;
        for (var i = 0; i < itemsHeightArray.current.length; i++) {
            cumulativeHeight += itemsHeightArray.current[i];
            if (clientYRelativeToTreeTop <= cumulativeHeight) {
                linearIndex = i;
                // Calculate hovering position as a fraction within the current item
                var previousItemsHeight = cumulativeHeight - itemsHeightArray.current[i];
                hoveringPosition = linearIndex + (clientYRelativeToTreeTop - previousItemsHeight) / itemsHeightArray.current[i];
                break;
            }
        }
        var treeLinearItems = env.linearItems[treeId];
        // const linearIndexx = Math.min(
        //   Math.max(0, Math.floor(hoveringPosition)),
        //   treeLinearItems.length - 1
        // );
        if (treeLinearItems.length === 0) {
            return {
                linearIndex: 0,
                offset: 'bottom',
                indentation: 0,
            };
        }
        var targetLinearItem = treeLinearItems[linearIndex];
        var targetItem = env.items[targetLinearItem.item];
        var indentation = !env.renderDepthOffset
            ? undefined
            : Math.max(Math.floor((e.clientX - treeBb.left) / env.renderDepthOffset), 0);
        var offset;
        var lineThreshold = !env.canReorderItems
            ? 0
            : ((targetItem === null || targetItem === void 0 ? void 0 : targetItem.isFolder) && env.canDropOnFolder) ||
                env.canDropOnNonFolder
                ? 0.2
                : 0.5;
        if (hoveringPosition - 0.5 >= treeLinearItems.length - 1) {
            // very bottom, always use offset "bottom"
            offset = 'bottom';
        }
        else if (hoveringPosition % 1 < lineThreshold) {
            offset = 'top';
        }
        else if (hoveringPosition % 1 > 1 - lineThreshold) {
            offset = 'bottom';
        }
        return { linearIndex: linearIndex, offset: offset, indentation: indentation };
    });
    // returning undefined means calling onDragAtPosition(undefined), returning a dropposition means calling onPerformDrag(dropposition)
    // TODO old function sometimes returned undefined when old state could be kept; is it okay to also return undefined to enter invalid drop state here? e.g. !this.draggingItems, !canDragAndDrop...
    var getDraggingPosition = (0, useStableHandler_1.useStableHandler)(function (e, treeId, containerRef) {
        var hoveringPosition = getHoveringPosition(e, treeId, containerRef);
        if (!isNewDragPosition(e, treeId, hoveringPosition)) {
            return undefined;
        }
        if (!draggingItems ||
            !env.canDragAndDrop ||
            !hoveringPosition ||
            e.clientX < 0 ||
            e.clientY < 0) {
            return 'invalid';
        }
        return new DraggingPositionEvaluation_1.DraggingPositionEvaluation(env, e, treeId, hoveringPosition, draggingItems, getParentOfLinearItem).getDraggingPosition();
    });
    var initiateDraggingPosition = (0, useStableHandler_1.useStableHandler)(function (treeId, items) {
        setDraggingItems(items);
        dragCode.current = 'initial';
        itemHeight.current = (0, layoutUtils_1.computeItemHeight)(treeId);
        itemsHeightArray.current = (0, layoutUtils_1.computeItemHeightArray)(treeId);
    });
    var resetDraggingPosition = (0, useStableHandler_1.useStableHandler)(function () {
        setDraggingItems(undefined);
        dragCode.current = 'initial';
        itemHeight.current = 0;
        itemsHeightArray.current = [0];
    });
    return {
        initiateDraggingPosition: initiateDraggingPosition,
        resetDraggingPosition: resetDraggingPosition,
        draggingItems: draggingItems,
        getDraggingPosition: getDraggingPosition,
        itemHeight: itemHeight,
        itemsHeightArray: itemsHeightArray,
    };
};
exports.useDraggingPosition = useDraggingPosition;
