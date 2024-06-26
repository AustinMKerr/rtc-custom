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
import React from 'react';
var cx = function () {
    var classNames = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        classNames[_i] = arguments[_i];
    }
    return classNames.filter(function (cn) { return !!cn; }).join(' ');
};
export var createDefaultRenderers = function (renderDepthOffset) { return ({
    renderItemTitle: function (_a) {
        var title = _a.title, context = _a.context, info = _a.info;
        if (!info.isSearching || !context.isSearchMatching) {
            return title;
        }
        var startIndex = title.toLowerCase().indexOf(info.search.toLowerCase());
        return (React.createElement(React.Fragment, null,
            startIndex > 0 && React.createElement("span", null, title.slice(0, startIndex)),
            React.createElement("span", { className: "rct-tree-item-search-highlight" }, title.slice(startIndex, startIndex + info.search.length)),
            startIndex + info.search.length < title.length && (React.createElement("span", null, title.slice(startIndex + info.search.length, title.length)))));
    },
    renderItemArrow: function (_a) {
        var item = _a.item, context = _a.context;
        return (
        // Icons from https://blueprintjs.com/docs/#icons
        React.createElement("div", __assign({ className: cx(item.isFolder && 'rct-tree-item-arrow-isFolder', 'rct-tree-item-arrow') }, context.arrowProps), item.isFolder &&
            (context.isExpanded ? (React.createElement("svg", { version: "1.1", xmlns: "http://www.w3.org/2000/svg", xmlnsXlink: "http://www.w3.org/1999/xlink", x: "0px", y: "0px", viewBox: "0 0 16 16", enableBackground: "new 0 0 16 16", xmlSpace: "preserve" },
                React.createElement("g", null,
                    React.createElement("g", null,
                        React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z", className: "rct-tree-item-arrow-path" }))))) : (React.createElement("svg", { version: "1.1", xmlns: "http://www.w3.org/2000/svg", xmlnsXlink: "http://www.w3.org/1999/xlink", x: "0px", y: "0px", viewBox: "0 0 16 16", enableBackground: "new 0 0 16 16", xmlSpace: "preserve" },
                React.createElement("g", null,
                    React.createElement("g", null,
                        React.createElement("path", { fillRule: "evenodd", clipRule: "evenodd", d: "M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z", className: "rct-tree-item-arrow-path" }))))))));
    },
    renderItem: function (_a) {
        var item = _a.item, depth = _a.depth, children = _a.children, title = _a.title, context = _a.context, arrow = _a.arrow;
        var InteractiveComponent = context.isRenaming ? 'div' : 'button';
        var type = context.isRenaming ? undefined : 'button';
        // TODO have only root li component create all the classes
        return (React.createElement("li", __assign({}, context.itemContainerWithChildrenProps, { className: cx('rct-tree-item-li', item.isFolder && 'rct-tree-item-li-isFolder', context.isSelected && 'rct-tree-item-li-selected', context.isExpanded && 'rct-tree-item-li-expanded', context.isFocused && 'rct-tree-item-li-focused', context.isDraggingOver && 'rct-tree-item-li-dragging-over', context.isSearchMatching && 'rct-tree-item-li-search-match') }),
            React.createElement("div", __assign({}, context.itemContainerWithoutChildrenProps, { style: { paddingLeft: "".concat((depth + 1) * renderDepthOffset, "px") }, className: cx('rct-tree-item-title-container', item.isFolder && 'rct-tree-item-title-container-isFolder', context.isSelected && 'rct-tree-item-title-container-selected', context.isExpanded && 'rct-tree-item-title-container-expanded', context.isFocused && 'rct-tree-item-title-container-focused', context.isDraggingOver &&
                    'rct-tree-item-title-container-dragging-over', context.isSearchMatching &&
                    'rct-tree-item-title-container-search-match') }),
                arrow,
                React.createElement(InteractiveComponent, __assign({ type: type }, context.interactiveElementProps, { className: cx('rct-tree-item-button', item.isFolder && 'rct-tree-item-button-isFolder', context.isSelected && 'rct-tree-item-button-selected', context.isExpanded && 'rct-tree-item-button-expanded', context.isFocused && 'rct-tree-item-button-focused', context.isDraggingOver && 'rct-tree-item-button-dragging-over', context.isSearchMatching && 'rct-tree-item-button-search-match') }), title)),
            children));
    },
    renderRenameInput: function (_a) {
        var inputProps = _a.inputProps, inputRef = _a.inputRef, submitButtonProps = _a.submitButtonProps, submitButtonRef = _a.submitButtonRef, formProps = _a.formProps;
        return (React.createElement("form", __assign({}, formProps, { className: "rct-tree-item-renaming-form" }),
            React.createElement("input", __assign({}, inputProps, { ref: inputRef, className: "rct-tree-item-renaming-input" })),
            React.createElement("input", __assign({}, submitButtonProps, { ref: submitButtonRef, type: "submit", className: "rct-tree-item-renaming-submit-button", value: "\uD83D\uDDF8" }))));
    },
    renderTreeContainer: function (_a) {
        var children = _a.children, containerProps = _a.containerProps, info = _a.info;
        return (React.createElement("div", { className: cx('rct-tree-root', info.isFocused && 'rct-tree-root-focus', info.isRenaming && 'rct-tree-root-renaming', info.areItemsSelected && 'rct-tree-root-itemsselected') },
            React.createElement("div", __assign({}, containerProps, { style: __assign({ minHeight: '30px' }, containerProps.style) }), children)));
    },
    renderItemsContainer: function (_a) {
        var children = _a.children, containerProps = _a.containerProps;
        return (React.createElement("ul", __assign({}, containerProps, { className: "rct-tree-items-container" }), children));
    },
    renderDragBetweenLine: function (_a) {
        var draggingPosition = _a.draggingPosition, lineProps = _a.lineProps;
        return (React.createElement("div", __assign({}, lineProps, { style: { left: "".concat(draggingPosition.depth * renderDepthOffset, "px") }, className: cx('rct-tree-drag-between-line', draggingPosition.targetType === 'between-items' &&
                draggingPosition.linePosition === 'top' &&
                'rct-tree-drag-between-line-top', draggingPosition.targetType === 'between-items' &&
                draggingPosition.linePosition === 'bottom' &&
                'rct-tree-drag-between-line-bottom') })));
    },
    renderSearchInput: function (_a) {
        var inputProps = _a.inputProps;
        return (React.createElement("div", { className: cx('rct-tree-search-input-container') },
            React.createElement("span", { className: "rct-tree-input-icon" }),
            React.createElement("input", __assign({}, inputProps, { className: cx('rct-tree-search-input') }))));
    },
    renderLiveDescriptorContainer: function (_a) {
        var tree = _a.tree, children = _a.children;
        return (React.createElement("div", { id: "rct-livedescription-".concat(tree.treeId), style: {
                clip: 'rect(0 0 0 0)',
                clipPath: 'inset(50%)',
                height: '1px',
                overflow: 'hidden',
                position: 'absolute',
                whiteSpace: 'nowrap',
                width: '1px',
            } }, children));
    },
    renderDepthOffset: renderDepthOffset,
}); };
