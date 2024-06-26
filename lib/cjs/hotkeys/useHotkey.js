"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useHotkey = void 0;
var react_1 = require("react");
var useHtmlElementEventListener_1 = require("../useHtmlElementEventListener");
var useKeyboardBindings_1 = require("./useKeyboardBindings");
var useCallSoon_1 = require("../useCallSoon");
var utils_1 = require("../utils");
var elementsThatCanTakeText = ['input', 'textarea'];
var useHotkey = function (combinationName, onHit, active, activatableWhileFocusingInput) {
    if (activatableWhileFocusingInput === void 0) { activatableWhileFocusingInput = false; }
    var pressedKeys = (0, react_1.useRef)([]);
    var keyboardBindings = (0, useKeyboardBindings_1.useKeyboardBindings)();
    var callSoon = (0, useCallSoon_1.useCallSoon)();
    var possibleCombinations = (0, react_1.useMemo)(function () {
        return keyboardBindings[combinationName].map(function (combination) {
            return combination.split('+');
        });
    }, [combinationName, keyboardBindings]);
    (0, useHtmlElementEventListener_1.useHtmlElementEventListener)((0, utils_1.getDocument)(), 'keydown', function (e) {
        var _a;
        if (active === false) {
            return;
        }
        if ((elementsThatCanTakeText.includes((_a = e.target.tagName) === null || _a === void 0 ? void 0 : _a.toLowerCase()) ||
            e.target.isContentEditable) &&
            !activatableWhileFocusingInput) {
            // Skip if an input is selected
            return;
        }
        if (!pressedKeys.current.includes(e.key)) {
            pressedKeys.current.push(e.key);
            var pressedKeysLowercase_1 = pressedKeys.current.map(function (key) {
                return key.toLowerCase();
            });
            var partialMatch = possibleCombinations
                .map(function (combination) {
                return pressedKeysLowercase_1
                    .map(function (key) { return combination.includes(key.toLowerCase()); })
                    .reduce(function (a, b) { return a && b; }, true);
            })
                .reduce(function (a, b) { return a || b; }, false);
            if (partialMatch) {
                if (pressedKeys.current.length > 1 || !/^[a-zA-Z]$/.test(e.key)) {
                    // Prevent default, but not if this is the first input and a letter (which should trigger a search)
                    e.preventDefault();
                }
            }
        }
    });
    (0, useHtmlElementEventListener_1.useHtmlElementEventListener)((0, utils_1.getDocument)(), 'keyup', function (e) {
        if (active === false) {
            return;
        }
        var pressedKeysLowercase = pressedKeys.current.map(function (key) {
            return key.toLowerCase();
        });
        var match = possibleCombinations
            .map(function (combination) {
            return combination
                .map(function (key) { return pressedKeysLowercase.includes(key.toLowerCase()); })
                .reduce(function (a, b) { return a && b; }, true);
        })
            .reduce(function (a, b) { return a || b; }, false);
        if (match) {
            callSoon(function () { return onHit(e); });
        }
        pressedKeys.current = pressedKeys.current.filter(function (key) { return key !== e.key; });
    });
};
exports.useHotkey = useHotkey;
