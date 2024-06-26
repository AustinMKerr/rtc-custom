import { InteractionMode, } from '../types';
import { isControlKey } from '../isControlKey';
var DoubleClickItemToExpandInteractionManager = /** @class */ (function () {
    function DoubleClickItemToExpandInteractionManager(environment) {
        this.mode = InteractionMode.DoubleClickItemToExpand;
        this.environment = environment;
    }
    DoubleClickItemToExpandInteractionManager.prototype.createInteractiveElementProps = function (item, treeId, actions, renderFlags) {
        var _this = this;
        return {
            onClick: function (e) {
                actions.focusItem();
                if (e.shiftKey) {
                    actions.selectUpTo(!isControlKey(e));
                }
                else if (isControlKey(e)) {
                    if (renderFlags.isSelected) {
                        actions.unselectItem();
                    }
                    else {
                        actions.addToSelectedItems();
                    }
                }
                else {
                    actions.selectItem();
                }
            },
            onDoubleClick: function () {
                actions.focusItem();
                actions.selectItem();
                if (item.isFolder) {
                    actions.toggleExpandedState();
                }
                if (!item.isFolder ||
                    _this.environment.canInvokePrimaryActionOnItemContainer) {
                    actions.primaryAction();
                }
            },
            onFocus: function () {
                actions.focusItem();
            },
            onDragStart: function (e) {
                e.dataTransfer.dropEffect = 'move';
                actions.startDragging();
            },
            onDragOver: function (e) {
                e.preventDefault(); // Allow drop
            },
            draggable: renderFlags.canDrag && !renderFlags.isRenaming,
            tabIndex: !renderFlags.isRenaming
                ? renderFlags.isFocused
                    ? 0
                    : -1
                : undefined,
        };
    };
    return DoubleClickItemToExpandInteractionManager;
}());
export { DoubleClickItemToExpandInteractionManager };
