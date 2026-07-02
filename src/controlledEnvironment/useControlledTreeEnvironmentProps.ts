import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ControlledTreeEnvironmentProps,
  SearchResults,
  TreeChangeHandlers,
  TreeConfiguration,
  TreeEnvironmentContextProps,
  TreeItem,
  TreeItemIndex,
} from '../types';
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
const normalizeSearchResults = (
  result: Record<TreeItemIndex, TreeItem> | TreeItem[] | void
): SearchResults | null => {
  if (result === undefined || result === null) {
    return null;
  }
  const list = Array.isArray(result) ? result : Object.values(result);
  const items: Record<TreeItemIndex, TreeItem> = {};
  const order: TreeItemIndex[] = [];
  for (const item of list) {
    if (!item) continue;
    items[item.index] = item;
    order.push(item.index);
  }
  return { items, order };
};

export const useControlledTreeEnvironmentProps = ({
  onExpandItem: onExpandItemProp,
  onCollapseItem: onCollapseProp,
  onDrop: onDropProp,
  ...props
}: ControlledTreeEnvironmentProps): TreeEnvironmentContextProps => {
  const [trees, setTrees] = useState<Record<string, TreeConfiguration>>({});
  const [activeTreeId, setActiveTreeId] = useState<string>();

  // Async-search overlay state, keyed by treeId. `searchResults[treeId]` holds
  // the items to display while that tree's search is active (or null/absent to
  // show the normal data-provider view); `searchLoading[treeId]` is true while
  // an `onSearch` request is in flight. The refs debounce typing and discard
  // out-of-order responses (last request per tree wins).
  const [searchResults, setSearchResults] = useState<
    Record<string, SearchResults | null>
  >({});
  const [searchLoading, setSearchLoading] = useState<Record<string, boolean>>(
    {}
  );
  const searchSeqRef = useRef<Record<string, number>>({});
  const searchTimerRef = useRef<
    Record<string, ReturnType<typeof setTimeout>>
  >({});

  const treeIds = useMemo(() => Object.keys(trees), [trees]);

  const { onFocusItem, autoFocus, onRegisterTree, onUnregisterTree, viewState } =
    props;

  const onFocusItemRef = useRefCopy(onFocusItem);
  const viewStateRef = useRefCopy(viewState);

  // Effective items: while any tree has an active async-search overlay, merge
  // the overlay's items into the data-provider items and swap the searching
  // tree's root children to the result order. Because both rendering and the
  // linear-item / drag machinery derive from `items[rootItem].children`, this
  // single override makes the results render, linearize, focus and drag exactly
  // like normal items — no other pipeline changes needed. When no search is
  // active this returns the original `items` reference (zero overhead / no
  // behavior change).
  const items = useMemo(() => {
    const activeTreeIds = treeIds.filter(treeId => searchResults[treeId]);
    if (activeTreeIds.length === 0) {
      return props.items;
    }
    const merged: Record<TreeItemIndex, TreeItem> = { ...props.items };
    for (const treeId of activeTreeIds) {
      const result = searchResults[treeId]!;
      Object.assign(merged, result.items);
      const rootItem = trees[treeId]?.rootItem;
      if (rootItem !== undefined) {
        const existingRoot = merged[rootItem];
        merged[rootItem] = existingRoot
          ? { ...existingRoot, children: result.order }
          : {
              index: rootItem,
              isFolder: true,
              data: undefined,
              children: result.order,
            };
      }
    }
    return merged;
  }, [props.items, searchResults, treeIds, trees]);

  const linearItems = useMemo(
    () =>
      buildMapForTrees(treeIds, treeId =>
        getItemsLinearly(trees[treeId].rootItem, viewState[treeId] ?? {}, items)
      ),
    [trees, items, treeIds, viewState]
  );

  const runSearch = useStableHandler((treeId: string, search: string | null) => {
    const onSearch = props.onSearch;
    if (!onSearch) {
      return;
    }

    // Cancel any pending debounce for this tree.
    if (searchTimerRef.current[treeId]) {
      clearTimeout(searchTimerRef.current[treeId]);
      delete searchTimerRef.current[treeId];
    }

    // Bump the per-tree sequence so any in-flight response is ignored.
    const seq = (searchSeqRef.current[treeId] ?? 0) + 1;
    searchSeqRef.current[treeId] = seq;

    if (search === null || search.length === 0) {
      // Search cleared: drop the overlay and restore the normal view.
      setSearchResults(prev =>
        prev[treeId] ? { ...prev, [treeId]: null } : prev
      );
      setSearchLoading(prev =>
        prev[treeId] ? { ...prev, [treeId]: false } : prev
      );
      return;
    }

    setSearchLoading(prev => (prev[treeId] ? prev : { ...prev, [treeId]: true }));

    const debounce = props.searchDebounce ?? 250;
    searchTimerRef.current[treeId] = setTimeout(() => {
      delete searchTimerRef.current[treeId];
      Promise.resolve(onSearch(search, treeId))
        .then(result => {
          if (searchSeqRef.current[treeId] !== seq) return; // stale response
          setSearchResults(prev => ({
            ...prev,
            [treeId]: normalizeSearchResults(result),
          }));
          setSearchLoading(prev => ({ ...prev, [treeId]: false }));
        })
        .catch(() => {
          if (searchSeqRef.current[treeId] !== seq) return;
          setSearchLoading(prev => ({ ...prev, [treeId]: false }));
        });
    }, debounce);
  });

  // Clear any pending debounce timers when the environment unmounts.
  useEffect(
    () => () => {
      Object.values(searchTimerRef.current).forEach(timer =>
        clearTimeout(timer)
      );
    },
    []
  );

  const onFocusItemHandler = useCallback<
    Required<TreeChangeHandlers>['onFocusItem']
  >(
    (item, treeId, setDomFocus = true) => {
      if ((autoFocus ?? true) && setDomFocus) {
        const newItem = getDocument()?.querySelector(
          `[data-rct-tree="${treeId}"] [data-rct-item-id="${item.index}"]`
        );

        if (
          getDocument()?.activeElement?.attributes.getNamedItem(
            'data-rct-search-input'
          )?.value !== 'true'
        ) {
          // Move DOM focus to item if the current focus is not on the search input
          (newItem as HTMLElement)?.focus?.();
        } else {
          // Otherwise just manually scroll into view
          scrollIntoView(newItem);
        }
      }

      if (viewStateRef.current[treeId]?.focusedItem === item.index) {
        return;
      }

      onFocusItemRef.current?.(item, treeId);
    },
    [autoFocus, onFocusItemRef, viewStateRef]
  );

  const registerTree = useCallback(
    tree => {
      setTrees(trees => ({ ...trees, [tree.treeId]: tree }));
      onRegisterTree?.(tree);
    },
    [onRegisterTree]
  );

  const unregisterTree = useCallback(
    treeId => {
      onUnregisterTree?.(trees[treeId]);
      // Tear down any async-search state/timer for the tree being removed.
      if (searchTimerRef.current[treeId]) {
        clearTimeout(searchTimerRef.current[treeId]);
        delete searchTimerRef.current[treeId];
      }
      delete searchSeqRef.current[treeId];
      setSearchResults(prev => {
        if (!(treeId in prev)) return prev;
        const next = { ...prev };
        delete next[treeId];
        return next;
      });
      setSearchLoading(prev => {
        if (!(treeId in prev)) return prev;
        const next = { ...prev };
        delete next[treeId];
        return next;
      });
      delete trees[treeId];
      setTrees(trees);
    },
    [onUnregisterTree, trees]
  );

  const onCollapseItem = useCallback(
    (item, treeId) => {
      onCollapseProp?.(item, treeId);
      setTrees(trees => trees);
    },
    [onCollapseProp]
  );

  const onExpandItem = useCallback(
    (item, treeId) => {
      onExpandItemProp?.(item, treeId);
      setTrees(trees => trees);
    },
    [onExpandItemProp]
  );

  const onDrop = useCallback(
    (items, target) => {
      onDropProp?.(items, target);
      setTrees(trees => trees);
    },
    [onDropProp]
  );

  const focusTree = useCallback((treeId: string) => {
    const focusItem = getDocument()?.querySelector(
      `[data-rct-tree="${treeId}"] [data-rct-item-focus="true"]`
    );
    (focusItem as HTMLElement)?.focus?.();
  }, []);

  const setActiveTree = useCallback(
    (treeIdOrSetStateFunction, autoFocusTree = true) => {
      const maybeFocusTree = (treeId: string | undefined) => {
        if (
          autoFocusTree &&
          (autoFocus ?? true) &&
          treeId &&
          !getDocument()
            ?.querySelector(`[data-rct-tree="${treeId}"]`)
            ?.contains(document.activeElement)
        ) {
          focusTree(treeId);
        }
      };

      if (typeof treeIdOrSetStateFunction === 'function') {
        setActiveTreeId(oldValue => {
          const treeId = treeIdOrSetStateFunction(oldValue);

          if (treeId !== oldValue) {
            maybeFocusTree(treeId);
          }

          return treeId;
        });
      } else {
        const treeId = treeIdOrSetStateFunction;
        setActiveTreeId(treeId);
        maybeFocusTree(treeId);
      }
    },
    [autoFocus, focusTree]
  );

  const renderers = useRenderers(props);

  return {
    ...renderers,
    ...props,
    // `items` must come after `...props` to override the raw data-provider
    // items with the effective (search-overlay-merged) items.
    items,
    onFocusItem: onFocusItemHandler,
    registerTree,
    unregisterTree,
    onExpandItem,
    onCollapseItem,
    onDrop,
    setActiveTree,
    treeIds,
    trees,
    activeTreeId,
    linearItems,
    searchResults,
    searchLoading,
    runSearch,
  };
};
