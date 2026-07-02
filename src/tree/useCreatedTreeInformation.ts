import { useMemo } from 'react';
import { TreeInformation, TreeItemIndex, TreeProps } from '../types';
import { useTreeEnvironment } from '../controlledEnvironment/ControlledTreeEnvironment';
import { useDragAndDrop } from '../drag/DragAndDropProvider';

export const useCreatedTreeInformation = (
  tree: TreeProps,
  renamingItem: TreeItemIndex | null,
  search: string | null
) => {
  const environment = useTreeEnvironment();
  const dnd = useDragAndDrop();
  const selectedItems = environment.viewState[tree.treeId]?.selectedItems;
  const isSearchLoading = environment.searchLoading?.[tree.treeId] ?? false;
  return useMemo<TreeInformation>(
    () => ({
      isFocused: environment.activeTreeId === tree.treeId,
      isRenaming: !!renamingItem,
      areItemsSelected: (selectedItems?.length ?? 0) > 0,
      isSearching: search !== null,
      isSearchLoading,
      search,
      isProgrammaticallyDragging: dnd.isProgrammaticallyDragging ?? false,
      treeId: tree.treeId,
      rootItem: tree.rootItem,
      treeLabel: tree.treeLabel,
      treeLabelledBy: tree.treeLabelledBy,
    }),
    [
      environment.activeTreeId,
      tree.treeId,
      tree.rootItem,
      tree.treeLabel,
      tree.treeLabelledBy,
      renamingItem,
      selectedItems?.length,
      search,
      isSearchLoading,
      dnd.isProgrammaticallyDragging,
    ]
  );
};
