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
exports.useGetViableDragPositions = void 0;
var react_1 = require("react");
var useGetParentOfLinearItem_1 = require("./useGetParentOfLinearItem");
var ControlledTreeEnvironment_1 = require("../controlledEnvironment/ControlledTreeEnvironment");
var useCanDropAt_1 = require("./useCanDropAt");
var useGetViableDragPositions = function () {
    var environment = (0, ControlledTreeEnvironment_1.useTreeEnvironment)();
    var getParentOfLinearItem = (0, useGetParentOfLinearItem_1.useGetGetParentOfLinearItem)();
    var canDropAt = (0, useCanDropAt_1.useCanDropAt)();
    return (0, react_1.useCallback)(function (treeId, draggingItems) {
        var linearItems = environment.linearItems[treeId];
        return linearItems
            .map(function (_a, linearIndex) {
            var _b, _c;
            var item = _a.item, depth = _a.depth;
            var parent = getParentOfLinearItem(linearIndex, treeId).parent;
            var childIndex = environment.items[parent.item].children.indexOf(item);
            var itemPosition = {
                targetType: 'item',
                parentItem: parent.item,
                targetItem: item,
                linearIndex: linearIndex,
                depth: depth,
                treeId: treeId,
            };
            var topPosition = {
                targetType: 'between-items',
                parentItem: parent.item,
                linePosition: 'top',
                childIndex: childIndex,
                depth: depth,
                treeId: treeId,
                linearIndex: linearIndex,
            };
            var bottomPosition = {
                targetType: 'between-items',
                parentItem: parent.item,
                linePosition: 'bottom',
                linearIndex: linearIndex + 1,
                childIndex: childIndex + 1,
                depth: depth,
                treeId: treeId,
            };
            var skipTopPosition = depth === ((_c = (_b = linearItems[linearIndex - 1]) === null || _b === void 0 ? void 0 : _b.depth) !== null && _c !== void 0 ? _c : -1);
            if (skipTopPosition) {
                return [itemPosition, bottomPosition];
            }
            return [topPosition, itemPosition, bottomPosition];
        })
            .reduce(function (a, b) { return __spreadArray(__spreadArray([], a, true), b, true); }, [])
            .filter(function (position) { return canDropAt(position, draggingItems); });
    }, [
        canDropAt,
        environment.items,
        environment.linearItems,
        getParentOfLinearItem,
    ]);
};
exports.useGetViableDragPositions = useGetViableDragPositions;
