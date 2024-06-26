"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTreeKeyboardBindings = void 0;
var useKey_1 = require("../hotkeys/useKey");
var useHotkey_1 = require("../hotkeys/useHotkey");
var useMoveFocusToIndex_1 = require("./useMoveFocusToIndex");
var useViewState_1 = require("./useViewState");
var Tree_1 = require("./Tree");
var ControlledTreeEnvironment_1 = require("../controlledEnvironment/ControlledTreeEnvironment");
var DragAndDropProvider_1 = require("../drag/DragAndDropProvider");
var useSelectUpTo_1 = require("./useSelectUpTo");
var useLinearItems_1 = require("../controlledEnvironment/useLinearItems");
var useTreeKeyboardBindings = function () {
    var _a;
    var environment = (0, ControlledTreeEnvironment_1.useTreeEnvironment)();
    var _b = (0, Tree_1.useTree)(), treeId = _b.treeId, setRenamingItem = _b.setRenamingItem, setSearch = _b.setSearch, renamingItem = _b.renamingItem;
    var linearItems = (0, useLinearItems_1.useLinearItems)(treeId);
    var dnd = (0, DragAndDropProvider_1.useDragAndDrop)();
    var viewState = (0, useViewState_1.useViewState)();
    var moveFocusToIndex = (0, useMoveFocusToIndex_1.useMoveFocusToIndex)();
    var selectUpTo = (0, useSelectUpTo_1.useSelectUpTo)('first-selected');
    var isActiveTree = environment.activeTreeId === treeId;
    var isRenaming = !!renamingItem;
    (0, useKey_1.useKey)('arrowdown', function (e) {
        e.preventDefault();
        if (dnd.isProgrammaticallyDragging) {
            dnd.programmaticDragDown();
        }
        else {
            var newFocusItem = moveFocusToIndex(function (currentIndex) { return currentIndex + 1; });
            if (e.shiftKey) {
                selectUpTo(newFocusItem);
            }
        }
    }, isActiveTree && !isRenaming);
    (0, useKey_1.useKey)('arrowup', function (e) {
        e.preventDefault();
        if (dnd.isProgrammaticallyDragging) {
            dnd.programmaticDragUp();
        }
        else {
            var newFocusItem = moveFocusToIndex(function (currentIndex) { return currentIndex - 1; });
            if (e.shiftKey) {
                selectUpTo(newFocusItem);
            }
        }
    }, isActiveTree && !isRenaming);
    (0, useHotkey_1.useHotkey)('moveFocusToFirstItem', function (e) {
        e.preventDefault();
        moveFocusToIndex(function () { return 0; });
    }, isActiveTree && !dnd.isProgrammaticallyDragging && !isRenaming);
    (0, useHotkey_1.useHotkey)('moveFocusToLastItem', function (e) {
        e.preventDefault();
        moveFocusToIndex(function (currentIndex, linearItems) { return linearItems.length - 1; });
    }, isActiveTree && !dnd.isProgrammaticallyDragging && !isRenaming);
    (0, useKey_1.useKey)('arrowright', function (e) {
        e.preventDefault();
        moveFocusToIndex(function (currentIndex, linearItems) {
            var _a, _b;
            var item = environment.items[linearItems[currentIndex].item];
            if (item.isFolder) {
                if ((_a = viewState.expandedItems) === null || _a === void 0 ? void 0 : _a.includes(item.index)) {
                    return currentIndex + 1;
                }
                (_b = environment.onExpandItem) === null || _b === void 0 ? void 0 : _b.call(environment, item, treeId);
            }
            return currentIndex;
        });
    }, isActiveTree && !dnd.isProgrammaticallyDragging && !isRenaming);
    (0, useKey_1.useKey)('arrowleft', function (e) {
        e.preventDefault();
        moveFocusToIndex(function (currentIndex, linearItems) {
            var _a, _b;
            var item = environment.items[linearItems[currentIndex].item];
            var itemDepth = linearItems[currentIndex].depth;
            if (item.isFolder && ((_a = viewState.expandedItems) === null || _a === void 0 ? void 0 : _a.includes(item.index))) {
                (_b = environment.onCollapseItem) === null || _b === void 0 ? void 0 : _b.call(environment, item, treeId);
            }
            else if (itemDepth > 0) {
                var parentIndex = currentIndex;
                for (parentIndex; linearItems[parentIndex].depth !== itemDepth - 1; parentIndex -= 1)
                    ;
                return parentIndex;
            }
            return currentIndex;
        });
    }, isActiveTree && !dnd.isProgrammaticallyDragging && !isRenaming);
    (0, useHotkey_1.useHotkey)('primaryAction', function (e) {
        var _a, _b;
        e.preventDefault();
        if (viewState.focusedItem !== undefined) {
            (_a = environment.onSelectItems) === null || _a === void 0 ? void 0 : _a.call(environment, [viewState.focusedItem], treeId);
            (_b = environment.onPrimaryAction) === null || _b === void 0 ? void 0 : _b.call(environment, environment.items[viewState.focusedItem], treeId);
        }
    }, isActiveTree && !dnd.isProgrammaticallyDragging && !isRenaming);
    (0, useHotkey_1.useHotkey)('toggleSelectItem', function (e) {
        var _a, _b, _c;
        e.preventDefault();
        if (viewState.focusedItem !== undefined) {
            if (viewState.selectedItems &&
                viewState.selectedItems.includes(viewState.focusedItem)) {
                (_a = environment.onSelectItems) === null || _a === void 0 ? void 0 : _a.call(environment, viewState.selectedItems.filter(function (item) { return item !== viewState.focusedItem; }), treeId);
            }
            else {
                (_b = environment.onSelectItems) === null || _b === void 0 ? void 0 : _b.call(environment, __spreadArray(__spreadArray([], ((_c = viewState.selectedItems) !== null && _c !== void 0 ? _c : []), true), [viewState.focusedItem], false), treeId);
            }
        }
    }, isActiveTree && !dnd.isProgrammaticallyDragging && !isRenaming);
    (0, useHotkey_1.useHotkey)('selectAll', function (e) {
        var _a;
        e.preventDefault();
        (_a = environment.onSelectItems) === null || _a === void 0 ? void 0 : _a.call(environment, linearItems.map(function (_a) {
            var item = _a.item;
            return item;
        }), treeId);
    }, isActiveTree && !dnd.isProgrammaticallyDragging && !isRenaming);
    (0, useHotkey_1.useHotkey)('renameItem', function (e) {
        var _a;
        if (viewState.focusedItem === undefined) {
            return;
        }
        e.preventDefault();
        var item = environment.items[viewState.focusedItem];
        if (item.canRename === false) {
            return;
        }
        (_a = environment.onStartRenamingItem) === null || _a === void 0 ? void 0 : _a.call(environment, item, treeId);
        setRenamingItem(item.index);
    }, isActiveTree && ((_a = environment.canRename) !== null && _a !== void 0 ? _a : true) && !isRenaming);
    (0, useHotkey_1.useHotkey)('startSearch', function (e) {
        var _a, _b;
        e.preventDefault();
        setSearch('');
        (_b = (_a = document.querySelector('[data-rct-search-input="true"]')) === null || _a === void 0 ? void 0 : _a.focus) === null || _b === void 0 ? void 0 : _b.call(_a);
    }, isActiveTree && !dnd.isProgrammaticallyDragging && !isRenaming);
    (0, useHotkey_1.useHotkey)('startProgrammaticDnd', function (e) {
        e.preventDefault();
        dnd.startProgrammaticDrag();
    }, isActiveTree && !isRenaming);
    (0, useHotkey_1.useHotkey)('completeProgrammaticDnd', function (e) {
        e.preventDefault();
        dnd.completeProgrammaticDrag();
    }, isActiveTree && dnd.isProgrammaticallyDragging && !isRenaming);
    (0, useHotkey_1.useHotkey)('abortProgrammaticDnd', function (e) {
        e.preventDefault();
        dnd.abortProgrammaticDrag();
    }, isActiveTree && dnd.isProgrammaticallyDragging && !isRenaming);
};
exports.useTreeKeyboardBindings = useTreeKeyboardBindings;
