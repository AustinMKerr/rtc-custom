import * as React from 'react';
import { TreeEnvironmentRef } from '../types';
export declare const useEnvironmentActions: () => import("../types").TreeEnvironmentChangeActions;
export declare const EnvironmentActionsProvider: React.ForwardRefExoticComponent<{
    children?: React.ReactNode;
} & React.RefAttributes<TreeEnvironmentRef<any, never>>>;
