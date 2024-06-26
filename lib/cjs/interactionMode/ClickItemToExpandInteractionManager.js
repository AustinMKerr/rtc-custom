"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickItemToExpandInteractionManager = void 0;
var types_1 = require("../types");
var isControlKey_1 = require("../isControlKey");
var ClickItemToExpandInteractionManager = /** @class */ (function () {
    function ClickItemToExpandInteractionManager(environment) {
        this.mode = types_1.InteractionMode.ClickItemToExpand;
        this.environment = environment;
    }
    ClickItemToExpandInteractionManager.prototype.createInteractiveElementProps = function (item, treeId, actions, renderFlags) {
        var _this = this;
        return {
            onClick: function (e) {
                actions.focusItem();
                if (e.shiftKey) {
                    actions.selectUpTo(!(0, isControlKey_1.isControlKey)(e));
                }
                else if ((0, isControlKey_1.isControlKey)(e)) {
                    if (renderFlags.isSelected) {
                        actions.unselectItem();
                    }
                    else {
                        actions.addToSelectedItems();
                    }
                }
                else {
                    if (item.isFolder) {
                        actions.toggleExpandedState();
                    }
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
    return ClickItemToExpandInteractionManager;
}());
exports.ClickItemToExpandInteractionManager = ClickItemToExpandInteractionManager;
