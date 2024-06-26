import { useMemo, useRef } from 'react';
import { useHtmlElementEventListener } from '../useHtmlElementEventListener';
import { useKeyboardBindings } from './useKeyboardBindings';
import { useCallSoon } from '../useCallSoon';
import { getDocument } from '../utils';
var elementsThatCanTakeText = ['input', 'textarea'];
export var useHotkey = function (combinationName, onHit, active, activatableWhileFocusingInput) {
    if (activatableWhileFocusingInput === void 0) { activatableWhileFocusingInput = false; }
    var pressedKeys = useRef([]);
    var keyboardBindings = useKeyboardBindings();
    var callSoon = useCallSoon();
    var possibleCombinations = useMemo(function () {
        return keyboardBindings[combinationName].map(function (combination) {
            return combination.split('+');
        });
    }, [combinationName, keyboardBindings]);
    useHtmlElementEventListener(getDocument(), 'keydown', function (e) {
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
    useHtmlElementEventListener(getDocument(), 'keyup', function (e) {
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
