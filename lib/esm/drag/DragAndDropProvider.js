import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTreeEnvironment } from '../controlledEnvironment/ControlledTreeEnvironment';
import { useCanDropAt } from './useCanDropAt';
import { useGetViableDragPositions } from './useGetViableDragPositions';
import { useSideEffect } from '../useSideEffect';
import { buildMapForTrees } from '../utils';
import { useCallSoon } from '../useCallSoon';
import { useStableHandler } from '../useStableHandler';
import { useGetOriginalItemOrder } from '../useGetOriginalItemOrder';
import { useDraggingPosition } from './useDraggingPosition';
var DragAndDropContext = React.createContext(null);
export var useDragAndDrop = function () { return React.useContext(DragAndDropContext); };
export var DragAndDropProvider = function (_a) {
    var children = _a.children;
    var environment = useTreeEnvironment();
    var _b = useState(false), isProgrammaticallyDragging = _b[0], setIsProgrammaticallyDragging = _b[1];
    var _c = useState({}), viableDragPositions = _c[0], setViableDragPositions = _c[1];
    var _d = useState(0), programmaticDragIndex = _d[0], setProgrammaticDragIndex = _d[1];
    var _e = useState(), draggingPosition = _e[0], setDraggingPosition = _e[1];
    var getViableDragPositions = useGetViableDragPositions();
    var callSoon = useCallSoon();
    var getOriginalItemOrder = useGetOriginalItemOrder();
    var _f = useDraggingPosition(), initiateDraggingPosition = _f.initiateDraggingPosition, resetDraggingPosition = _f.resetDraggingPosition, draggingItems = _f.draggingItems, getDraggingPosition = _f.getDraggingPosition, itemHeight = _f.itemHeight, itemsHeightArray = _f.itemsHeightArray;
    var resetProgrammaticDragIndexForCurrentTree = useCallback(function (viableDragPositions, draggingItems) {
        var _a;
        if (environment.activeTreeId &&
            ((_a = environment.viewState[environment.activeTreeId]) === null || _a === void 0 ? void 0 : _a.focusedItem) &&
            environment.linearItems &&
            draggingItems) {
            var focusItem_1 = environment.viewState[environment.activeTreeId].focusedItem;
            var treeDragPositions = getViableDragPositions(environment.activeTreeId, draggingItems);
            var newPos = treeDragPositions.findIndex(function (pos) {
                if (pos.targetType === 'item') {
                    return pos.targetItem === focusItem_1;
                }
                if (pos.targetType === 'between-items') {
                    return (environment.items[pos.parentItem].children[pos.childIndex] ===
                        focusItem_1);
                }
                return false;
            });
            if (newPos) {
                setProgrammaticDragIndex(Math.min(newPos + 1, treeDragPositions.length - 1));
            }
            else {
                setProgrammaticDragIndex(0);
            }
        }
        else {
            setProgrammaticDragIndex(0);
        }
    }, [
        environment.activeTreeId,
        environment.items,
        environment.linearItems,
        environment.viewState,
        getViableDragPositions,
    ]);
    var resetState = useStableHandler(function () {
        setIsProgrammaticallyDragging(false);
        setViableDragPositions({});
        setProgrammaticDragIndex(0);
        setDraggingPosition(undefined);
        resetDraggingPosition();
    });
    useSideEffect(function () {
        if (environment.activeTreeId &&
            environment.linearItems[environment.activeTreeId] &&
            viableDragPositions[environment.activeTreeId]) {
            resetProgrammaticDragIndexForCurrentTree(viableDragPositions[environment.activeTreeId], draggingItems);
        }
    }, [
        draggingItems,
        environment.activeTreeId,
        environment.linearItems,
        resetProgrammaticDragIndexForCurrentTree,
        viableDragPositions,
    ], [environment.activeTreeId]);
    useSideEffect(function () {
        if (isProgrammaticallyDragging && environment.activeTreeId) {
            setDraggingPosition(viableDragPositions[environment.activeTreeId][programmaticDragIndex]);
        }
    }, [
        programmaticDragIndex,
        environment.activeTreeId,
        isProgrammaticallyDragging,
        viableDragPositions,
    ], [programmaticDragIndex, environment.activeTreeId]);
    var canDropAt = useCanDropAt();
    var performDrag = function (draggingPosition) {
        var _a;
        if (draggingItems && !canDropAt(draggingPosition, draggingItems)) {
            return;
        }
        setDraggingPosition(draggingPosition);
        environment.setActiveTree(draggingPosition.treeId);
        if (draggingItems && environment.activeTreeId !== draggingPosition.treeId) {
            // TODO maybe do only if draggingItems are different to selectedItems
            (_a = environment.onSelectItems) === null || _a === void 0 ? void 0 : _a.call(environment, draggingItems.map(function (item) { return item.index; }), draggingPosition.treeId);
        }
    };
    var onDragOverTreeHandler = useStableHandler(function (e, treeId, containerRef) {
        if (!draggingItems)
            return;
        var newDraggingPosition = getDraggingPosition(e, treeId, containerRef);
        if (!newDraggingPosition)
            return;
        if (newDraggingPosition === 'invalid') {
            setDraggingPosition(undefined);
            return;
        }
        performDrag(newDraggingPosition);
    });
    var onDropHandler = useStableHandler(function () {
        if (!draggingItems || !draggingPosition || !environment.onDrop) {
            return;
        }
        environment.onDrop(draggingItems, draggingPosition);
        callSoon(function () {
            var _a;
            (_a = environment.onFocusItem) === null || _a === void 0 ? void 0 : _a.call(environment, draggingItems[0], draggingPosition.treeId);
            resetState();
        });
    });
    var onStartDraggingItems = useCallback(function (items, treeId) {
        var treeViableDragPositions = buildMapForTrees(environment.treeIds, function (treeId) { return getViableDragPositions(treeId, items); });
        initiateDraggingPosition(treeId, items);
        // TODO what if trees have different heights and drag target changes?
        setViableDragPositions(treeViableDragPositions);
        if (environment.activeTreeId) {
            resetProgrammaticDragIndexForCurrentTree(treeViableDragPositions[environment.activeTreeId], items);
        }
    }, [
        environment.activeTreeId,
        environment.treeIds,
        getViableDragPositions,
        initiateDraggingPosition,
        resetProgrammaticDragIndexForCurrentTree,
    ]);
    var startProgrammaticDrag = useCallback(function () {
        var _a, _b, _c;
        if (!environment.canDragAndDrop) {
            return;
        }
        if (environment.activeTreeId) {
            var draggingItems_1 = (_b = (_a = environment.viewState[environment.activeTreeId]) === null || _a === void 0 ? void 0 : _a.selectedItems) !== null && _b !== void 0 ? _b : [
                (_c = environment.viewState[environment.activeTreeId]) === null || _c === void 0 ? void 0 : _c.focusedItem,
            ];
            if (draggingItems_1.length === 0 || draggingItems_1[0] === undefined) {
                return;
            }
            var resolvedDraggingItems = getOriginalItemOrder(environment.activeTreeId, draggingItems_1.map(function (id) { return environment.items[id]; }));
            if (environment.canDrag && !environment.canDrag(resolvedDraggingItems)) {
                return;
            }
            onStartDraggingItems(resolvedDraggingItems, environment.activeTreeId);
            setTimeout(function () {
                setIsProgrammaticallyDragging(true);
                // Needs to be done after onStartDraggingItems was called, so that viableDragPositions is populated
            });
        }
    }, [environment, getOriginalItemOrder, onStartDraggingItems]);
    var abortProgrammaticDrag = useCallback(function () {
        resetState();
    }, [resetState]);
    var completeProgrammaticDrag = useCallback(function () {
        onDropHandler();
        resetState();
    }, [onDropHandler, resetState]);
    var programmaticDragUp = useCallback(function () {
        setProgrammaticDragIndex(function (oldIndex) { return Math.max(0, oldIndex - 1); });
    }, []);
    var programmaticDragDown = useCallback(function () {
        if (environment.activeTreeId) {
            setProgrammaticDragIndex(function (oldIndex) {
                return Math.min(viableDragPositions[environment.activeTreeId].length, oldIndex + 1);
            });
        }
    }, [environment.activeTreeId, viableDragPositions]);
    var dnd = useMemo(function () { return ({
        onStartDraggingItems: onStartDraggingItems,
        startProgrammaticDrag: startProgrammaticDrag,
        abortProgrammaticDrag: abortProgrammaticDrag,
        completeProgrammaticDrag: completeProgrammaticDrag,
        programmaticDragUp: programmaticDragUp,
        programmaticDragDown: programmaticDragDown,
        draggingItems: draggingItems,
        draggingPosition: draggingPosition,
        itemHeight: itemHeight.current,
        itemsHeightArray: itemsHeightArray.current,
        isProgrammaticallyDragging: isProgrammaticallyDragging,
        onDragOverTreeHandler: onDragOverTreeHandler,
        viableDragPositions: viableDragPositions,
    }); }, [
        abortProgrammaticDrag,
        completeProgrammaticDrag,
        draggingItems,
        draggingPosition,
        isProgrammaticallyDragging,
        itemHeight,
        itemsHeightArray,
        onDragOverTreeHandler,
        onStartDraggingItems,
        programmaticDragDown,
        programmaticDragUp,
        startProgrammaticDrag,
        viableDragPositions,
    ]);
    useEffect(function () {
        window.addEventListener('dragend', resetState);
        window.addEventListener('drop', onDropHandler);
        return function () {
            window.removeEventListener('dragend', resetState);
            window.removeEventListener('drop', onDropHandler);
        };
    }, [onDropHandler, resetState]);
    return (React.createElement(DragAndDropContext.Provider, { value: dnd }, children));
};
