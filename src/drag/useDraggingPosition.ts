import { useRef, useState } from 'react';
import * as React from 'react';
import { DraggingPosition, HoveringPosition, TreeItem } from '../types';
import {
  computeItemHeight,
  isOutsideOfContainer,
  computeItemHeightArray,
} from '../controlledEnvironment/layoutUtils';
import { useTreeEnvironment } from '../controlledEnvironment/ControlledTreeEnvironment';
import { useStableHandler } from '../useStableHandler';
import { DraggingPositionEvaluation } from './DraggingPositionEvaluation';
import { useGetGetParentOfLinearItem } from './useGetParentOfLinearItem';

export const useDraggingPosition = () => {
  const dragCode = useRef('initial');
  const [draggingItems, setDraggingItems] = useState<TreeItem[] | undefined>(
    undefined
  );
  const itemHeight = useRef(0);
  const itemsHeightArray = useRef([0]);
  const env = useTreeEnvironment();
  const getParentOfLinearItem = useGetGetParentOfLinearItem();

  const isNewDragPosition = useStableHandler(
    (
      e: DragEvent,
      treeId: string,
      hoveringPosition: HoveringPosition | undefined
    ) => {
      if (!hoveringPosition) {
        return false;
      }
      const { offset, linearIndex } = hoveringPosition;

      const newDragCode = `${treeId}__${linearIndex}__${offset ?? ''}__${
        hoveringPosition.indentation
      }`;
      if (newDragCode !== dragCode.current) {
        dragCode.current = newDragCode;
        return true;
      }

      return false;
    }
  );

  /**
   * Returns undefined for invalid drop targets, like outside the tree.
   */
  const getHoveringPosition = useStableHandler(
    (
      e: DragEvent,
      treeId: string,
      containerRef: React.MutableRefObject<HTMLElement | undefined>
    ): HoveringPosition | undefined => {
      if (!containerRef.current) {
        return undefined;
      }

      const treeBb = containerRef.current.getBoundingClientRect();

      if (isOutsideOfContainer(e, treeBb)) {
        return undefined;
      }

      const treeLinearItems = env.linearItems[treeId];

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
      if (itemsHeightArray.current.length !== treeLinearItems.length) {
        itemsHeightArray.current = computeItemHeightArray(treeId);
      }

      // Walk the measured per-item heights (items can have different sizes)
      // accumulating their heights until we pass the cursor's y position.
      // This must stay in lockstep with treeLinearItems, so we never index
      // past the last linear item even if the measured array is longer.
      const heights = itemsHeightArray.current;
      const lastIndex = treeLinearItems.length - 1;
      const clientYRelativeToTreeTop = e.clientY - treeBb.top;
      let cumulativeHeight = 0;
      // Default to the very bottom: if the cursor is below every item (e.g. in
      // the empty space under the last row) we want to track the last item's
      // bottom edge, not snap back to the first item.
      let linearIndex = lastIndex;
      let hoveringPosition = treeLinearItems.length;

      for (let i = 0; i <= lastIndex; i++) {
        const itemHeightAtIndex = heights[i] || 0;
        cumulativeHeight += itemHeightAtIndex;
        if (clientYRelativeToTreeTop <= cumulativeHeight) {
          linearIndex = i;
          // Calculate hovering position as a fraction within the current item.
          // Guard against zero-height rows to avoid a NaN position.
          const previousItemsHeight = cumulativeHeight - itemHeightAtIndex;
          const fraction =
            itemHeightAtIndex > 0
              ? (clientYRelativeToTreeTop - previousItemsHeight) /
                itemHeightAtIndex
              : 0;
          hoveringPosition = linearIndex + fraction;
          break;
        }
      }

      const targetLinearItem = treeLinearItems[linearIndex];
      const targetItem = env.items[targetLinearItem.item];

      const indentation = !env.renderDepthOffset
        ? undefined
        : Math.max(
            Math.floor((e.clientX - treeBb.left) / env.renderDepthOffset),
            0
          );

      let offset: 'top' | 'bottom' | undefined;

      const lineThreshold = !env.canReorderItems
        ? 0
        : (targetItem?.isFolder && env.canDropOnFolder) ||
          env.canDropOnNonFolder
        ? 0.2
        : 0.5;

      if (hoveringPosition - 0.5 >= treeLinearItems.length - 1) {
        // very bottom, always use offset "bottom"
        offset = 'bottom';
      } else if (hoveringPosition % 1 < lineThreshold) {
        offset = 'top';
      } else if (hoveringPosition % 1 > 1 - lineThreshold) {
        offset = 'bottom';
      }

      return { linearIndex, offset, indentation };
    }
  );

  // returning undefined means calling onDragAtPosition(undefined), returning a dropposition means calling onPerformDrag(dropposition)
  // TODO old function sometimes returned undefined when old state could be kept; is it okay to also return undefined to enter invalid drop state here? e.g. !this.draggingItems, !canDragAndDrop...
  const getDraggingPosition = useStableHandler(
    (
      e: DragEvent,
      treeId: string,
      containerRef: React.MutableRefObject<HTMLElement | undefined>
    ): DraggingPosition | 'invalid' | undefined => {
      const hoveringPosition = getHoveringPosition(e, treeId, containerRef);

      if (!isNewDragPosition(e, treeId, hoveringPosition)) {
        return undefined;
      }

      if (
        !draggingItems ||
        !env.canDragAndDrop ||
        !hoveringPosition ||
        e.clientX < 0 ||
        e.clientY < 0
      ) {
        return 'invalid';
      }

      return new DraggingPositionEvaluation(
        env,
        e,
        treeId,
        hoveringPosition,
        draggingItems,
        getParentOfLinearItem
      ).getDraggingPosition();
    }
  );

  const initiateDraggingPosition = useStableHandler(
    (treeId: string, items: TreeItem[]) => {
      setDraggingItems(items);
      dragCode.current = 'initial';
      itemHeight.current = computeItemHeight(treeId);
      itemsHeightArray.current = computeItemHeightArray(treeId);

    }
  );

  const resetDraggingPosition = useStableHandler(() => {
    setDraggingItems(undefined);
    dragCode.current = 'initial';
    itemHeight.current = 0;
    itemsHeightArray.current = [0];

  });

  return {
    initiateDraggingPosition,
    resetDraggingPosition,
    draggingItems,
    getDraggingPosition,
    itemHeight,
    itemsHeightArray,
  };
};
