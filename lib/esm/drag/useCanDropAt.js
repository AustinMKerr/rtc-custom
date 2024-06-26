import { useCallback } from 'react';
import { useTreeEnvironment } from '../controlledEnvironment/ControlledTreeEnvironment';
export var useCanDropAt = function () {
    var environment = useTreeEnvironment();
    return useCallback(function (draggingPosition, draggingItems) {
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
