"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TreeItemRenamingInput = void 0;
var react_1 = require("react");
var Tree_1 = require("../tree/Tree");
var ControlledTreeEnvironment_1 = require("../controlledEnvironment/ControlledTreeEnvironment");
var useHotkey_1 = require("../hotkeys/useHotkey");
var useSideEffect_1 = require("../useSideEffect");
var useCallSoon_1 = require("../useCallSoon");
var TreeItemRenamingInput = function (props) {
    var _a = (0, Tree_1.useTree)(), renderers = _a.renderers, treeInformation = _a.treeInformation, setRenamingItem = _a.setRenamingItem, treeId = _a.treeId;
    var environment = (0, ControlledTreeEnvironment_1.useTreeEnvironment)();
    var inputRef = (0, react_1.useRef)(null);
    var submitButtonRef = (0, react_1.useRef)(null);
    var item = environment.items[props.itemIndex];
    var _b = (0, react_1.useState)(environment.getItemTitle(item)), title = _b[0], setTitle = _b[1];
    var callSoon = (0, useCallSoon_1.useCallSoon)(true);
    var abort = function () {
        var _a;
        (_a = environment.onAbortRenamingItem) === null || _a === void 0 ? void 0 : _a.call(environment, item, treeInformation.treeId);
        setRenamingItem(null);
        callSoon(function () {
            environment.setActiveTree(treeId);
        });
    };
    var confirm = function () {
        var _a;
        (_a = environment.onRenameItem) === null || _a === void 0 ? void 0 : _a.call(environment, item, title, treeInformation.treeId);
        setRenamingItem(null);
        callSoon(function () {
            environment.setActiveTree(treeId);
        });
    };
    (0, useSideEffect_1.useSideEffect)(function () {
        var _a, _b, _c, _d;
        environment.setActiveTree(treeId);
        if ((_a = environment.autoFocus) !== null && _a !== void 0 ? _a : true) {
            (_b = inputRef.current) === null || _b === void 0 ? void 0 : _b.select();
            (_d = (_c = inputRef.current) === null || _c === void 0 ? void 0 : _c.focus) === null || _d === void 0 ? void 0 : _d.call(_c);
        }
    }, [environment, treeId], []);
    (0, useHotkey_1.useHotkey)('abortRenameItem', function () {
        abort();
    }, true, true);
    var inputProps = {
        value: title,
        onChange: function (e) {
            setTitle(e.target.value);
        },
        onBlur: function (e) {
            if (e.relatedTarget !== submitButtonRef.current) {
                abort();
            }
        },
        'aria-label': 'New item name',
        tabIndex: 0,
    };
    var submitButtonProps = {
        onClick: function (e) {
            e.stopPropagation();
            confirm();
        },
    };
    var formProps = {
        onSubmit: function (e) {
            e.preventDefault();
            confirm();
        },
    };
    return renderers.renderRenameInput({
        item: item,
        inputRef: inputRef,
        submitButtonProps: submitButtonProps,
        submitButtonRef: submitButtonRef,
        formProps: formProps,
        inputProps: inputProps,
    });
};
exports.TreeItemRenamingInput = TreeItemRenamingInput;
