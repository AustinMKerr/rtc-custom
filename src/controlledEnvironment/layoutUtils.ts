import { getDocument } from '../utils';

export const computeItemHeight = (treeId: string) => {
  const firstItem = getDocument()?.querySelector<HTMLElement>(
    `[data-rct-tree="${treeId}"] [data-rct-item-container="true"]`
  );
  return firstItem?.offsetHeight ?? 5;
};

export const computeItemHeightArray = (treeId: string): number[] => {
  const document = getDocument();
  if (!document) {
    return [];
  }
  const items = document.querySelectorAll<HTMLElement>(
    `[data-rct-tree="${treeId}"] [data-rct-item-container="true"]`
  );
  return Array.from(items).map(item => item.offsetHeight);
};

export const isOutsideOfContainer = (e: DragEvent, treeBb: DOMRect) =>
  e.clientX < treeBb.left ||
  e.clientX > treeBb.right ||
  e.clientY < treeBb.top ||
  e.clientY > treeBb.bottom;
