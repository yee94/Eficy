import type { RsbuildPlugins } from '@rsbuild/core';
import type { Format, LibConfig, PkgJson } from '../types';
/**
 * Node.js built-in modules.
 * Copied from https://github.com/webpack/webpack/blob/dd44b206a9c50f4b4cb4d134e1a0bd0387b159a3/lib/node/NodeTargetPlugin.js#L12-L72
 */
export declare const nodeBuiltInModules: Array<string | RegExp>;
export declare function calcLongestCommonPath(absPaths: string[]): Promise<string | null>;
export declare function getAbsolutePath(base: string, filepath: string): string;
export declare const readPackageJson: (rootPath: string) => undefined | PkgJson;
export declare const isObject: (obj: unknown) => obj is Record<string, any>;
export declare const isEmptyObject: (obj: object) => boolean;
export declare function pick<T, U extends keyof T>(obj: T, keys: ReadonlyArray<U>): Pick<T, U>;
export declare function omit<T extends object, U extends keyof T>(obj: T, keysObj: Record<U, boolean>): Omit<T, keyof U>;
export declare function isPluginIncluded(pluginName: string, plugins?: RsbuildPlugins): boolean;
export declare function checkMFPlugin(config: LibConfig, sharedPlugins?: RsbuildPlugins): boolean;
export declare function debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * Check if running in a TTY context
 */
export declare const isTTY: (type?: "stdin" | "stdout") => boolean;
export declare const isIntermediateOutputFormat: (format: Format) => boolean;
export declare function normalizeSlash(p: string): string;
