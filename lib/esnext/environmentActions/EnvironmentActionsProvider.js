var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { useDragAndDrop } from '../drag/DragAndDropProvider';
import { useTreeEnvironment } from '../controlledEnvironment/ControlledTreeEnvironment';
import { useCreatedEnvironmentRef } from './useCreatedEnvironmentRef';
import { useRefCopy } from '../useRefCopy';
import { waitFor } from '../waitFor';
var EnvironmentActionsContext = React.createContext(null);
export var useEnvironmentActions = function () {
    return React.useContext(EnvironmentActionsContext);
};
var recursiveExpand = function (itemId, items, onExpand) { return __awaiter(void 0, void 0, void 0, function () {
    var _loop_1, _i, _a, childId;
    var _b, _c, _d;
    return __generator(this, function (_e) {
        _loop_1 = function (childId) {
            waitFor(function () { var _a; return !!((_a = items.current) === null || _a === void 0 ? void 0 : _a[childId]); }).then(function () {
                var _a;
                var item = (_a = items.current) === null || _a === void 0 ? void 0 : _a[childId];
                if (item === null || item === void 0 ? void 0 : item.isFolder) {
                    onExpand(item);
                    recursiveExpand(childId, items, onExpand);
                }
            });
        };
        for (_i = 0, _a = (_d = (_c = (_b = items.current) === null || _b === void 0 ? void 0 : _b[itemId]) === null || _c === void 0 ? void 0 : _c.children) !== null && _d !== void 0 ? _d : []; _i < _a.length; _i++) {
            childId = _a[_i];
            _loop_1(childId);
        }
        return [2 /*return*/];
    });
}); };
export var EnvironmentActionsProvider = React.forwardRef(function (props, ref) {
    var _a = useTreeEnvironment(), onCollapseItem = _a.onCollapseItem, items = _a.items, trees = _a.trees, viewState = _a.viewState, onExpandItem = _a.onExpandItem, onFocusItem = _a.onFocusItem, setActiveTree = _a.setActiveTree, onRenameItem = _a.onRenameItem, onSelectItems = _a.onSelectItems, onPrimaryAction = _a.onPrimaryAction, linearItems = _a.linearItems;
    var _b = useDragAndDrop(), abortProgrammaticDrag = _b.abortProgrammaticDrag, completeProgrammaticDrag = _b.completeProgrammaticDrag, programmaticDragDown = _b.programmaticDragDown, programmaticDragUp = _b.programmaticDragUp, startProgrammaticDrag = _b.startProgrammaticDrag;
    var itemsRef = useRefCopy(items);
    // TODO replace callbacks with stable handlers
    var collapseItem = useCallback(function (itemId, treeId) {
        onCollapseItem === null || onCollapseItem === void 0 ? void 0 : onCollapseItem(items[itemId], treeId);
    }, [items, onCollapseItem]);
    var expandItem = useCallback(function (itemId, treeId) {
        onExpandItem === null || onExpandItem === void 0 ? void 0 : onExpandItem(items[itemId], treeId);
    }, [items, onExpandItem]);
    var focusItem = useCallback(function (itemId, treeId, setDomFocus) {
        if (setDomFocus === void 0) { setDomFocus = true; }
        onFocusItem === null || onFocusItem === void 0 ? void 0 : onFocusItem(items[itemId], treeId, setDomFocus);
    }, [items, onFocusItem]);
    var focusTree = useCallback(function (treeId, autoFocus) {
        if (autoFocus === void 0) { autoFocus = true; }
        setActiveTree(treeId, autoFocus);
    }, [setActiveTree]);
    var moveFocusDown = useCallback(function (treeId) {
        var treeLinearItems = linearItems[treeId];
        var currentFocusIndex = treeLinearItems.findIndex(function (_a) {
            var _b;
            var item = _a.item;
            return item === ((_b = viewState[treeId]) === null || _b === void 0 ? void 0 : _b.focusedItem);
        });
        var newIndex = currentFocusIndex !== undefined
            ? Math.min(treeLinearItems.length - 1, currentFocusIndex + 1)
            : 0;
        var newItem = items[treeLinearItems[newIndex].item];
        onFocusItem === null || onFocusItem === void 0 ? void 0 : onFocusItem(newItem, treeId);
    }, [items, linearItems, onFocusItem, viewState]);
    var moveFocusUp = useCallback(function (treeId) {
        var treeLinearItems = linearItems[treeId];
        var currentFocusIndex = treeLinearItems.findIndex(function (_a) {
            var _b;
            var item = _a.item;
            return item === ((_b = viewState[treeId]) === null || _b === void 0 ? void 0 : _b.focusedItem);
        });
        var newIndex = currentFocusIndex !== undefined
            ? Math.max(0, currentFocusIndex - 1)
            : 0;
        var newItem = items[treeLinearItems[newIndex].item];
        onFocusItem === null || onFocusItem === void 0 ? void 0 : onFocusItem(newItem, treeId);
    }, [items, linearItems, onFocusItem, viewState]);
    var renameItem = useCallback(function (itemId, name, treeId) {
        onRenameItem === null || onRenameItem === void 0 ? void 0 : onRenameItem(items[itemId], name, treeId);
    }, [items, onRenameItem]);
    var selectItems = useCallback(function (itemsIds, treeId) {
        onSelectItems === null || onSelectItems === void 0 ? void 0 : onSelectItems(itemsIds, treeId);
    }, [onSelectItems]);
    var toggleItemExpandedState = useCallback(function (itemId, treeId) {
        var _a, _b;
        if ((_b = (_a = viewState[treeId]) === null || _a === void 0 ? void 0 : _a.expandedItems) === null || _b === void 0 ? void 0 : _b.includes(itemId)) {
            onCollapseItem === null || onCollapseItem === void 0 ? void 0 : onCollapseItem(items[itemId], treeId);
        }
        else {
            onExpandItem === null || onExpandItem === void 0 ? void 0 : onExpandItem(items[itemId], treeId);
        }
    }, [items, onCollapseItem, onExpandItem, viewState]);
    var toggleItemSelectStatus = useCallback(function (itemId, treeId) {
        var _a, _b, _c, _d, _e;
        if ((_b = (_a = viewState[treeId]) === null || _a === void 0 ? void 0 : _a.selectedItems) === null || _b === void 0 ? void 0 : _b.includes(itemId)) {
            onSelectItems === null || onSelectItems === void 0 ? void 0 : onSelectItems((_d = (_c = viewState[treeId].selectedItems) === null || _c === void 0 ? void 0 : _c.filter(function (item) { return item !== itemId; })) !== null && _d !== void 0 ? _d : [], treeId);
        }
        else {
            onSelectItems === null || onSelectItems === void 0 ? void 0 : onSelectItems(__spreadArray(__spreadArray([], ((_e = viewState[treeId].selectedItems) !== null && _e !== void 0 ? _e : []), true), [itemId], false), treeId);
        }
    }, [onSelectItems, viewState]);
    var invokePrimaryAction = useCallback(function (itemId, treeId) {
        onPrimaryAction === null || onPrimaryAction === void 0 ? void 0 : onPrimaryAction(items[itemId], treeId);
    }, [items, onPrimaryAction]);
    var expandSubsequently = useCallback(function (treeId, itemIds) { return __awaiter(void 0, void 0, void 0, function () {
        var current, rest;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    current = itemIds[0], rest = itemIds.slice(1);
                    return [4 /*yield*/, waitFor(function () { var _a; return !!((_a = itemsRef.current) === null || _a === void 0 ? void 0 : _a[current]); }).then(function () {
                            var item = itemsRef.current[current];
                            if (!item) {
                                return;
                            }
                            onExpandItem === null || onExpandItem === void 0 ? void 0 : onExpandItem(item, treeId);
                            expandSubsequently(treeId, rest);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [itemsRef, onExpandItem]);
    var expandAll = useCallback(function (treeId) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, recursiveExpand(trees[treeId].rootItem, itemsRef, function (item) {
                        return onExpandItem === null || onExpandItem === void 0 ? void 0 : onExpandItem(item, treeId);
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [itemsRef, onExpandItem, trees]);
    var collapseAll = useCallback(function (treeId) {
        var _a, _b;
        for (var _i = 0, _c = (_b = (_a = viewState[treeId]) === null || _a === void 0 ? void 0 : _a.expandedItems) !== null && _b !== void 0 ? _b : []; _i < _c.length; _i++) {
            var itemId = _c[_i];
            onCollapseItem === null || onCollapseItem === void 0 ? void 0 : onCollapseItem(items[itemId], treeId);
        }
    }, [items, onCollapseItem, viewState]);
    // TODO change environment childs to use actions rather than output events where possible
    var actions = useMemo(function () { return ({
        collapseItem: collapseItem,
        expandItem: expandItem,
        focusItem: focusItem,
        focusTree: focusTree,
        moveFocusDown: moveFocusDown,
        moveFocusUp: moveFocusUp,
        renameItem: renameItem,
        selectItems: selectItems,
        toggleItemExpandedState: toggleItemExpandedState,
        toggleItemSelectStatus: toggleItemSelectStatus,
        invokePrimaryAction: invokePrimaryAction,
        expandAll: expandAll,
        expandSubsequently: expandSubsequently,
        collapseAll: collapseAll,
        abortProgrammaticDrag: abortProgrammaticDrag,
        completeProgrammaticDrag: completeProgrammaticDrag,
        moveProgrammaticDragPositionDown: programmaticDragDown,
        moveProgrammaticDragPositionUp: programmaticDragUp,
        startProgrammaticDrag: startProgrammaticDrag,
    }); }, [
        collapseItem,
        expandItem,
        focusItem,
        focusTree,
        moveFocusDown,
        moveFocusUp,
        renameItem,
        selectItems,
        toggleItemExpandedState,
        toggleItemSelectStatus,
        invokePrimaryAction,
        expandAll,
        expandSubsequently,
        collapseAll,
        abortProgrammaticDrag,
        completeProgrammaticDrag,
        programmaticDragDown,
        programmaticDragUp,
        startProgrammaticDrag,
    ]);
    useCreatedEnvironmentRef(ref, actions);
    return (React.createElement(EnvironmentActionsContext.Provider, { value: actions }, props.children));
});
