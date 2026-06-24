import * as React from 'react';
import { TreeChangeActions, TreeRef } from '../types';
export declare const useTreeActions: () => TreeChangeActions;
export declare const TreeActionsProvider: React.ForwardRefExoticComponent<{
    children?: React.ReactNode;
} & React.RefAttributes<TreeRef<any>>>;
