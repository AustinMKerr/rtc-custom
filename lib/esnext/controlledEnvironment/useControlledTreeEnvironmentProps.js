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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { scrollIntoView } from '../tree/scrollIntoView';
import { useRenderers } from '../renderers/useRenderers';
import { buildMapForTrees, getDocument } from '../utils';
import { getItemsLinearly } from '../tree/getItemsLinearly';
import { useRefCopy } from '../useRefCopy';
import { useStableHandler } from '../useStableHandler';
/**
 * Normalizes whatever an `onSearch` callback resolves to into a
 * `{ items, order }` pair, or `null` when there is no overlay to show.
 * An empty array yields an (intentional) empty overlay; `null`/`undefined`
 * yields `null`, which restores the normal data-provider view.
 */
var normalizeSearchResults = function (result) {
    if (result === undefined || result === null) {
        return null;
    }
    var list = Array.isArray(result) ? result : Object.values(result);
    var items = {};
    var order = [];
    for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
        var item = list_1[_i];
        if (!item)
            continue;
        items[item.index] = item;
        order.push(item.index);
    }
    return { items: items, order: order };
};
export var useControlledTreeEnvironmentProps = function (_a) {
    var onExpandItemProp = _a.onExpandItem, onCollapseProp = _a.onCollapseItem, onDropProp = _a.onDrop, props = __rest(_a, ["onExpandItem", "onCollapseItem", "onDrop"]);
    var _b = useState({}), trees = _b[0], setTrees = _b[1];
    var _c = useState(), activeTreeId = _c[0], setActiveTreeId = _c[1];
    // Async-search overlay state, keyed by treeId. `searchResults[treeId]` holds
    // the items to display while that tree's search is active (or null/absent to
    // show the normal data-provider view); `searchLoading[treeId]` is true while
    // an `onSearch` request is in flight. The refs debounce typing and discard
    // out-of-order responses (last request per tree wins).
    var _d = useState({}), searchResults = _d[0], setSearchResults = _d[1];
    var _e = useState({}), searchLoading = _e[0], setSearchLoading = _e[1];
    var searchSeqRef = useRef({});
    var searchTimerRef = useRef({});
    var treeIds = useMemo(function () { return Object.keys(trees); }, [trees]);
    var onFocusItem = props.onFocusItem, autoFocus = props.autoFocus, onRegisterTree = props.onRegisterTree, onUnregisterTree = props.onUnregisterTree, viewState = props.viewState;
    var onFocusItemRef = useRefCopy(onFocusItem);
    var viewStateRef = useRefCopy(viewState);
    // Effective items: while any tree has an active async-search overlay, merge
    // the overlay's items into the data-provider items and swap the searching
    // tree's root children to the result order. Because both rendering and the
    // linear-item / drag machinery derive from `items[rootItem].children`, this
    // single override makes the results render, linearize, focus and drag exactly
    // like normal items — no other pipeline changes needed. When no search is
    // active this returns the original `items` reference (zero overhead / no
    // behavior change).
    var items = useMemo(function () {
        var _a;
        var activeTreeIds = treeIds.filter(function (treeId) { return searchResults[treeId]; });
        if (activeTreeIds.length === 0) {
            return props.items;
        }
        var merged = __assign({}, props.items);
        for (var _i = 0, activeTreeIds_1 = activeTreeIds; _i < activeTreeIds_1.length; _i++) {
            var treeId = activeTreeIds_1[_i];
            var result = searchResults[treeId];
            Object.assign(merged, result.items);
            var rootItem = (_a = trees[treeId]) === null || _a === void 0 ? void 0 : _a.rootItem;
            if (rootItem !== undefined) {
                var existingRoot = merged[rootItem];
                merged[rootItem] = existingRoot
                    ? __assign(__assign({}, existingRoot), { children: result.order }) : {
                    index: rootItem,
                    isFolder: true,
                    data: undefined,
                    children: result.order,
                };
            }
        }
        return merged;
    }, [props.items, searchResults, treeIds, trees]);
    var linearItems = useMemo(function () {
        return buildMapForTrees(treeIds, function (treeId) { var _a; return getItemsLinearly(trees[treeId].rootItem, (_a = viewState[treeId]) !== null && _a !== void 0 ? _a : {}, items); });
    }, [trees, items, treeIds, viewState]);
    var runSearch = useStableHandler(function (treeId, search) {
        var _a, _b;
        var onSearch = props.onSearch;
        if (!onSearch) {
            return;
        }
        // Cancel any pending debounce for this tree.
        if (searchTimerRef.current[treeId]) {
            clearTimeout(searchTimerRef.current[treeId]);
            delete searchTimerRef.current[treeId];
        }
        // Bump the per-tree sequence so any in-flight response is ignored.
        var seq = ((_a = searchSeqRef.current[treeId]) !== null && _a !== void 0 ? _a : 0) + 1;
        searchSeqRef.current[treeId] = seq;
        if (search === null || search.length === 0) {
            // Search cleared: drop the overlay and restore the normal view.
            setSearchResults(function (prev) {
                var _a;
                return prev[treeId] ? __assign(__assign({}, prev), (_a = {}, _a[treeId] = null, _a)) : prev;
            });
            setSearchLoading(function (prev) {
                var _a;
                return prev[treeId] ? __assign(__assign({}, prev), (_a = {}, _a[treeId] = false, _a)) : prev;
            });
            return;
        }
        setSearchLoading(function (prev) {
            var _a;
            return (prev[treeId] ? prev : __assign(__assign({}, prev), (_a = {}, _a[treeId] = true, _a)));
        });
        var debounce = (_b = props.searchDebounce) !== null && _b !== void 0 ? _b : 250;
        searchTimerRef.current[treeId] = setTimeout(function () {
            delete searchTimerRef.current[treeId];
            Promise.resolve(onSearch(search, treeId))
                .then(function (result) {
                if (searchSeqRef.current[treeId] !== seq)
                    return; // stale response
                setSearchResults(function (prev) {
                    var _a;
                    return (__assign(__assign({}, prev), (_a = {}, _a[treeId] = normalizeSearchResults(result), _a)));
                });
                setSearchLoading(function (prev) {
                    var _a;
                    return (__assign(__assign({}, prev), (_a = {}, _a[treeId] = false, _a)));
                });
            })
                .catch(function () {
                if (searchSeqRef.current[treeId] !== seq)
                    return;
                setSearchLoading(function (prev) {
                    var _a;
                    return (__assign(__assign({}, prev), (_a = {}, _a[treeId] = false, _a)));
                });
            });
        }, debounce);
    });
    // Clear any pending debounce timers when the environment unmounts.
    useEffect(function () { return function () {
        Object.values(searchTimerRef.current).forEach(function (timer) {
            return clearTimeout(timer);
        });
    }; }, []);
    var onFocusItemHandler = useCallback(function (item, treeId, setDomFocus) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (setDomFocus === void 0) { setDomFocus = true; }
        if ((autoFocus !== null && autoFocus !== void 0 ? autoFocus : true) && setDomFocus) {
            var newItem = (_a = getDocument()) === null || _a === void 0 ? void 0 : _a.querySelector("[data-rct-tree=\"".concat(treeId, "\"] [data-rct-item-id=\"").concat(item.index, "\"]"));
            if (((_d = (_c = (_b = getDocument()) === null || _b === void 0 ? void 0 : _b.activeElement) === null || _c === void 0 ? void 0 : _c.attributes.getNamedItem('data-rct-search-input')) === null || _d === void 0 ? void 0 : _d.value) !== 'true') {
                // Move DOM focus to item if the current focus is not on the search input
                (_e = newItem === null || newItem === void 0 ? void 0 : newItem.focus) === null || _e === void 0 ? void 0 : _e.call(newItem);
            }
            else {
                // Otherwise just manually scroll into view
                scrollIntoView(newItem);
            }
        }
        if (((_f = viewStateRef.current[treeId]) === null || _f === void 0 ? void 0 : _f.focusedItem) === item.index) {
            return;
        }
        (_g = onFocusItemRef.current) === null || _g === void 0 ? void 0 : _g.call(onFocusItemRef, item, treeId);
    }, [autoFocus, onFocusItemRef, viewStateRef]);
    var registerTree = useCallback(function (tree) {
        setTrees(function (trees) {
            var _a;
            return (__assign(__assign({}, trees), (_a = {}, _a[tree.treeId] = tree, _a)));
        });
        onRegisterTree === null || onRegisterTree === void 0 ? void 0 : onRegisterTree(tree);
    }, [onRegisterTree]);
    var unregisterTree = useCallback(function (treeId) {
        onUnregisterTree === null || onUnregisterTree === void 0 ? void 0 : onUnregisterTree(trees[treeId]);
        // Tear down any async-search state/timer for the tree being removed.
        if (searchTimerRef.current[treeId]) {
            clearTimeout(searchTimerRef.current[treeId]);
            delete searchTimerRef.current[treeId];
        }
        delete searchSeqRef.current[treeId];
        setSearchResults(function (prev) {
            if (!(treeId in prev))
                return prev;
            var next = __assign({}, prev);
            delete next[treeId];
            return next;
        });
        setSearchLoading(function (prev) {
            if (!(treeId in prev))
                return prev;
            var next = __assign({}, prev);
            delete next[treeId];
            return next;
        });
        delete trees[treeId];
        setTrees(trees);
    }, [onUnregisterTree, trees]);
    var onCollapseItem = useCallback(function (item, treeId) {
        onCollapseProp === null || onCollapseProp === void 0 ? void 0 : onCollapseProp(item, treeId);
        setTrees(function (trees) { return trees; });
    }, [onCollapseProp]);
    var onExpandItem = useCallback(function (item, treeId) {
        onExpandItemProp === null || onExpandItemProp === void 0 ? void 0 : onExpandItemProp(item, treeId);
        setTrees(function (trees) { return trees; });
    }, [onExpandItemProp]);
    var onDrop = useCallback(function (items, target) {
        onDropProp === null || onDropProp === void 0 ? void 0 : onDropProp(items, target);
        setTrees(function (trees) { return trees; });
    }, [onDropProp]);
    var focusTree = useCallback(function (treeId) {
        var _a, _b;
        var focusItem = (_a = getDocument()) === null || _a === void 0 ? void 0 : _a.querySelector("[data-rct-tree=\"".concat(treeId, "\"] [data-rct-item-focus=\"true\"]"));
        (_b = focusItem === null || focusItem === void 0 ? void 0 : focusItem.focus) === null || _b === void 0 ? void 0 : _b.call(focusItem);
    }, []);
    var setActiveTree = useCallback(function (treeIdOrSetStateFunction, autoFocusTree) {
        if (autoFocusTree === void 0) { autoFocusTree = true; }
        var maybeFocusTree = function (treeId) {
            var _a, _b;
            if (autoFocusTree &&
                (autoFocus !== null && autoFocus !== void 0 ? autoFocus : true) &&
                treeId &&
                !((_b = (_a = getDocument()) === null || _a === void 0 ? void 0 : _a.querySelector("[data-rct-tree=\"".concat(treeId, "\"]"))) === null || _b === void 0 ? void 0 : _b.contains(document.activeElement))) {
                focusTree(treeId);
            }
        };
        if (typeof treeIdOrSetStateFunction === 'function') {
            setActiveTreeId(function (oldValue) {
                var treeId = treeIdOrSetStateFunction(oldValue);
                if (treeId !== oldValue) {
                    maybeFocusTree(treeId);
                }
                return treeId;
            });
        }
        else {
            var treeId = treeIdOrSetStateFunction;
            setActiveTreeId(treeId);
            maybeFocusTree(treeId);
        }
    }, [autoFocus, focusTree]);
    var renderers = useRenderers(props);
    return __assign(__assign(__assign({}, renderers), props), { 
        // `items` must come after `...props` to override the raw data-provider
        // items with the effective (search-overlay-merged) items.
        items: items, onFocusItem: onFocusItemHandler, registerTree: registerTree, unregisterTree: unregisterTree, onExpandItem: onExpandItem, onCollapseItem: onCollapseItem, onDrop: onDrop, setActiveTree: setActiveTree, treeIds: treeIds, trees: trees, activeTreeId: activeTreeId, linearItems: linearItems, searchResults: searchResults, searchLoading: searchLoading, runSearch: runSearch });
};
