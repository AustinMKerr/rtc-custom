import { DraggingPosition, HoveringPosition, TreeEnvironmentContextProps, TreeItem } from '../types';
import { useGetGetParentOfLinearItem } from './useGetParentOfLinearItem';
export declare class DraggingPositionEvaluation {
    private readonly env;
    readonly getParentOfLinearItem: ReturnType<typeof useGetGetParentOfLinearItem>;
    private readonly e;
    private readonly treeId;
    private linearIndex;
    private offset;
    private indentation;
    private targetItem;
    private draggingItems;
    constructor(env: TreeEnvironmentContextProps, e: DragEvent, treeId: string, hoveringPosition: HoveringPosition, draggingItems: TreeItem[] | undefined, getParentOfLinearItem: ReturnType<typeof useGetGetParentOfLinearItem>);
    private getEmptyTreeDragPosition;
    /**
     * If reordering is not allowed, dragging on non-folder items redirects
     * the drag target to the parent of the target item.
     */
    private maybeRedirectToParent;
    /**
     * If the item is the last in a group, and the drop is at the bottom,
     * the x-coordinate of the mouse allows to reparent upwards.
     */
    private maybeReparentUpwards;
    /**
     * Don't allow to drop at bottom of an open folder, since that will place
     * it visually at a different position. Redirect the drag target to the
     * top of the folder contents in that case.
     */
    private maybeRedirectInsideOpenFolder;
    /**
     * Inside a folder, only drop at bottom offset to make it visually
     * consistent. This also maps to bottom offset for items below open
     * subtrees, to keep the x-coordinate based dropping consistent (only
     * if indentation is defined).
     */
    private maybeMapToBottomOffset;
    private canDropAtCurrentTarget;
    getDraggingPosition(): DraggingPosition | undefined;
    private isDescendant;
    private areDraggingItemsDescendantOfTarget;
}
