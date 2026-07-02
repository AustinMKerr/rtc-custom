"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useCreatedTreeInformation = void 0;
var react_1 = require("react");
var ControlledTreeEnvironment_1 = require("../controlledEnvironment/ControlledTreeEnvironment");
var DragAndDropProvider_1 = require("../drag/DragAndDropProvider");
var useCreatedTreeInformation = function (tree, renamingItem, search) {
    var _a, _b, _c;
    var environment = (0, ControlledTreeEnvironment_1.useTreeEnvironment)();
    var dnd = (0, DragAndDropProvider_1.useDragAndDrop)();
    var selectedItems = (_a = environment.viewState[tree.treeId]) === null || _a === void 0 ? void 0 : _a.selectedItems;
    var isSearchLoading = (_c = (_b = environment.searchLoading) === null || _b === void 0 ? void 0 : _b[tree.treeId]) !== null && _c !== void 0 ? _c : false;
    return (0, react_1.useMemo)(function () {
        var _a, _b;
        return ({
            isFocused: environment.activeTreeId === tree.treeId,
            isRenaming: !!renamingItem,
            areItemsSelected: ((_a = selectedItems === null || selectedItems === void 0 ? void 0 : selectedItems.length) !== null && _a !== void 0 ? _a : 0) > 0,
            isSearching: search !== null,
            isSearchLoading: isSearchLoading,
            search: search,
            isProgrammaticallyDragging: (_b = dnd.isProgrammaticallyDragging) !== null && _b !== void 0 ? _b : false,
            treeId: tree.treeId,
            rootItem: tree.rootItem,
            treeLabel: tree.treeLabel,
            treeLabelledBy: tree.treeLabelledBy,
        });
    }, [
        environment.activeTreeId,
        tree.treeId,
        tree.rootItem,
        tree.treeLabel,
        tree.treeLabelledBy,
        renamingItem,
        selectedItems === null || selectedItems === void 0 ? void 0 : selectedItems.length,
        search,
        isSearchLoading,
        dnd.isProgrammaticallyDragging,
    ]);
};
exports.useCreatedTreeInformation = useCreatedTreeInformation;
