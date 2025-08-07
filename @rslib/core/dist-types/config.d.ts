import { type EnvironmentConfig, type RsbuildEntry } from '@rsbuild/core';
import type { AutoExternal, BannerAndFooter, Format, LibConfig, PkgJson, RequireKey, RsbuildConfigEntry, RsbuildConfigWithLibInfo, RslibConfig, RslibConfigAsyncFn, RslibConfigExport, RslibConfigSyncFn } from './types';
/**
 * This function helps you to autocomplete configuration types.
 * It accepts a Rslib config object, or a function that returns a config.
 */
export declare function defineConfig(config: RslibConfig): RslibConfig;
export declare function defineConfig(config: RslibConfigSyncFn): RslibConfigSyncFn;
export declare function defineConfig(config: RslibConfigAsyncFn): RslibConfigAsyncFn;
export declare function defineConfig(config: RslibConfigExport): RslibConfigExport;
export declare function loadConfig({ cwd, path, envMode, }: {
    cwd?: string;
    path?: string;
    envMode?: string;
}): Promise<{
    content: RslibConfig;
    filePath: string;
}>;
export declare const composeAutoExternalConfig: (options: {
    bundle: boolean;
    format: Format;
    autoExternal?: AutoExternal;
    pkgJson?: PkgJson;
    userExternals?: NonNullable<EnvironmentConfig["output"]>["externals"];
}) => EnvironmentConfig;
export declare function composeMinifyConfig(config: LibConfig): EnvironmentConfig;
export declare function composeBannerFooterConfig(banner: BannerAndFooter, footer: BannerAndFooter): EnvironmentConfig;
export declare function composeDecoratorsConfig(compilerOptions?: Record<string, any>, version?: NonNullable<NonNullable<EnvironmentConfig['source']>['decorators']>['version']): EnvironmentConfig;
export declare function createConstantRsbuildConfig(): Promise<EnvironmentConfig>;
export declare const composeModuleImportWarn: (request: string, issuer: string) => string;
export declare const resolveEntryPath: (entries: RsbuildConfigEntry, root: string) => RsbuildEntry;
export declare function composeCreateRsbuildConfig(rslibConfig: RslibConfig): Promise<RsbuildConfigWithLibInfo[]>;
export declare function composeRsbuildEnvironments(rslibConfig: RslibConfig): Promise<{
    environments: Record<string, EnvironmentConfig>;
    environmentWithInfos: RequireKey<RsbuildConfigWithLibInfo, 'id'>[];
}>;
export declare const pruneEnvironments: (environments: Record<string, EnvironmentConfig>, libs?: string[]) => Record<string, EnvironmentConfig>;
