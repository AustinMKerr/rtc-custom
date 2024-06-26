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
import { useRef } from 'react';
import { TreeItemChildren } from '../treeItem/TreeItemChildren';
import { DragBetweenLine } from './DragBetweenLine';
import { useFocusWithin } from './useFocusWithin';
import { useTreeKeyboardBindings } from './useTreeKeyboardBindings';
import { SearchInput } from '../search/SearchInput';
import { useTree } from './Tree';
import { useTreeEnvironment } from '../controlledEnvironment/ControlledTreeEnvironment';
import { useDragAndDrop } from '../drag/DragAndDropProvider';
import { MaybeLiveDescription } from './MaybeLiveDescription';
export var TreeManager = function () {
    var _a = useTree(), treeId = _a.treeId, rootItem = _a.rootItem, renderers = _a.renderers, treeInformation = _a.treeInformation;
    var environment = useTreeEnvironment();
    var containerRef = useRef();
    var dnd = useDragAndDrop();
    useTreeKeyboardBindings();
    useFocusWithin(containerRef.current, function () {
        environment.setActiveTree(treeId);
    }, function () {
        environment.setActiveTree(function (oldTreeId) {
            return oldTreeId === treeId ? undefined : oldTreeId;
        });
    });
    var rootChildren = environment.items[rootItem].children;
    var treeChildren = (React.createElement(React.Fragment, null,
        React.createElement(MaybeLiveDescription, null),
        React.createElement(TreeItemChildren, { depth: 0, parentId: rootItem }, rootChildren !== null && rootChildren !== void 0 ? rootChildren : []),
        React.createElement(DragBetweenLine, { treeId: treeId }),
        React.createElement(SearchInput, { containerRef: containerRef.current })));
    var containerProps = __assign({ onDragOver: function (e) {
            e.preventDefault(); // Allow drop. Also implicitly set by items, but needed here as well for dropping on empty space
            dnd.onDragOverTreeHandler(e, treeId, containerRef);
        }, onMouseDown: function () { return dnd.abortProgrammaticDrag(); }, ref: containerRef, style: { position: 'relative' }, role: 'tree', 'aria-label': !treeInformation.treeLabelledBy
            ? treeInformation.treeLabel
            : undefined, 'aria-labelledby': treeInformation.treeLabelledBy }, {
        'data-rct-tree': treeId,
    });
    return renderers.renderTreeContainer({
        children: treeChildren,
        info: treeInformation,
        containerProps: containerProps,
    });
};
