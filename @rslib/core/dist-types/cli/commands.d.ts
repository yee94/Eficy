import type { RsbuildMode } from '@rsbuild/core';
export type CommonOptions = {
    root?: string;
    config?: string;
    envDir?: string;
    envMode?: string;
    lib?: string[];
};
export type BuildOptions = CommonOptions & {
    watch?: boolean;
};
export type InspectOptions = CommonOptions & {
    mode?: RsbuildMode;
    output?: string;
    verbose?: boolean;
};
export declare function runCli(): void;
