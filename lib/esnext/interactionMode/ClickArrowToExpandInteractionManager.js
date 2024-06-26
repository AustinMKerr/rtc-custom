import { InteractionMode, } from '../types';
import { isControlKey } from '../isControlKey';
var ClickArrowToExpandInteractionManager = /** @class */ (function () {
    function ClickArrowToExpandInteractionManager(environment) {
        this.mode = InteractionMode.ClickItemToExpand;
        this.environment = environment;
    }
    ClickArrowToExpandInteractionManager.prototype.createInteractiveElementProps = function (item, treeId, actions, renderFlags) {
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
                    if (!item.isFolder ||
                        _this.environment.canInvokePrimaryActionOnItemContainer) {
                        actions.primaryAction();
                    }
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
    return ClickArrowToExpandInteractionManager;
}());
export { ClickArrowToExpandInteractionManager };
