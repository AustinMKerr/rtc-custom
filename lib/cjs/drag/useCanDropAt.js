"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCanDropAt = void 0;
var react_1 = require("react");
var ControlledTreeEnvironment_1 = require("../controlledEnvironment/ControlledTreeEnvironment");
var useCanDropAt = function () {
    var environment = (0, ControlledTreeEnvironment_1.useTreeEnvironment)();
    return (0, react_1.useCallback)(function (draggingPosition, draggingItems) {
        if (draggingPosition.targetType === 'between-items') {
            if (!environment.canReorderItems) {
                return false;
            }
        }
        else if (draggingPosition.targetType === 'root') {
            if (!environment.canDropOnFolder) {
                return false;
            }
        }
        else {
            var resolvedItem = environment.items[draggingPosition.targetItem];
            if (!resolvedItem ||
                (!environment.canDropOnFolder && resolvedItem.isFolder) ||
                (!environment.canDropOnNonFolder && !resolvedItem.isFolder)) {
                return false;
            }
        }
        if (environment.canDropAt &&
            (!draggingItems ||
                !environment.canDropAt(draggingItems, draggingPosition))) {
            // setDraggingPosition(undefined);
            return false;
        }
        return true;
    }, [environment]);
};
exports.useCanDropAt = useCanDropAt;
