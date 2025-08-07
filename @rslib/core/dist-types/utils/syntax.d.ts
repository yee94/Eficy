import type { EnvironmentConfig, Rspack } from '@rsbuild/core';
import type { FixedEcmaVersions, LatestEcmaVersions, RsbuildConfigOutputTarget, Syntax } from '../types/config';
export declare const LATEST_TARGET_VERSIONS: Record<NonNullable<RsbuildConfigOutputTarget>, string[]>;
/**
 * The esX to browserslist mapping is transformed from esbuild:
 * https://github.com/evanw/esbuild/blob/main/internal/compat/js_table.go
 * It does not completely align with the browserslist query of Rsbuild now:
 * https://github.com/rspack-contrib/browserslist-to-es-version
 * TODO: align with Rsbuild, we may should align with SWC
 */
export declare const ESX_TO_BROWSERSLIST: Record<FixedEcmaVersions, Record<string, string>> & Record<LatestEcmaVersions, (target: RsbuildConfigOutputTarget) => string[]>;
export declare function transformSyntaxToRspackTarget(syntax: Syntax): Rspack.Configuration['target'];
export declare function transformSyntaxToBrowserslist(syntax: Syntax, target: NonNullable<EnvironmentConfig['output']>['target']): NonNullable<NonNullable<EnvironmentConfig['output']>['overrideBrowserslist']>;
