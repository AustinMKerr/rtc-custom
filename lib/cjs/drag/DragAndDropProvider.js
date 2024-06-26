"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DragAndDropProvider = exports.useDragAndDrop = void 0;
var React = __importStar(require("react"));
var react_1 = require("react");
var ControlledTreeEnvironment_1 = require("../controlledEnvironment/ControlledTreeEnvironment");
var useCanDropAt_1 = require("./useCanDropAt");
var useGetViableDragPositions_1 = require("./useGetViableDragPositions");
var useSideEffect_1 = require("../useSideEffect");
var utils_1 = require("../utils");
var useCallSoon_1 = require("../useCallSoon");
var useStableHandler_1 = require("../useStableHandler");
var useGetOriginalItemOrder_1 = require("../useGetOriginalItemOrder");
var useDraggingPosition_1 = require("./useDraggingPosition");
var DragAndDropContext = React.createContext(null);
var useDragAndDrop = function () { return React.useContext(DragAndDropContext); };
exports.useDragAndDrop = useDragAndDrop;
var DragAndDropProvider = function (_a) {
    var children = _a.children;
    var environment = (0, ControlledTreeEnvironment_1.useTreeEnvironment)();
    var _b = (0, react_1.useState)(false), isProgrammaticallyDragging = _b[0], setIsProgrammaticallyDragging = _b[1];
    var _c = (0, react_1.useState)({}), viableDragPositions = _c[0], setViableDragPositions = _c[1];
    var _d = (0, react_1.useState)(0), programmaticDragIndex = _d[0], setProgrammaticDragIndex = _d[1];
    var _e = (0, react_1.useState)(), draggingPosition = _e[0], setDraggingPosition = _e[1];
    var getViableDragPositions = (0, useGetViableDragPositions_1.useGetViableDragPositions)();
    var callSoon = (0, useCallSoon_1.useCallSoon)();
    var getOriginalItemOrder = (0, useGetOriginalItemOrder_1.useGetOriginalItemOrder)();
    var _f = (0, useDraggingPosition_1.useDraggingPosition)(), initiateDraggingPosition = _f.initiateDraggingPosition, resetDraggingPosition = _f.resetDraggingPosition, draggingItems = _f.draggingItems, getDraggingPosition = _f.getDraggingPosition, itemHeight = _f.itemHeight, itemsHeightArray = _f.itemsHeightArray;
    var resetProgrammaticDragIndexForCurrentTree = (0, react_1.useCallback)(function (viableDragPositions, draggingItems) {
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
    var resetState = (0, useStableHandler_1.useStableHandler)(function () {
        setIsProgrammaticallyDragging(false);
        setViableDragPositions({});
        setProgrammaticDragIndex(0);
        setDraggingPosition(undefined);
        resetDraggingPosition();
    });
    (0, useSideEffect_1.useSideEffect)(function () {
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
    (0, useSideEffect_1.useSideEffect)(function () {
        if (isProgrammaticallyDragging && environment.activeTreeId) {
            setDraggingPosition(viableDragPositions[environment.activeTreeId][programmaticDragIndex]);
        }
    }, [
        programmaticDragIndex,
        environment.activeTreeId,
        isProgrammaticallyDragging,
        viableDragPositions,
    ], [programmaticDragIndex, environment.activeTreeId]);
    var canDropAt = (0, useCanDropAt_1.useCanDropAt)();
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
    var onDragOverTreeHandler = (0, useStableHandler_1.useStableHandler)(function (e, treeId, containerRef) {
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
    var onDropHandler = (0, useStableHandler_1.useStableHandler)(function () {
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
    var onStartDraggingItems = (0, react_1.useCallback)(function (items, treeId) {
        var treeViableDragPositions = (0, utils_1.buildMapForTrees)(environment.treeIds, function (treeId) { return getViableDragPositions(treeId, items); });
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
    var startProgrammaticDrag = (0, react_1.useCallback)(function () {
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
    var abortProgrammaticDrag = (0, react_1.useCallback)(function () {
        resetState();
    }, [resetState]);
    var completeProgrammaticDrag = (0, react_1.useCallback)(function () {
        onDropHandler();
        resetState();
    }, [onDropHandler, resetState]);
    var programmaticDragUp = (0, react_1.useCallback)(function () {
        setProgrammaticDragIndex(function (oldIndex) { return Math.max(0, oldIndex - 1); });
    }, []);
    var programmaticDragDown = (0, react_1.useCallback)(function () {
        if (environment.activeTreeId) {
            setProgrammaticDragIndex(function (oldIndex) {
                return Math.min(viableDragPositions[environment.activeTreeId].length, oldIndex + 1);
            });
        }
    }, [environment.activeTreeId, viableDragPositions]);
    var dnd = (0, react_1.useMemo)(function () { return ({
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
    (0, react_1.useEffect)(function () {
        window.addEventListener('dragend', resetState);
        window.addEventListener('drop', onDropHandler);
        return function () {
            window.removeEventListener('dragend', resetState);
            window.removeEventListener('drop', onDropHandler);
        };
    }, [onDropHandler, resetState]);
    return (React.createElement(DragAndDropContext.Provider, { value: dnd }, children));
};
exports.DragAndDropProvider = DragAndDropProvider;
