import { useRef, useState } from 'react';
import { computeItemHeight, isOutsideOfContainer, computeItemHeightArray, } from '../controlledEnvironment/layoutUtils';
import { useTreeEnvironment } from '../controlledEnvironment/ControlledTreeEnvironment';
import { useStableHandler } from '../useStableHandler';
import { DraggingPositionEvaluation } from './DraggingPositionEvaluation';
import { useGetGetParentOfLinearItem } from './useGetParentOfLinearItem';
export var useDraggingPosition = function () {
    var dragCode = useRef('initial');
    var _a = useState(undefined), draggingItems = _a[0], setDraggingItems = _a[1];
    var itemHeight = useRef(0);
    var itemsHeightArray = useRef([0]);
    var env = useTreeEnvironment();
    var getParentOfLinearItem = useGetGetParentOfLinearItem();
    var isNewDragPosition = useStableHandler(function (e, treeId, hoveringPosition) {
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
    var getHoveringPosition = useStableHandler(function (e, treeId, containerRef) {
        if (!containerRef.current) {
            return undefined;
        }
        itemsHeightArray.current = computeItemHeightArray(treeId);
        var treeBb = containerRef.current.getBoundingClientRect();
        if (isOutsideOfContainer(e, treeBb)) {
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
    var getDraggingPosition = useStableHandler(function (e, treeId, containerRef) {
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
        return new DraggingPositionEvaluation(env, e, treeId, hoveringPosition, draggingItems, getParentOfLinearItem).getDraggingPosition();
    });
    var initiateDraggingPosition = useStableHandler(function (treeId, items) {
        setDraggingItems(items);
        dragCode.current = 'initial';
        itemHeight.current = computeItemHeight(treeId);
        itemsHeightArray.current = computeItemHeightArray(treeId);
    });
    var resetDraggingPosition = useStableHandler(function () {
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
