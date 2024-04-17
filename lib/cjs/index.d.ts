export * from './controlledEnvironment/ControlledTreeEnvironment';
export * from './tree/Tree';
export * from './uncontrolledEnvironment/UncontrolledTreeEnvironment';
export * from './uncontrolledEnvironment/StaticTreeDataProvider';
export * from './types';
export * from './renderers';
export * from './treeItem/useTreeItemRenderContext';
export * from './controlledEnvironment/useControlledTreeEnvironmentProps';
export declare const INTERNALS: {
    TreeItemElement: (props: {
        itemIndex: import("./types").TreeItemIndex;
        depth: number;
    }) => JSX.Element;
    TreeItemChildren: (props: {
        children: import("./types").TreeItemIndex[];
        depth: number;
        parentId: import("./types").TreeItemIndex;
    }) => JSX.Element;
};
