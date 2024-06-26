"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DraggingPositionEvaluation = void 0;
var DraggingPositionEvaluation = /** @class */ (function () {
    function DraggingPositionEvaluation(env, e, treeId, hoveringPosition, draggingItems, getParentOfLinearItem) {
        this.env = env;
        this.e = e;
        this.treeId = treeId;
        this.linearIndex = hoveringPosition.linearIndex;
        this.offset = hoveringPosition.offset;
        this.indentation = hoveringPosition.indentation;
        this.targetItem = this.env.linearItems[this.treeId][this.linearIndex];
        this.getParentOfLinearItem = getParentOfLinearItem;
        this.draggingItems = draggingItems;
    }
    DraggingPositionEvaluation.prototype.getEmptyTreeDragPosition = function () {
        return {
            targetType: 'root',
            treeId: this.treeId,
            depth: 0,
            linearIndex: 0,
            targetItem: this.env.trees[this.treeId].rootItem,
        };
    };
    /**
     * If reordering is not allowed, dragging on non-folder items redirects
     * the drag target to the parent of the target item.
     */
    DraggingPositionEvaluation.prototype.maybeRedirectToParent = function () {
        var redirectTargetToParent = !this.env.canReorderItems &&
            !this.env.canDropOnNonFolder &&
            !this.env.items[this.targetItem.item].isFolder;
        if (redirectTargetToParent) {
            var _a = this.getParentOfLinearItem(this.linearIndex, this.treeId), parentLinearIndex = _a.parentLinearIndex, parent_1 = _a.parent;
            this.targetItem = parent_1;
            this.linearIndex = parentLinearIndex;
        }
    };
    /**
     * If the item is the last in a group, and the drop is at the bottom,
     * the x-coordinate of the mouse allows to reparent upwards.
     */
    DraggingPositionEvaluation.prototype.maybeReparentUpwards = function () {
        var _a, _b;
        if (this.indentation === undefined) {
            return undefined;
        }
        var treeLinearItems = this.env.linearItems[this.treeId];
        var deepestDepth = treeLinearItems[this.linearIndex].depth;
        // Default to zero on last position to allow dropping on root when
        // dropping at bottom
        var legalDropDepthCount = // itemDepthDifferenceToNextItem/isLastInGroup
         deepestDepth - ((_b = (_a = treeLinearItems[this.linearIndex + 1]) === null || _a === void 0 ? void 0 : _a.depth) !== null && _b !== void 0 ? _b : 0);
        var canReparentUpwards = this.offset === 'bottom' && legalDropDepthCount > 0;
        if (!canReparentUpwards) {
            return undefined;
        }
        var droppingIndent = Math.max(deepestDepth - legalDropDepthCount, this.indentation);
        var newParent = {
            parentLinearIndex: this.linearIndex,
            parent: this.targetItem,
        };
        var insertionItemAbove;
        for (var i = deepestDepth; i >= droppingIndent; i -= 1) {
            insertionItemAbove = newParent;
            newParent = this.getParentOfLinearItem(newParent.parentLinearIndex, this.treeId);
        }
        if (this.indentation === treeLinearItems[this.linearIndex].depth) {
            return undefined;
        }
        if (!insertionItemAbove) {
            return undefined;
        }
        var reparentedChildIndex = this.env.items[newParent.parent.item].children.indexOf(insertionItemAbove.parent.item) + 1;
        if (this.draggingItems &&
            this.isDescendant(this.treeId, newParent.parentLinearIndex + 1, this.draggingItems)) {
            return undefined;
        }
        return {
            targetType: 'between-items',
            treeId: this.treeId,
            parentItem: newParent.parent.item,
            depth: droppingIndent,
            linearIndex: this.linearIndex + 1,
            childIndex: reparentedChildIndex,
            linePosition: 'bottom',
        };
    };
    /**
     * Don't allow to drop at bottom of an open folder, since that will place
     * it visually at a different position. Redirect the drag target to the
     * top of the folder contents in that case.
     */
    DraggingPositionEvaluation.prototype.maybeRedirectInsideOpenFolder = function () {
        var nextItem = this.env.linearItems[this.treeId][this.linearIndex + 1];
        var redirectInsideOpenFolder = !this.env.canDropBelowOpenFolders &&
            nextItem &&
            this.targetItem.depth === nextItem.depth - 1 &&
            this.offset === 'bottom';
        if (redirectInsideOpenFolder) {
            this.targetItem = nextItem;
            this.linearIndex += 1;
            this.offset = 'top';
        }
    };
    /**
     * Inside a folder, only drop at bottom offset to make it visually
     * consistent. This also maps to bottom offset for items below open
     * subtrees, to keep the x-coordinate based dropping consistent (only
     * if indentation is defined).
     */
    DraggingPositionEvaluation.prototype.maybeMapToBottomOffset = function () {
        var priorItem = this.env.linearItems[this.treeId][this.linearIndex - 1];
        if (!priorItem || (priorItem === null || priorItem === void 0 ? void 0 : priorItem.depth) === undefined)
            return;
        var depthDistanceToPrior = priorItem.depth - this.targetItem.depth;
        if (this.offset === 'top' &&
            (depthDistanceToPrior === 0 ||
                (depthDistanceToPrior > 0 && this.indentation !== undefined))) {
            this.offset = 'bottom';
            this.linearIndex -= 1;
            this.targetItem = this.env.linearItems[this.treeId][this.linearIndex];
        }
    };
    DraggingPositionEvaluation.prototype.canDropAtCurrentTarget = function () {
        var _this = this;
        var _a;
        var targetItemData = this.env.items[this.targetItem.item];
        if (!this.offset &&
            !this.env.canDropOnNonFolder &&
            !targetItemData.isFolder) {
            return false;
        }
        if (!this.offset && !this.env.canDropOnFolder && targetItemData.isFolder) {
            return false;
        }
        if (this.offset && !this.env.canReorderItems) {
            return false;
        }
        if ((_a = this.draggingItems) === null || _a === void 0 ? void 0 : _a.some(function (draggingItem) { return draggingItem.index === _this.targetItem.item; })) {
            return false;
        }
        return true;
    };
    DraggingPositionEvaluation.prototype.getDraggingPosition = function () {
        if (this.env.linearItems[this.treeId].length === 0) {
            return this.getEmptyTreeDragPosition();
        }
        if (!this.draggingItems ||
            this.linearIndex < 0 ||
            this.linearIndex >= this.env.linearItems[this.treeId].length) {
            return undefined;
        }
        this.maybeRedirectToParent();
        this.maybeRedirectInsideOpenFolder();
        this.maybeMapToBottomOffset();
        var reparented = this.maybeReparentUpwards();
        if (reparented) {
            return reparented;
        }
        if (this.areDraggingItemsDescendantOfTarget()) {
            return undefined;
        }
        if (!this.canDropAtCurrentTarget()) {
            return undefined;
        }
        var parent = this.getParentOfLinearItem(this.linearIndex, this.treeId).parent;
        var newChildIndex = this.env.items[parent.item].children.indexOf(this.targetItem.item) +
            (this.offset === 'top' ? 0 : 1);
        if (this.offset) {
            return {
                targetType: 'between-items',
                treeId: this.treeId,
                parentItem: parent.item,
                depth: this.targetItem.depth,
                linearIndex: this.linearIndex + (this.offset === 'top' ? 0 : 1),
                childIndex: newChildIndex,
                linePosition: this.offset,
            };
        }
        return {
            targetType: 'item',
            treeId: this.treeId,
            parentItem: parent.item,
            targetItem: this.targetItem.item,
            depth: this.targetItem.depth,
            linearIndex: this.linearIndex,
        };
    };
    DraggingPositionEvaluation.prototype.isDescendant = function (treeId, itemLinearIndex, potentialParents) {
        // console.log('descendant check', itemLinearIndex, potentialParents);
        var _a = this.getParentOfLinearItem(itemLinearIndex, treeId), parentLinearIndex = _a.parentLinearIndex, parent = _a.parent;
        if (potentialParents.find(function (p) { return p.index === parent.item; })) {
            return true;
        }
        if (parent.depth === 0) {
            return false;
        }
        return this.isDescendant(treeId, parentLinearIndex, potentialParents);
    };
    DraggingPositionEvaluation.prototype.areDraggingItemsDescendantOfTarget = function () {
        return (this.draggingItems &&
            this.isDescendant(this.treeId, this.linearIndex, this.draggingItems));
    };
    return DraggingPositionEvaluation;
}());
exports.DraggingPositionEvaluation = DraggingPositionEvaluation;
