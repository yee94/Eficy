import type { CSSLoaderOptions } from '@rsbuild/core';
export type CssLoaderOptionsAuto = CSSLoaderOptions['modules'] extends infer T ? T extends {
    auto?: any;
} ? T['auto'] : never : never;
/**
 * This function is copied from
 * https://github.com/webpack-contrib/mini-css-extract-plugin/blob/3effaa0319bad5cc1bf0ae760553bf7abcbc35a4/src/utils.js#L169
 * linted by biome
 */
export declare function getUndoPath(filename: string, outputPathArg: string, enforceRelative: boolean): string;
export declare function isCssFile(filepath: string): boolean;
export declare function parsePathQueryFragment(str: string): {
    path: string;
    query: string;
    fragment: string;
};
export declare function isCssModulesFile(filepath: string, auto: CssLoaderOptionsAuto): boolean;
export declare function isCssGlobalFile(filepath: string, auto: CssLoaderOptionsAuto): boolean;
