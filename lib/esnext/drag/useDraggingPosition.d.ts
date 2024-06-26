import * as React from 'react';
import { DraggingPosition, TreeItem } from '../types';
export declare const useDraggingPosition: () => {
    initiateDraggingPosition: (treeId: string, items: TreeItem[]) => void;
    resetDraggingPosition: () => void;
    draggingItems: TreeItem<any>[] | undefined;
    getDraggingPosition: (e: DragEvent, treeId: string, containerRef: React.MutableRefObject<HTMLElement | undefined>) => DraggingPosition | 'invalid' | undefined;
    itemHeight: React.MutableRefObject<number>;
    itemsHeightArray: React.MutableRefObject<number[]>;
};
