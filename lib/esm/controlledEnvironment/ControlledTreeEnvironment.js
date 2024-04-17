var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import * as React from 'react';
import { useContext } from 'react';
import { InteractionManagerProvider } from './InteractionManagerProvider';
import { DragAndDropProvider } from '../drag/DragAndDropProvider';
import { EnvironmentActionsProvider } from '../environmentActions/EnvironmentActionsProvider';
import { useControlledTreeEnvironmentProps } from './useControlledTreeEnvironmentProps';
var TreeEnvironmentContext = React.createContext(null);
export var useTreeEnvironment = function () { return useContext(TreeEnvironmentContext); };
export var ControlledTreeEnvironment = React.forwardRef(function (props, ref) {
    var _a, _b, _c;
    var environmentContextProps = useControlledTreeEnvironmentProps(props);
    var viewState = props.viewState;
    // Make sure that every tree view state has a focused item
    for (var _i = 0, _d = Object.keys(environmentContextProps.trees); _i < _d.length; _i++) {
        var treeId = _d[_i];
        // TODO if the focus item is dragged out of the tree and is not within the expanded items
        // TODO of that tree, the tree does not show any focus item anymore.
        // Fix: use linear items to see if focus item is visible, and reset if not. Only refresh that
        // information when the viewstate changes
        if (!((_a = viewState[treeId]) === null || _a === void 0 ? void 0 : _a.focusedItem) &&
            environmentContextProps.trees[treeId]) {
            viewState[treeId] = __assign(__assign({}, viewState[treeId]), { focusedItem: (_c = (_b = props.items[environmentContextProps.trees[treeId].rootItem]) === null || _b === void 0 ? void 0 : _b.children) === null || _c === void 0 ? void 0 : _c[0] });
        }
    }
    return (React.createElement(TreeEnvironmentContext.Provider, { value: environmentContextProps },
        React.createElement(InteractionManagerProvider, null,
            React.createElement(DragAndDropProvider, null,
                React.createElement(EnvironmentActionsProvider, { ref: ref }, props.children)))));
});
