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
        var _a, _b, _c;
        if (!containerRef.current) {
            return undefined;
        }
        var treeBb = containerRef.current.getBoundingClientRect();
        if (isOutsideOfContainer(e, treeBb)) {
            return undefined;
        }
        var treeLinearItems = env.linearItems[treeId];
        if (treeLinearItems.length === 0) {
            return {
                linearIndex: 0,
                offset: 'bottom',
                indentation: 0,
            };
        }
        // Item heights are measured once when the drag starts
        // (initiateDraggingPosition). Re-measuring here on every dragover would
        // run a querySelectorAll over every row and read offsetHeight on each,
        // forcing a synchronous layout reflow many times a second during a drag.
        // The visible rows don't change mid-drag (there is no drag-to-expand), so
        // we only re-measure if the row count no longer matches the cache — a
        // cheap self-heal for the rare case where the tree mutates mid-drag.
        if (((_b = (_a = itemsHeightArray.current) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) !== treeLinearItems.length) {
            itemsHeightArray.current = computeItemHeightArray(treeId);
        }
        // Walk the measured per-item heights (items can have different sizes)
        // accumulating their heights until we pass the cursor's y position.
        // This must stay in lockstep with treeLinearItems, so we never index
        // past the last linear item even if the measured array is longer.
        // Fall back to an empty array if measurement is unavailable; each row
        // then degrades to the single measured `itemHeight` (see the loop below)
        // so hit-testing keeps working even before layout has settled.
        var heights = (_c = itemsHeightArray.current) !== null && _c !== void 0 ? _c : [];
        var lastIndex = treeLinearItems.length - 1;
        var clientYRelativeToTreeTop = e.clientY - treeBb.top;
        var cumulativeHeight = 0;
        // Default to the very bottom: if the cursor is below every item (e.g. in
        // the empty space under the last row) we want to track the last item's
        // bottom edge, not snap back to the first item.
        var linearIndex = lastIndex;
        var hoveringPosition = treeLinearItems.length;
        for (var i = 0; i <= lastIndex; i++) {
            // Prefer the per-item measured height; if a row wasn't measured (or
            // measured as zero) fall back to the single representative itemHeight
            // so variable-height trees still resolve a sensible drop target.
            var itemHeightAtIndex = heights[i] || itemHeight.current || 0;
            cumulativeHeight += itemHeightAtIndex;
            if (clientYRelativeToTreeTop <= cumulativeHeight) {
                linearIndex = i;
                // Calculate hovering position as a fraction within the current item.
                // Guard against zero-height rows to avoid a NaN position.
                var previousItemsHeight = cumulativeHeight - itemHeightAtIndex;
                var fraction = itemHeightAtIndex > 0
                    ? (clientYRelativeToTreeTop - previousItemsHeight) /
                        itemHeightAtIndex
                    : 0;
                hoveringPosition = linearIndex + fraction;
                break;
            }
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
