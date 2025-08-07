import { type Rspack } from '@rsbuild/core';
export declare const PUBLIC_PATH_PLACEHOLDER = "__RSLIB_SVGR_AUTO_PUBLIC_PATH__";
export declare class LibSvgrPatchPlugin implements Rspack.RspackPluginInstance {
    readonly name: string;
    apply(compiler: Rspack.Compiler): void;
}
